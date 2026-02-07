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

export async function getDashboardData(
  month?: number,
  year?: number,
): Promise<DashboardData> {
  const now = new Date();
  const targetDate =
    month !== undefined && year !== undefined
      ? new Date(year, month - 1, 1) // month is 1-indexed in UI usually, but 0-indexed in JS
      : now;

  const monthStart = startOfMonth(targetDate);
  const monthEnd = endOfMonth(targetDate);

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
  // We fetch enough history for evolution, but we need to filter carefully for checking month
  const evolutionStartDate = startOfMonth(subMonths(targetDate, 5));

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
    splitShare: t.splitShare ? toNumber(t.splitShare) : null,
    ownerId: t.ownerId,

    // Relations
    Category: t.Category ? mapCategory(t.Category) : undefined,
    Account: t.Account
      ? ({
          id: t.Account.id,
          name: t.Account.name,
          type: t.Account.type,
          balance: toNumber(t.Account.balance),
        } as any)
      : undefined,
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

  // 3. Open Invoices (Sum of all OPEN invoices)
  const openInvoices = accounts
    .filter((a) => a.type === "CREDIT_CARD")
    .reduce((sum, a) => {
      const openInvoiceAmount =
        a.Invoice?.reduce((invSum, inv) => invSum + inv.amount, 0) || 0;
      return sum + openInvoiceAmount;
    }, 0);

  // 3b. Next Invoice (Urgency)
  let nextInvoice = null;
  // We need to fetch ALL open invoices properly or search through what we have.
  // We loaded accounts.Invoice (status=OPEN). Let's find the earliest due date.
  const allOpenInvoices = accounts
    .flatMap((a) =>
      (a.Invoice || []).map((inv) => ({ ...inv, bankName: a.bankName })),
    )
    .sort((a, b) => a.dueDate.getTime() - b.dueDate.getTime());

  if (allOpenInvoices.length > 0) {
    const next = allOpenInvoices[0];
    const daysUntil = Math.ceil(
      (next.dueDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24),
    );
    nextInvoice = {
      amount: next.amount,
      dueDate: next.dueDate,
      bankName: next.bankName || "Cartão",
      daysUntilDue: daysUntil,
    };
  }

  // 4. Overdue Count
  // Only count overdue if it's NOT a credit card expense (those are handled via Invoices)
  // Or if it IS a credit card expense but manual? Usually transactions are just records.
  // Overdue usually implies "Bill to pay" -> Type EXPENSE && !settled && paymentDate < now.
  const overdueCount = transactions.filter((t) => {
    if (t.type !== "EXPENSE") return false;
    if (t.settled) return false;
    // If it has an invoice, it's not "overdue" as a transaction, the Invoice might be.
    if (t.invoiceId) return false;
    if (t.paymentDate && isBefore(t.paymentDate, new Date())) {
      return true;
    }
    return false;
  }).length;

  // 5. Settlement (Detailed)
  const settlement = {
    total: 0,
    debtorName: null as string | null,
    creditorName: null as string | null,
    breakdown: {
      sharedFiftyFifty: 0,
      sharedProportional: 0,
      individualPaidByOther: 0,
    },
  };

  if (users.length >= 2) {
    const userA = users[0];
    const userB = users[1]; // We need stable ordering. Usually ID or CreatedAt.
    // Ensure logical ordering for consistency (e.g. alphabetical or specific ID)
    // For now, assuming users[0] is one and users[1] is the other.

    /*
      Balances represent "How much User B owes User A".
      Positive = User B owes User A.
      Negative = User A owes User B.
    */
    let net5050 = 0;
    let netProp = 0;
    let netIndiv = 0;
    let netTransfer = 0;

    const settlementTransactions = transactions.filter(
      (t) => t.purchaseDate >= monthStart && t.purchaseDate <= monthEnd,
    );

    settlementTransactions.forEach((t) => {
      const isUserAPayer = t.payerId === userA.id;
      const amount = t.amount;

      // Filter out payments (paying a bill is not a debt creation between couple usually,
      // unless it's paying the OTHER person's bill. But logic below handles 'payerId'.
      // If I pay a bill, money left my account. If that bill was Shared, you owe me half.)
      // So yes, EXPENSE and PAYMENT (if manually tracked) count.
      // But Transfers are special.

      if (t.type === "TRANSFER") {
        // If A transfers to B, A is paying B.
        // If B owes A (Positive Net), A paying B reduces the debt (Decreases Net).
        if (isUserAPayer) {
          netTransfer -= amount;
        } else {
          netTransfer += amount;
        }
        return;
      }

      if (t.type === "INCOME") return; // Income doesn't usually create debt unless shared?
      // "Acerto de Contas" logic usually revolves around expenses.

      if (t.splitType === "SHARED") {
        // A paid 100. Shared. B owes 50. Net += 50.
        // B paid 100. Shared. A owes 50. Net -= 50.
        if (isUserAPayer) {
          net5050 += amount / 2;
        } else {
          net5050 -= amount / 2;
        }
      } else if (t.splitType === "INDIVIDUAL") {
        // If A paid for B's item. B owes full amount. Net += amount.
        // If A paid for A's item. No debt.
        if (isUserAPayer && t.ownerId === userB.id) {
          netIndiv += amount;
        } else if (!isUserAPayer && t.ownerId === userA.id) {
          // B paid for A. A owes B. Net -= amount.
          netIndiv -= amount;
        }
      } else if (t.splitType === "SHARED_PROPORTIONAL") {
        // splitShare is "Amount the OTHER person pays".
        // If A paid 100, and splitShare is 0.4 (B pays 40%). B owes 40. Net += 40.
        // If null, assume 0.5? Or 0? Let's safeguard to 0.5 or 0.
        const share = t.splitShare ?? 0.5;

        if (isUserAPayer) {
          netProp += amount * share;
        } else {
          // B paid 100. splitShare 0.4 (A pays 40%? Or does splitShare always refer to "Partner"?
          // Database.md says: "A porcentagem que cabe ao OUTRO pagar".
          // So if B paid, "Outro" is A. A pays 0.4.
          netProp -= amount * share;
        }
      }
    });

    const totalNet = net5050 + netProp + netIndiv + netTransfer;

    if (totalNet > 0) {
      settlement.debtorName = userB.name;
      settlement.creditorName = userA.name; // A is positive
      settlement.total = totalNet;
      settlement.breakdown = {
        sharedFiftyFifty: net5050,
        sharedProportional: netProp,
        individualPaidByOther: netIndiv,
      };
    } else {
      settlement.debtorName = userA.name;
      settlement.creditorName = userB.name;
      settlement.total = Math.abs(totalNet);

      // Breakdown usually implies "Why do I owe?".
      // If A owes B (Negative Net), we show the components as positive debts from A's perspective?
      // Or just raw values?
      // Let's keep signs consistent or flip them?
      // If A owes, we probably want to show "50/50: X, Prop: Y".
      // Since all nets are negative, we abs them.
      settlement.breakdown = {
        sharedFiftyFifty: Math.abs(net5050),
        sharedProportional: Math.abs(netProp),
        individualPaidByOther: Math.abs(netIndiv),
      };
    }
  }

  // 5b. Fairness Calculation
  // Who paid what vs Who SHOULD have paid what
  const fairness = {
    userA: { name: users[0]?.name || "A", paid: 0, shouldHavePaid: 0 },
    userB: { name: users[1]?.name || "B", paid: 0, shouldHavePaid: 0 },
  };

  if (users.length >= 2) {
    const userA = users[0];
    const userB = users[1];

    transactions
      .filter(
        (t) =>
          (t.splitType === "SHARED" || t.splitType === "SHARED_PROPORTIONAL") &&
          t.purchaseDate >= monthStart &&
          t.purchaseDate <= monthEnd,
      )
      .forEach((t) => {
        const amount = t.amount;
        const isUserAPayer = t.payerId === userA.id;

        // Actual Paid
        if (isUserAPayer) fairness.userA.paid += amount;
        else fairness.userB.paid += amount;

        // Target (Should Have Paid)
        if (t.splitType === "SHARED") {
          fairness.userA.shouldHavePaid += amount / 2;
          fairness.userB.shouldHavePaid += amount / 2;
        } else if (t.splitType === "SHARED_PROPORTIONAL") {
          // splitShare is "Amount the OTHER person pays".
          // If Payer is A, splitShare (e.g. 0.4) is B's share. A pays 0.6.
          // If Payer is B, splitShare (e.g. 0.4) is A's share. B pays 0.6.
          // Wait, splitShare should be tied to specific users, usually.
          // Data model says: "share that fits the OTHER to pay".
          // Implementation detail: Does splitShare assume a specific direction?
          // "Se Cledson pagou: Kevellyn deve splitShare".
          // "Se Kevellyn pagou: Cledson deve splitShare".
          // This implies splitShare is always "Partner Share relative to Payer".
          // But what if splitShare is fixed (e.g. A always pays 60%)?
          // database.md says: "HouseholdConfig... partner1Share... Ao criar SHARED_PROPORTIONAL... preenche splitShare".
          // So if `partner1Share` is 0.6 (A pays 60%).
          // If A pays: B owes 0.4. `splitShare` = 0.4.
          // If B pays: A owes 0.6. `splitShare` = 0.6.
          // So `splitShare` value DEPENDS on who paid?
          // If so, my logic assumes correct input.
          // Let's assume standard behavior:
          // Target is based on "Who SHOULD pay".
          // If `splitShare` is stored on transaction, it defines "Debt".
          // Cost = Paid - Debt (if payer) OR Debt (if non-payer).

          const share = t.splitShare ?? 0.5;

          if (isUserAPayer) {
            // A paid. B owes `share` (e.g. 0.4).
            // A cost = 0.6 (1-share).
            fairness.userB.shouldHavePaid += amount * share;
            fairness.userA.shouldHavePaid += amount * (1 - share);
          } else {
            // B paid. A owes `share` (e.g. 0.6).
            // B cost = 0.4 (1-share).
            fairness.userA.shouldHavePaid += amount * share;
            fairness.userB.shouldHavePaid += amount * (1 - share);
          }
        }
      });
  }

  // 6. Charts Data (Filtered by month/year)
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
    const date = subMonths(targetDate, i);
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
      nextInvoice,
      fairness,
    },
    recentTransactions: transactions.slice(0, 10),
    categoryExpenses,
    evolutionData,
    accounts,
    categories,
    users,
  };
}
