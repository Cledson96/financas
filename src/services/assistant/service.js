import { prisma } from "@/lib/prisma";
import {
  buildRecurringBillDraft,
  normalizeOwnership,
  resolveBillStatus,
  summarizeCreditCardLimit,
  summarizeHouseholdContributions,
} from "./domain.js";

const round2 = (value) => Math.round((Number(value) || 0) * 100) / 100;
const toDate = (value) => (value ? new Date(value) : null);

function ensureString(value, fieldName) {
  if (!value || typeof value !== "string") {
    throw new Error(`${fieldName} is required`);
  }
  return value;
}

function optionalString(value) {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function ensureNumber(value, fieldName) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) {
    throw new Error(`${fieldName} must be a valid number`);
  }
  return parsed;
}

function serializeDecimal(value) {
  if (value === null || value === undefined) return null;
  if (typeof value === "number") return value;
  if (typeof value?.toNumber === "function") return value.toNumber();
  return Number(value);
}

function serializeAccount(account) {
  return {
    ...account,
    balance: serializeDecimal(account.balance),
    limit: serializeDecimal(account.limit),
  };
}

function serializeCategory(category) {
  return {
    ...category,
  };
}

function serializeFixedExpense(item) {
  return {
    ...item,
    amount: serializeDecimal(item.amount),
  };
}

function serializeBill(bill) {
  return {
    ...bill,
    amount: serializeDecimal(bill.amount),
    splitShare: serializeDecimal(bill.splitShare),
  };
}

function serializeTransaction(transaction) {
  return {
    ...transaction,
    amount: serializeDecimal(transaction.amount),
    splitShare: serializeDecimal(transaction.splitShare),
  };
}

async function findDefaultPaymentCategory() {
  return prisma.category.findFirst({
    where: {
      type: "PAYMENT",
      name: {
        in: ["Pagamento Fatura", "Cartão"],
      },
    },
    orderBy: { name: "asc" },
  });
}

export async function getAssistantContext() {
  const [users, household, accounts, categories, fixedExpenses] = await Promise.all([
    prisma.user.findMany({
      where: { isActive: true },
      orderBy: { name: "asc" },
    }),
    prisma.householdConfig.findFirst({
      where: { isActive: true },
      include: {
        User_HouseholdConfig_partner1IdToUser: true,
        User_HouseholdConfig_partner2IdToUser: true,
      },
    }),
    prisma.account.findMany({
      where: { isActive: true },
      include: { User: true },
      orderBy: [{ type: "asc" }, { name: "asc" }],
    }),
    prisma.category.findMany({
      orderBy: [{ type: "asc" }, { name: "asc" }],
    }),
    prisma.fixedExpense.findMany({
      where: { active: true },
      include: { Category: true, User: true },
      orderBy: [{ dueDay: "asc" }, { description: "asc" }],
    }),
  ]);

  return {
    users,
    household,
    accounts: accounts.map(serializeAccount),
    categories: categories.map(serializeCategory),
    fixedExpenses: fixedExpenses.map(serializeFixedExpense),
  };
}

export async function createAssistantTransaction(payload, actor = "assistant") {
  const description = ensureString(payload.description, "description");
  const purchaseDate = toDate(payload.purchaseDate) || new Date();
  const amount = ensureNumber(payload.amount, "amount");
  const type = ensureString(payload.type, "type");
  const categoryId = ensureString(payload.categoryId, "categoryId");
  const accountId = ensureString(payload.accountId, "accountId");
  const payerId = ensureString(payload.payerId, "payerId");
  const splitType = payload.splitType || "INDIVIDUAL";
  const ownership = normalizeOwnership({
    splitType,
    payerId,
    ownerId: payload.ownerId || null,
  });

  const transaction = await prisma.transaction.create({
    data: {
      id: crypto.randomUUID(),
      description,
      originalDesc: optionalString(payload.originalDesc),
      amount,
      purchaseDate,
      paymentDate: toDate(payload.paymentDate),
      type,
      categoryId,
      accountId,
      payerId,
      ownerId: ownership.ownerId,
      splitType: ownership.splitType,
      splitShare: payload.splitShare ?? null,
      invoiceId: payload.invoiceId || null,
      installment: payload.installment || 1,
      totalInstallments: payload.totalInstallments || 1,
      settled: Boolean(payload.settled),
      receiverAccountId: payload.receiverAccountId || null,
      isArchived: false,
      updatedAt: new Date(),
      status: payload.status || "POSTED",
      source: payload.source || "ASSISTANT",
      createdByUserId: payload.createdByUserId || null,
      createdByAgent: actor,
      isHousehold: ownership.isHousehold,
      notes: optionalString(payload.notes),
      metadata: payload.metadata || null,
    },
    include: {
      Category: true,
      Account: true,
      User_Transaction_payerIdToUser: true,
      User_Transaction_ownerIdToUser: true,
      Invoice: true,
      Bill: true,
    },
  });

  return serializeTransaction(transaction);
}

export async function listAssistantTransactions({ limit = 20 } = {}) {
  const transactions = await prisma.transaction.findMany({
    include: {
      Category: true,
      Account: true,
      User_Transaction_payerIdToUser: true,
      User_Transaction_ownerIdToUser: true,
      Invoice: true,
      Bill: true,
    },
    orderBy: [{ purchaseDate: "desc" }, { createdAt: "desc" }],
    take: limit,
  });

  return transactions.map(serializeTransaction);
}

export async function createAssistantBill(payload, actor = "assistant") {
  const description = ensureString(payload.description, "description");
  const amount = ensureNumber(payload.amount, "amount");
  const dueDate = toDate(payload.dueDate);
  if (!dueDate) throw new Error("dueDate is required");

  const payerId = payload.payerId || null;
  const splitType = payload.splitType || "INDIVIDUAL";
  const ownership = payerId
    ? normalizeOwnership({ splitType, payerId, ownerId: payload.ownerId || null })
    : {
        splitType,
        payerId: null,
        ownerId: splitType === "INDIVIDUAL" ? payload.ownerId || null : null,
        isHousehold: splitType !== "INDIVIDUAL",
      };

  const bill = await prisma.bill.create({
    data: {
      id: crypto.randomUUID(),
      description,
      amount,
      kind: payload.kind || "ONE_TIME_BILL",
      status: resolveBillStatus({
        status: payload.status || "PENDING",
        dueDate,
        paidAt: payload.paidAt || null,
      }),
      issueDate: toDate(payload.issueDate),
      dueDate,
      paidAt: toDate(payload.paidAt),
      competencyDate: toDate(payload.competencyDate),
      categoryId: payload.categoryId || null,
      accountId: payload.accountId || null,
      invoiceId: payload.invoiceId || null,
      fixedExpenseId: payload.fixedExpenseId || null,
      payerId: ownership.payerId,
      ownerId: ownership.ownerId,
      splitType: ownership.splitType,
      splitShare: payload.splitShare ?? null,
      isHousehold: ownership.isHousehold,
      source: payload.source || "ASSISTANT",
      createdByUserId: payload.createdByUserId || null,
      createdByAgent: actor,
      notes: optionalString(payload.notes),
      metadata: payload.metadata || null,
      installmentNumber: payload.installmentNumber || null,
      installmentTotal: payload.installmentTotal || null,
      installmentGroupId: payload.installmentGroupId || null,
      creditorName: payload.creditorName || null,
      isRecurringInstance: Boolean(payload.isRecurringInstance),
      linkedTransactionId: payload.linkedTransactionId || null,
      updatedAt: new Date(),
    },
    include: {
      Category: true,
      Account: true,
      FixedExpense: true,
      Invoice: true,
      Transaction: true,
      User_Bill_payerIdToUser: true,
      User_Bill_ownerIdToUser: true,
    },
  });

  return serializeBill(bill);
}

/**
 * @param {{ status?: string, dueBefore?: string | Date, overdueOnly?: boolean, limit?: number }} options
 */
export async function listBills({
  status,
  dueBefore,
  overdueOnly = false,
  limit = 100,
} = {}) {
  const now = new Date();
  const where = {};

  if (status) where.status = status;
  if (dueBefore) {
    where.dueDate = { lte: new Date(dueBefore) };
  }
  if (overdueOnly) {
    where.dueDate = { lte: now };
    where.status = { in: ["PENDING", "OVERDUE", "PARTIALLY_PAID"] };
  }

  const bills = await prisma.bill.findMany({
    where,
    include: {
      Category: true,
      Account: true,
      FixedExpense: true,
      Invoice: true,
      Transaction: true,
      User_Bill_payerIdToUser: true,
      User_Bill_ownerIdToUser: true,
    },
    orderBy: [{ dueDate: "asc" }, { createdAt: "desc" }],
    take: limit,
  });

  return bills.map((bill) => ({
    ...serializeBill(bill),
    computedStatus: resolveBillStatus({
      status: bill.status,
      dueDate: bill.dueDate,
      paidAt: bill.paidAt,
    }),
  }));
}

export async function payBill(id, payload, actor = "assistant") {
  const bill = await prisma.bill.findUnique({ where: { id } });
  if (!bill) throw new Error("Bill not found");

  const paymentDate = toDate(payload.paymentDate) || new Date();
  const accountId = payload.accountId || bill.accountId;
  if (!accountId) throw new Error("accountId is required to pay a bill");

  let categoryId = bill.categoryId;
  let type = bill.kind === "CREDIT_CARD_BILL" ? "PAYMENT" : "EXPENSE";

  if (!categoryId && type === "PAYMENT") {
    const paymentCategory = await findDefaultPaymentCategory();
    categoryId = paymentCategory?.id || null;
  }

  if (!categoryId) {
    throw new Error("categoryId is required to create the payment transaction");
  }

  const payerId = payload.payerId || bill.payerId || payload.createdByUserId;
  if (!payerId) throw new Error("payerId is required to pay a bill");

  const transaction = await createAssistantTransaction(
    {
      description: payload.description || bill.description,
      amount: serializeDecimal(bill.amount),
      purchaseDate: paymentDate,
      paymentDate,
      type,
      categoryId,
      accountId,
      payerId,
      ownerId: bill.ownerId,
      splitType: bill.splitType,
      splitShare: serializeDecimal(bill.splitShare),
      status: "POSTED",
      source: "ASSISTANT",
      createdByUserId: payload.createdByUserId || bill.createdByUserId,
      notes: payload.notes || `Pagamento da obrigação ${bill.description}`,
      metadata: {
        billId: bill.id,
        billKind: bill.kind,
      },
      settled: true,
    },
    actor,
  );

  const updatedBill = await prisma.bill.update({
    where: { id: bill.id },
    data: {
      status: "PAID",
      paidAt: paymentDate,
      linkedTransactionId: transaction.id,
      accountId,
      payerId,
      updatedAt: new Date(),
    },
    include: {
      Category: true,
      Account: true,
      FixedExpense: true,
      Invoice: true,
      Transaction: true,
      User_Bill_payerIdToUser: true,
      User_Bill_ownerIdToUser: true,
    },
  });

  return {
    bill: serializeBill(updatedBill),
    transaction,
  };
}

function buildDueDate(year, month, dueDay) {
  return new Date(Date.UTC(year, month - 1, dueDay, 12, 0, 0));
}

export async function generateRecurringBills({ month, year, actor = "assistant" }) {
  if (!month || !year) throw new Error("month and year are required");

  const fixedExpenses = await prisma.fixedExpense.findMany({
    where: { active: true, autoGenerateBill: true },
    orderBy: [{ dueDay: "asc" }, { description: "asc" }],
  });

  const created = [];
  for (const fixedExpense of fixedExpenses) {
    const competencyDate = new Date(Date.UTC(year, month - 1, 1, 12, 0, 0));
    const dueDate = buildDueDate(year, month, fixedExpense.dueDay);
    const existing = await prisma.bill.findFirst({
      where: {
        fixedExpenseId: fixedExpense.id,
        competencyDate,
      },
    });

    if (existing) continue;

    const draft = buildRecurringBillDraft({
      fixedExpense: {
        id: fixedExpense.id,
        description: fixedExpense.description,
        amount: serializeDecimal(fixedExpense.amount),
        categoryId: fixedExpense.categoryId,
        splitType: fixedExpense.splitType,
        ownerId: fixedExpense.ownerId,
        isHousehold: fixedExpense.isHousehold,
        defaultAccountId: fixedExpense.defaultAccountId,
        notes: fixedExpense.notes,
      },
      dueDate,
      source: "RECURRING",
    });

    const bill = await prisma.bill.create({
      data: {
        id: crypto.randomUUID(),
        ...draft,
        competencyDate,
        createdByUserId: fixedExpense.createdByUserId,
        createdByAgent: fixedExpense.createdByAgent || actor,
        updatedAt: new Date(),
      },
      include: {
        Category: true,
        Account: true,
        FixedExpense: true,
        Invoice: true,
        Transaction: true,
      },
    });

    created.push(serializeBill(bill));
  }

  return created;
}

export async function createAssistantFixedExpense(payload, actor = "assistant") {
  const description = ensureString(payload.description, "description");
  const amount = ensureNumber(payload.amount, "amount");
  const dueDay = Number(payload.dueDay);
  if (!Number.isInteger(dueDay) || dueDay < 1 || dueDay > 31) {
    throw new Error("dueDay must be between 1 and 31");
  }

  const splitType = payload.splitType || "SHARED";
  const fixedExpense = await prisma.fixedExpense.create({
    data: {
      id: crypto.randomUUID(),
      description,
      amount,
      dueDay,
      categoryId: ensureString(payload.categoryId, "categoryId"),
      splitType,
      ownerId: splitType === "INDIVIDUAL" ? payload.ownerId || null : null,
      active: payload.active ?? true,
      frequency: payload.frequency || "MONTHLY",
      startDate: toDate(payload.startDate),
      endDate: toDate(payload.endDate),
      defaultAccountId: payload.defaultAccountId || null,
      isHousehold: splitType !== "INDIVIDUAL",
      autoGenerateBill: payload.autoGenerateBill ?? true,
      autoGenerateTransaction: payload.autoGenerateTransaction ?? false,
      leadDays: payload.leadDays ?? 3,
      notes: optionalString(payload.notes),
      createdByUserId: payload.createdByUserId || null,
      createdByAgent: actor,
      updatedAt: new Date(),
    },
    include: {
      Category: true,
      User: true,
    },
  });

  return serializeFixedExpense(fixedExpense);
}

export async function listActiveFixedExpenses() {
  const fixedExpenses = await prisma.fixedExpense.findMany({
    where: { active: true },
    include: {
      Category: true,
      User: true,
    },
    orderBy: [{ dueDay: "asc" }, { description: "asc" }],
  });

  return fixedExpenses.map(serializeFixedExpense);
}

export async function listCardLimits() {
  const cards = await prisma.account.findMany({
    where: {
      type: "CREDIT_CARD",
      isActive: true,
    },
    include: {
      Invoice: {
        where: {
          status: "OPEN",
        },
      },
      Transaction: {
        where: {
          type: {
            in: ["EXPENSE", "PAYMENT"],
          },
          isArchived: false,
        },
      },
      User: true,
    },
    orderBy: { name: "asc" },
  });

  return cards.map((card) => {
    const openInvoiceAmount = round2(
      card.Invoice.reduce((sum, invoice) => sum + serializeDecimal(invoice.amount), 0),
    );
    const currentCycleExpenses = card.Transaction.filter(
      (transaction) => transaction.type === "EXPENSE" && !transaction.invoiceId,
    ).map((transaction) => serializeDecimal(transaction.amount));

    const summary = summarizeCreditCardLimit({
      creditLimit: serializeDecimal(card.limit) || 0,
      postedExpenses: [openInvoiceAmount, ...currentCycleExpenses],
      payments: [],
    });

    return {
      ...serializeAccount(card),
      owner: card.User,
      openInvoiceAmount,
      ...summary,
    };
  });
}

export async function getHouseholdContributions({ month, year }) {
  const household = await prisma.householdConfig.findFirst({
    where: { isActive: true },
    include: {
      User_HouseholdConfig_partner1IdToUser: true,
      User_HouseholdConfig_partner2IdToUser: true,
    },
  });

  if (!household) {
    throw new Error("Household configuration not found");
  }

  const start = new Date(Date.UTC(year, month - 1, 1, 0, 0, 0));
  const end = new Date(Date.UTC(year, month, 0, 23, 59, 59));
  const transactions = await prisma.transaction.findMany({
    where: {
      purchaseDate: {
        gte: start,
        lte: end,
      },
      isArchived: false,
    },
    orderBy: { purchaseDate: "desc" },
  });

  const summary = summarizeHouseholdContributions({
    partner1Id: household.partner1Id,
    partner2Id: household.partner2Id,
    partner1Share: serializeDecimal(household.partner1Share),
    transactions: transactions.map((transaction) => ({
      payerId: transaction.payerId,
      ownerId: transaction.ownerId,
      amount: serializeDecimal(transaction.amount),
      splitType: transaction.splitType,
      isHousehold: transaction.isHousehold,
    })),
  });

  return {
    household,
    month,
    year,
    summary,
  };
}

export async function getNetWorthSummary() {
  const accounts = await prisma.account.findMany({
    where: {
      isActive: true,
    },
    include: {
      User: true,
    },
    orderBy: [{ type: "asc" }, { name: "asc" }],
  });

  const normalized = accounts.map((account) => ({
    ...serializeAccount(account),
    owner: account.User,
  }));

  const netWorthAccounts = normalized.filter((account) => account.includeInNetWorth);
  const availableAccounts = normalized.filter((account) => account.includeInAvailableBalance);
  const reserveAccounts = normalized.filter(
    (account) => account.subtype === "RESERVE" || account.reserveType,
  );

  return {
    totals: {
      netWorth: round2(netWorthAccounts.reduce((sum, account) => sum + (account.balance || 0), 0)),
      availableBalance: round2(
        availableAccounts.reduce((sum, account) => sum + (account.balance || 0), 0),
      ),
      reserves: round2(reserveAccounts.reduce((sum, account) => sum + (account.balance || 0), 0)),
    },
    accounts: normalized,
  };
}
