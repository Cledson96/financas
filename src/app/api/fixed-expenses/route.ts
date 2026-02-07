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
    const fixedExpense = await prisma.fixedExpense.create({
      data: {
        id: crypto.randomUUID(),
        description: data.description,
        amount: data.amount,
        dueDay: data.dueDay,
        categoryId: data.categoryId,
        splitType: data.splitType || "SHARED",
        ownerId: data.ownerId || null,
        active: true,
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
