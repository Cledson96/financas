import { prisma } from "@/lib/prisma";

/**
 * Recalculates the balance of an account by summing all its transactions.
 * INCOME adds, EXPENSE/PAYMENT/TRANSFER subtracts.
 */
export async function recalculateAccountBalance(accountId: string) {
  const income = await prisma.transaction.aggregate({
    where: { accountId, type: "INCOME" },
    _sum: { amount: true },
  });
  const expenses = await prisma.transaction.aggregate({
    where: { accountId, type: "EXPENSE" },
    _sum: { amount: true },
  });
  const payments = await prisma.transaction.aggregate({
    where: { accountId, type: "PAYMENT" },
    _sum: { amount: true },
  });
  const transfers = await prisma.transaction.aggregate({
    where: { accountId, type: "TRANSFER" },
    _sum: { amount: true },
  });

  const balance =
    Number(income._sum.amount || 0) -
    Number(expenses._sum.amount || 0) -
    Number(payments._sum.amount || 0) -
    Number(transfers._sum.amount || 0);

  await prisma.account.update({
    where: { id: accountId },
    data: { balance },
  });

  return balance;
}
