import test from 'node:test';
import assert from 'node:assert/strict';

import {
  resolveBillStatus,
  normalizeOwnership,
  summarizeCreditCardLimit,
  summarizeHouseholdContributions,
  buildRecurringBillDraft,
} from '../src/services/assistant/domain.js';

test('resolveBillStatus marks pending bills in the past as overdue', () => {
  const status = resolveBillStatus({
    status: 'PENDING',
    dueDate: '2026-01-10T00:00:00.000Z',
    now: '2026-01-11T12:00:00.000Z',
  });

  assert.equal(status, 'OVERDUE');
});

test('normalizeOwnership keeps shared expenses household-scoped and ownerless', () => {
  const normalized = normalizeOwnership({
    splitType: 'SHARED',
    payerId: 'payer-1',
    ownerId: 'owner-1',
  });

  assert.deepEqual(normalized, {
    splitType: 'SHARED',
    payerId: 'payer-1',
    ownerId: null,
    isHousehold: true,
  });
});

test('normalizeOwnership forces owner on individual expenses', () => {
  const normalized = normalizeOwnership({
    splitType: 'INDIVIDUAL',
    payerId: 'payer-1',
  });

  assert.deepEqual(normalized, {
    splitType: 'INDIVIDUAL',
    payerId: 'payer-1',
    ownerId: 'payer-1',
    isHousehold: false,
  });
});

test('summarizeCreditCardLimit calculates committed and available amounts', () => {
  const summary = summarizeCreditCardLimit({
    creditLimit: 1000,
    postedExpenses: [100.25, 89.75, 10],
    payments: [50],
  });

  assert.deepEqual(summary, {
    creditLimit: 1000,
    committed: 200,
    paid: 50,
    available: 850,
  });
});

test('summarizeHouseholdContributions separates household and individual totals', () => {
  const summary = summarizeHouseholdContributions({
    partner1Id: 'cle',
    partner2Id: 'kev',
    partner1Share: 0.6,
    transactions: [
      { payerId: 'cle', amount: 100, splitType: 'SHARED', isHousehold: true },
      { payerId: 'kev', amount: 50, splitType: 'SHARED', isHousehold: true },
      { payerId: 'cle', ownerId: 'cle', amount: 80, splitType: 'INDIVIDUAL', isHousehold: false },
      { payerId: 'cle', ownerId: 'kev', amount: 30, splitType: 'INDIVIDUAL', isHousehold: false },
    ],
  });

  assert.deepEqual(summary, {
    householdTotal: 150,
    paidByPartner1: 100,
    paidByPartner2: 50,
    individualTotals: {
      cle: 80,
      kev: 30,
    },
    partner1ShouldHavePaid: 90,
    partner2ShouldHavePaid: 60,
    balance: {
      debtorId: 'kev',
      creditorId: 'cle',
      amount: 10,
    },
  });
});

test('buildRecurringBillDraft creates monthly bill instances from fixed expenses', () => {
  const draft = buildRecurringBillDraft({
    fixedExpense: {
      id: 'fx-1',
      description: 'Internet Casa',
      amount: 120,
      categoryId: 'cat-1',
      splitType: 'SHARED',
      ownerId: null,
      isHousehold: true,
      leadDays: 5,
    },
    dueDate: '2026-05-20T00:00:00.000Z',
    source: 'RECURRING',
  });

  assert.equal(draft.description, 'Internet Casa');
  assert.equal(draft.status, 'PENDING');
  assert.equal(draft.kind, 'RECURRING_BILL');
  assert.equal(draft.fixedExpenseId, 'fx-1');
  assert.equal(draft.isRecurringInstance, true);
  assert.equal(draft.isHousehold, true);
  assert.equal(draft.splitType, 'SHARED');
  assert.equal(draft.amount, 120);
});
