const round2 = (value) => Math.round((Number(value) || 0) * 100) / 100;

export function resolveBillStatus({ status = 'PENDING', dueDate, paidAt = null, now = new Date() }) {
  if (paidAt) return 'PAID';
  if (status === 'PAID' || status === 'CANCELLED' || status === 'PARTIALLY_PAID') {
    return status;
  }

  const due = new Date(dueDate);
  const current = new Date(now);
  if (!Number.isNaN(due.getTime()) && due.getTime() < current.getTime()) {
    return 'OVERDUE';
  }

  return 'PENDING';
}

export function normalizeOwnership({ splitType = 'INDIVIDUAL', payerId, ownerId = null }) {
  if (!payerId) {
    throw new Error('payerId is required');
  }

  if (splitType === 'INDIVIDUAL') {
    return {
      splitType,
      payerId,
      ownerId: ownerId || payerId,
      isHousehold: false,
    };
  }

  return {
    splitType,
    payerId,
    ownerId: null,
    isHousehold: true,
  };
}

export function summarizeCreditCardLimit({ creditLimit = 0, postedExpenses = [], payments = [] }) {
  const committed = round2(postedExpenses.reduce((sum, item) => sum + Number(item || 0), 0));
  const paid = round2(payments.reduce((sum, item) => sum + Number(item || 0), 0));
  const available = round2(Number(creditLimit || 0) - Math.max(committed - paid, 0));

  return {
    creditLimit: round2(creditLimit),
    committed,
    paid,
    available,
  };
}

export function summarizeHouseholdContributions({
  partner1Id,
  partner2Id,
  partner1Share = 0.5,
  transactions = [],
}) {
  const individualTotals = {
    [partner1Id]: 0,
    [partner2Id]: 0,
  };

  let householdTotal = 0;
  let paidByPartner1 = 0;
  let paidByPartner2 = 0;

  for (const transaction of transactions) {
    const amount = round2(transaction.amount || 0);
    const isShared =
      transaction.isHousehold ||
      transaction.splitType === 'SHARED' ||
      transaction.splitType === 'SHARED_PROPORTIONAL';

    if (isShared) {
      householdTotal = round2(householdTotal + amount);
      if (transaction.payerId === partner1Id) paidByPartner1 = round2(paidByPartner1 + amount);
      if (transaction.payerId === partner2Id) paidByPartner2 = round2(paidByPartner2 + amount);
      continue;
    }

    if (transaction.splitType === 'INDIVIDUAL' && transaction.ownerId) {
      individualTotals[transaction.ownerId] = round2(
        (individualTotals[transaction.ownerId] || 0) + amount,
      );
    }
  }

  const partner1ShouldHavePaid = round2(householdTotal * Number(partner1Share || 0));
  const partner2ShouldHavePaid = round2(householdTotal - partner1ShouldHavePaid);
  const partner1Delta = round2(paidByPartner1 - partner1ShouldHavePaid);
  const partner2Delta = round2(paidByPartner2 - partner2ShouldHavePaid);

  let balance = {
    debtorId: null,
    creditorId: null,
    amount: 0,
  };

  if (partner1Delta > 0) {
    balance = {
      debtorId: partner2Id,
      creditorId: partner1Id,
      amount: round2(partner1Delta),
    };
  } else if (partner2Delta > 0) {
    balance = {
      debtorId: partner1Id,
      creditorId: partner2Id,
      amount: round2(partner2Delta),
    };
  }

  return {
    householdTotal,
    paidByPartner1,
    paidByPartner2,
    individualTotals,
    partner1ShouldHavePaid,
    partner2ShouldHavePaid,
    balance,
  };
}

export function buildRecurringBillDraft({ fixedExpense, dueDate, source = 'RECURRING' }) {
  return {
    description: fixedExpense.description,
    amount: round2(fixedExpense.amount || 0),
    kind: 'RECURRING_BILL',
    status: 'PENDING',
    dueDate: new Date(dueDate),
    categoryId: fixedExpense.categoryId,
    accountId: fixedExpense.defaultAccountId || null,
    fixedExpenseId: fixedExpense.id,
    payerId: fixedExpense.payerId || null,
    ownerId: fixedExpense.ownerId || null,
    splitType: fixedExpense.splitType || 'INDIVIDUAL',
    splitShare: fixedExpense.splitShare || null,
    isHousehold: Boolean(fixedExpense.isHousehold),
    source,
    isRecurringInstance: true,
    notes: fixedExpense.notes || null,
  };
}
