import { prisma } from "@/lib/prisma";
import { FixedExpense, SplitMethod } from "@prisma/client";

export class FixedExpenseService {
  static async list(): Promise<
    (FixedExpense & { Category: { name: string; icon: string | null } })[]
  > {
    return prisma.fixedExpense.findMany({
      include: {
        Category: {
          select: {
            name: true,
            icon: true,
          },
        },
      },
      orderBy: {
        dueDay: "asc",
      },
    });
  }

  static async create(data: {
    description: string;
    amount: number;
    dueDay: number;
    categoryId: string;
    splitType: SplitMethod;
    ownerId?: string | null;
  }): Promise<FixedExpense> {
    return prisma.fixedExpense.create({
      data: {
        id: crypto.randomUUID(),
        ...data,
      },
    });
  }

  static async update(
    id: string,
    data: Partial<FixedExpense>,
  ): Promise<FixedExpense> {
    return prisma.fixedExpense.update({
      where: { id },
      data,
    });
  }

  static async delete(id: string): Promise<FixedExpense> {
    return prisma.fixedExpense.delete({
      where: { id },
    });
  }

  static async toggleActive(
    id: string,
    active: boolean,
  ): Promise<FixedExpense> {
    return prisma.fixedExpense.update({
      where: { id },
      data: { active },
    });
  }
}
