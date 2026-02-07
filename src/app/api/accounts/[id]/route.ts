import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const data = await request.json();
    const account = await prisma.account.update({
      where: { id },
      data: {
        name: data.name,
        type: data.type,
        bankName: data.bankName,
        balance: data.balance,
        limit: data.limit,
        dueDay: data.dueDay,
        closingDay: data.closingDay,
        userId: data.userId,
      },
    });
    return NextResponse.json(account);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to update account" },
      { status: 500 },
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    await prisma.account.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to delete account" },
      { status: 500 },
    );
  }
}
