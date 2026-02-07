import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const transaction = await prisma.transaction.findUnique({
      where: { id },
      include: {
        Category: true,
        Account: true,
        User_Transaction_payerIdToUser: true,
        User_Transaction_ownerIdToUser: true,
      },
    });
    if (!transaction) {
      return NextResponse.json(
        { error: "Transaction not found" },
        { status: 404 },
      );
    }
    return NextResponse.json(transaction);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch transaction" },
      { status: 500 },
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const data = await request.json();
    const transaction = await prisma.transaction.update({
      where: { id },
      data: {
        description: data.description,
        amount: data.amount,
        purchaseDate: data.purchaseDate
          ? new Date(data.purchaseDate)
          : undefined,
        paymentDate: data.paymentDate ? new Date(data.paymentDate) : null,
        type: data.type,
        splitType: data.splitType,
        categoryId: data.categoryId,
        accountId: data.accountId,
        payerId: data.payerId,
        ownerId: data.ownerId || null,
        settled: data.settled,
        updatedAt: new Date(),
      },
      include: {
        Category: true,
        Account: true,
        User_Transaction_payerIdToUser: true,
      },
    });
    return NextResponse.json(transaction);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to update transaction" },
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
    await prisma.transaction.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to delete transaction" },
      { status: 500 },
    );
  }
}
