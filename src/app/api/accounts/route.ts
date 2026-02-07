import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const accounts = await prisma.account.findMany({
      include: {
        User: true,
      },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(accounts);
  } catch (error) {
    console.error("Error fetching accounts:", error);
    return NextResponse.json(
      { error: "Failed to fetch accounts" },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const account = await prisma.account.create({
      data: {
        id: crypto.randomUUID(),
        name: data.name,
        type: data.type,
        bankName: data.bankName || null,
        balance: data.balance || 0,
        limit: data.limit || null,
        dueDay: data.dueDay || null,
        closingDay: data.closingDay || null,
        userId: data.userId || null,
      },
    });
    return NextResponse.json(account, { status: 201 });
  } catch (error) {
    console.error("Error creating account:", error);
    return NextResponse.json(
      { error: "Failed to create account" },
      { status: 500 },
    );
  }
}
