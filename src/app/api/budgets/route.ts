import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const month = searchParams.get("month");
    const year = searchParams.get("year");

    const now = new Date();
    const targetMonth = month ? parseInt(month) : now.getMonth() + 1;
    const targetYear = year ? parseInt(year) : now.getFullYear();

    const budgets = await prisma.budget.findMany({
      where: {
        month: targetMonth,
        year: targetYear,
      },
      include: { Category: true },
      orderBy: { Category: { name: "asc" } },
    });

    const serialized = budgets.map((b) => ({
      id: b.id,
      categoryId: b.categoryId,
      categoryName: b.Category.name,
      categoryIcon: b.Category.icon,
      amount: Number(b.amount),
      month: b.month,
      year: b.year,
    }));

    return NextResponse.json({ budgets: serialized });
  } catch (error) {
    console.error("Budgets GET error:", error);
    return NextResponse.json(
      { error: "Failed to fetch budgets" },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json();

    if (!data.categoryId) {
      return NextResponse.json(
        { error: "categoryId is required" },
        { status: 400 },
      );
    }
    if (!data.amount || data.amount <= 0) {
      return NextResponse.json(
        { error: "amount must be > 0" },
        { status: 400 },
      );
    }
    if (!data.month || data.month < 1 || data.month > 12) {
      return NextResponse.json(
        { error: "month must be 1-12" },
        { status: 400 },
      );
    }
    if (!data.year) {
      return NextResponse.json({ error: "year is required" }, { status: 400 });
    }

    // Verify category
    const category = await prisma.category.findUnique({
      where: { id: data.categoryId },
    });
    if (!category) {
      return NextResponse.json(
        { error: "Category not found" },
        { status: 404 },
      );
    }

    const budget = await prisma.budget.upsert({
      where: {
        categoryId_month_year: {
          categoryId: data.categoryId,
          month: data.month,
          year: data.year,
        },
      },
      update: { amount: data.amount },
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
      },
    });
  } catch (error) {
    console.error("Budget POST error:", error);
    return NextResponse.json(
      { error: "Failed to create/update budget" },
      { status: 500 },
    );
  }
}
