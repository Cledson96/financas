import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const fixedExpenses = await prisma.fixedExpense.findMany({
      where: { active: true },
      include: {
        Category: true,
        User: true,
      },
      orderBy: { dueDay: "asc" },
    });
    return NextResponse.json(fixedExpenses);
  } catch (error) {
    console.error("Error fetching fixed expenses:", error);
    return NextResponse.json(
      { error: "Failed to fetch fixed expenses" },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const splitType = data.splitType || "SHARED";
    const fixedExpense = await prisma.fixedExpense.create({
      data: {
        id: crypto.randomUUID(),
        description: data.description,
        amount: data.amount,
        dueDay: data.dueDay,
        categoryId: data.categoryId,
        splitType,
        ownerId: splitType === "INDIVIDUAL" ? (data.ownerId || null) : null,
        active: data.active ?? true,
        frequency: data.frequency || "MONTHLY",
        startDate: data.startDate ? new Date(data.startDate) : null,
        endDate: data.endDate ? new Date(data.endDate) : null,
        defaultAccountId: data.defaultAccountId || null,
        isHousehold: splitType !== "INDIVIDUAL",
        autoGenerateBill: data.autoGenerateBill ?? true,
        autoGenerateTransaction: data.autoGenerateTransaction ?? false,
        leadDays: data.leadDays ?? 3,
        notes: data.notes || null,
        createdByUserId: data.createdByUserId || null,
        createdByAgent: data.createdByAgent || null,
        updatedAt: new Date(),
      },
      include: {
        Category: true,
        User: true,
      },
    });
    return NextResponse.json(fixedExpense, { status: 201 });
  } catch (error) {
    console.error("Error creating fixed expense:", error);
    return NextResponse.json(
      { error: "Failed to create fixed expense" },
      { status: 500 },
    );
  }
}
