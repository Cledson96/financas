import { prisma } from "@/lib/prisma";
import {
  DashboardData,
  Transaction,
  Account,
  Category,
  Invoice,
  User,
} from "@/types/finance";
import {
  startOfMonth,
  endOfMonth,
  subMonths,
  format,
  isBefore,
} from "date-fns";
import { ptBR } from "date-fns/locale";

// Helper to handle Decimal types from Prisma
// Prisma Decimal often behaves like an object that needs conversion.
const toNumber = (val: any): number => {
  if (!val) return 0;
  if (typeof val === "number") return val;
  if (typeof val.toNumber === "function") return val.toNumber();
  return Number(val) || 0;
};

export async function getDashboardData(): Promise<DashboardData> {
  const currentMonth = new Date();
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);

  // 1. Fetch Users
  const usersRaw = await prisma.user.findMany();
  const users: User[] = usersRaw.map((u) => ({
    id: u.id,
    name: u.name,
    email: u.email,
  }));

  // 2. Fetch Accounts
  const accountsRaw = await prisma.account.findMany({
    include: {
      Invoice: {
        where: { status: "OPEN" },
      },
    },
  });

  // 3. Fetch Transactions
  const evolutionStartDate = startOfMonth(subMonths(currentMonth, 5));

  const transactionsRaw = await prisma.transaction.findMany({
    where: {
      purchaseDate: {
        gte: evolutionStartDate,
      },
    },
    include: {
      Category: true,
      Account: true,
      Invoice: true,
      User_Transaction_payerIdToUser: true,
    },
    orderBy: {
      purchaseDate: "desc",
    },
  });

  // --- SERIALIZATION (Strict Mapping) ---
  // We avoid '...spread' to prevent leaking non-serializable Decimal objects

  const mapInvoice = (i: any): Invoice => ({
    id: i.id,
    month: i.month,
    year: i.year,
    dueDate: i.dueDate,
    closingDate: i.closingDate,
    status: i.status,
    amount: toNumber(i.amount),
    accountId: i.accountId,
  });

  const accounts: Account[] = accountsRaw.map((a) => ({
    id: a.id,
    name: a.name,
    type: a.type,
    bankName: a.bankName,
    balance: toNumber(a.balance),
    limit: toNumber(a.limit),
    dueDay: a.dueDay,
    closingDay: a.closingDay,
    userId: a.userId,
    Invoice: a.Invoice ? a.Invoice.map(mapInvoice) : [],
  }));

  const mapCategory = (c: any): Category => ({
    id: c.id,
    name: c.name,
    type: c.type,
    icon: c.icon,
  });

  const mapUser = (u: any): User => ({
    id: u.id,
    name: u.name,
    email: u.email,
  });

  const transactions: Transaction[] = transactionsRaw.map((t) => ({
    id: t.id,
    description: t.description,
    originalDesc: t.originalDesc,
    amount: toNumber(t.amount),
    purchaseDate: t.purchaseDate,
    paymentDate: t.paymentDate,
    type: t.type,
    installment: t.installment,
    totalInstallments: t.totalInstallments,
    installmentId: t.installmentId,
    isReconciled: t.isReconciled,
    isManual: t.isManual,
    settled: t.settled,
    categoryId: t.categoryId,
    accountId: t.accountId,
    invoiceId: t.invoiceId,
    payerId: t.payerId,
    splitType: t.splitType,
    ownerId: t.ownerId,

    // Relations
    Category: t.Category ? mapCategory(t.Category) : undefined,
    Account: t.Account
      ? ({
          // Minimal Account details needed for Transaction display if any
          // To avoid circular or deep structure, just basic mapping if needed
          id: t.Account.id,
          name: t.Account.name,
          type: t.Account.type,
          balance: toNumber(t.Account.balance),
          // Simplified
        } as any)
      : undefined, // Cast as any or map properly if Transaction.Account needs full type
    Invoice: t.Invoice ? mapInvoice(t.Invoice) : undefined,
    payer: t.User_Transaction_payerIdToUser
      ? mapUser(t.User_Transaction_payerIdToUser)
      : undefined,
  }));

  // --- CALCULATIONS ---

  // 1. Total Balance
  const totalBalance = accounts
    .filter((a) => a.type === "CHECKING_ACCOUNT" || a.type === "CASH")
    .reduce((sum, a) => sum + a.balance, 0);

  // 2. Current Month Expenses
  const currentMonthExpenses = transactions
    .filter(
      (t) =>
        t.type === "EXPENSE" &&
        t.purchaseDate >= monthStart &&
        t.purchaseDate <= monthEnd,
    )
    .reduce((sum, t) => sum + t.amount, 0);

  // 3. Open Invoices
  const openInvoices = accounts
    .filter((a) => a.type === "CREDIT_CARD")
    .reduce((sum, a) => {
      const openInvoiceAmount =
        a.Invoice?.reduce((invSum, inv) => invSum + inv.amount, 0) || 0;
      return sum + openInvoiceAmount;
    }, 0);

  // 4. Overdue Count
  const overdueCount = transactions.filter((t) => {
    if (t.settled) return false;
    if (t.paymentDate && isBefore(t.paymentDate, new Date())) {
      return true;
    }
    return false;
  }).length;

  // 5. Settlement
  let settlement = {
    amount: 0,
    debtorName: null as string | null,
    creditorName: null as string | null,
  };

  if (users.length >= 2) {
    const expensesByUser: Record<string, number> = {};

    transactions
      .filter(
        (t) =>
          t.splitType === "SHARED" &&
          t.purchaseDate >= monthStart &&
          t.purchaseDate <= monthEnd,
      )
      .forEach((t) => {
        const payerId = t.payerId;
        expensesByUser[payerId] = (expensesByUser[payerId] || 0) + t.amount;
      });

    const userA = users[0];
    const userB = users[1];

    if (userA && userB) {
      const paidA = expensesByUser[userA.id] || 0;
      const paidB = expensesByUser[userB.id] || 0;
      const diff = paidA - paidB;
      const halfDiff = Math.abs(diff) / 2;

      if (diff > 0) {
        settlement = {
          amount: halfDiff,
          debtorName: userB.name,
          creditorName: userA.name,
        };
      } else if (diff < 0) {
        settlement = {
          amount: halfDiff,
          debtorName: userA.name,
          creditorName: userB.name,
        };
      }
    }
  }

  // 6. Charts Data
  const expensesByCategory: Record<string, number> = {};
  transactions
    .filter(
      (t) =>
        t.type === "EXPENSE" &&
        t.purchaseDate >= monthStart &&
        t.purchaseDate <= monthEnd,
    )
    .forEach((t) => {
      const catName = t.Category?.name || "Outros";
      expensesByCategory[catName] =
        (expensesByCategory[catName] || 0) + t.amount;
    });

  const categoryExpenses = Object.entries(expensesByCategory)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 8);

  const evolutionData = [];
  for (let i = 5; i >= 0; i--) {
    const date = subMonths(currentMonth, i);
    const mStart = startOfMonth(date);
    const mEnd = endOfMonth(date);

    const mExpenses = transactions
      .filter(
        (t) =>
          t.type === "EXPENSE" &&
          t.purchaseDate >= mStart &&
          t.purchaseDate <= mEnd,
      )
      .reduce((sum, t) => sum + t.amount, 0);

    const mIncome = transactions
      .filter(
        (t) =>
          t.type === "INCOME" &&
          t.purchaseDate >= mStart &&
          t.purchaseDate <= mEnd,
      )
      .reduce((sum, t) => sum + t.amount, 0);

    evolutionData.push({
      month: format(date, "MMM", { locale: ptBR }),
      expenses: mExpenses,
      income: mIncome,
    });
  }

  const allCategoriesRaw = await prisma.category.findMany();
  const categories = allCategoriesRaw.map(mapCategory);

  return {
    metrics: {
      totalBalance,
      currentMonthExpenses,
      openInvoices,
      overdueCount,
      settlement,
    },
    recentTransactions: transactions.slice(0, 10),
    categoryExpenses,
    evolutionData,
    accounts,
    categories,
    users,
  };
}
