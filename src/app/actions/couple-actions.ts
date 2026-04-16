"use server";

import { CoupleService, clearConfigCache } from "@/services/couple-service";

export async function getMonthNetWorth(month: number, year: number) {
  try {
    return await CoupleService.getNetWorth(month, year);
  } finally {
    clearConfigCache();
  }
}

export async function getSharedTransactions(month: number, year: number) {
  try {
    const transactions = await CoupleService.listSharedTransactions(month, year);
    // Serialize dates and decimals for client
    return transactions.map((t) => ({
      ...t,
      amount: Number(t.amount),
      purchaseDate: t.purchaseDate.toISOString(),
    }));
  } finally {
    clearConfigCache();
  }
}
