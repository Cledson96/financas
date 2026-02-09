"use server";

import { CoupleService } from "@/services/couple-service";

export async function getMonthNetWorth(month: number, year: number) {
  return CoupleService.getNetWorth(month, year);
}

export async function getSharedTransactions(month: number, year: number) {
  const transactions = await CoupleService.listSharedTransactions(month, year);
  // Serialize dates and decimals for client
  return transactions.map((t) => ({
    ...t,
    amount: Number(t.amount),
    purchaseDate: t.purchaseDate.toISOString(),
  }));
}
