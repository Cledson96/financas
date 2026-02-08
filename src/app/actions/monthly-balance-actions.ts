"use server";

import { MonthlyBalanceService } from "@/services/monthly-balance-service";
import { revalidatePath } from "next/cache";

export async function closeMonthAction(
  month: number,
  year: number,
  debtorId: string,
  creditorId: string,
  finalBalance: number,
) {
  await MonthlyBalanceService.closeMonth(
    month,
    year,
    debtorId,
    creditorId,
    finalBalance,
  );
  revalidatePath("/couple");
}

export async function markMonthPaidAction(id: string) {
  await MonthlyBalanceService.markAsPaid(id);
  revalidatePath("/couple");
}
