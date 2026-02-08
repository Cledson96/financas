"use server";

import { FixedExpenseService } from "@/services/fixed-expense-service";
import { revalidatePath } from "next/cache";
import { SplitMethod } from "@prisma/client";

export async function getFixedExpensesAction() {
  return FixedExpenseService.list();
}

export async function createFixedExpenseAction(formData: FormData) {
  const description = formData.get("description") as string;
  const amount = parseFloat(formData.get("amount") as string);
  const dueDay = parseInt(formData.get("dueDay") as string);
  const categoryId = formData.get("categoryId") as string;
  const splitType = formData.get("splitType") as SplitMethod;
  const ownerId = (formData.get("ownerId") as string) || null;

  await FixedExpenseService.create({
    description,
    amount,
    dueDay,
    categoryId,
    splitType,
    ownerId,
  });

  revalidatePath("/settings");
}

export async function deleteFixedExpenseAction(id: string) {
  await FixedExpenseService.delete(id);
  revalidatePath("/settings");
}

export async function toggleFixedExpenseAction(id: string, active: boolean) {
  await FixedExpenseService.toggleActive(id, active);
  revalidatePath("/settings");
}
