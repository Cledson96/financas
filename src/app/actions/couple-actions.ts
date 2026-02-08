"use server";

import { CoupleService } from "@/services/couple-service";

export async function getMonthNetWorth(month: number, year: number) {
  return CoupleService.getNetWorth(month, year);
}
