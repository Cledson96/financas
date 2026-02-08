import { prisma } from "@/lib/prisma";
import { MonthlyBalance } from "@prisma/client";

export class MonthlyBalanceService {
  static async getBalance(
    month: number,
    year: number,
  ): Promise<MonthlyBalance | null> {
    return prisma.monthlyBalance.findUnique({
      where: {
        month_year: {
          month,
          year,
        },
      },
      include: {
        User_MonthlyBalance_creditorIdToUser: true,
        User_MonthlyBalance_debtorIdToUser: true,
      },
    });
  }

  static async closeMonth(
    month: number,
    year: number,
    debtorId: string,
    creditorId: string,
    finalBalance: number,
  ): Promise<MonthlyBalance> {
    return prisma.monthlyBalance.create({
      data: {
        id: crypto.randomUUID(),
        month,
        year,
        debtorId,
        creditorId,
        finalBalance,
        status: "OPEN",
        createdAt: new Date(),
      },
    });
  }

  static async markAsPaid(id: string): Promise<MonthlyBalance> {
    return prisma.monthlyBalance.update({
      where: { id },
      data: { status: "PAID" },
    });
  }
}
