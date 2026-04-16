import {
  isAssistantAuthorized,
  unauthorizedResponse,
  badRequest,
} from "@/services/assistant/auth.js";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  if (!isAssistantAuthorized(request)) {
    return unauthorizedResponse();
  }

  try {
    const { searchParams } = new URL(request.url);
    const month = searchParams.get("month");
    const year = searchParams.get("year");

    const where: any = {};
    if (month) where.month = parseInt(month);
    if (year) where.year = parseInt(year);

    const budgets = await prisma.budget.findMany({
      where,
      include: { Category: true },
      orderBy: [{ year: "desc" }, { month: "desc" }],
    });

    const serialized = budgets.map((b) => ({
      id: b.id,
      categoryId: b.categoryId,
      categoryName: b.Category.name,
      categoryIcon: b.Category.icon,
      amount: Number(b.amount),
      month: b.month,
      year: b.year,
      createdAt: b.createdAt,
      updatedAt: b.updatedAt,
    }));

    return NextResponse.json({ budgets: serialized });
  } catch (error) {
    console.error("Assistant budgets GET error:", error);
    return badRequest("Failed to list budgets", String(error));
  }
}

export async function POST(request: Request) {
  if (!isAssistantAuthorized(request)) {
    return unauthorizedResponse();
  }

  try {
    const data = await request.json();

    if (!data.categoryId) return badRequest("categoryId is required");
    if (!data.amount || data.amount <= 0)
      return badRequest("amount must be > 0");
    if (!data.month || data.month < 1 || data.month > 12)
      return badRequest("month must be 1-12");
    if (!data.year) return badRequest("year is required");

    // Verify category exists
    const category = await prisma.category.findUnique({
      where: { id: data.categoryId },
    });
    if (!category) return badRequest("Category not found");
    if (category.type !== "EXPENSE")
      return badRequest("Budgets can only be set for EXPENSE categories");

    // Upsert by unique constraint (categoryId + month + year)
    const budget = await prisma.budget.upsert({
      where: {
        categoryId_month_year: {
          categoryId: data.categoryId,
          month: data.month,
          year: data.year,
        },
      },
      update: {
        amount: data.amount,
      },
      create: {
        categoryId: data.categoryId,
        amount: data.amount,
        month: data.month,
        year: data.year,
      },
    });

    return NextResponse.json({
      budget: {
        id: budget.id,
        categoryId: budget.categoryId,
        categoryName: category.name,
        categoryIcon: category.icon,
        amount: Number(budget.amount),
        month: budget.month,
        year: budget.year,
        createdAt: budget.createdAt,
        updatedAt: budget.updatedAt,
      },
    });
  } catch (error) {
    console.error("Assistant budgets POST error:", error);
    return badRequest(
      error instanceof Error ? error.message : "Failed to create/update budget",
    );
  }
}
