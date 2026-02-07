import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const transactions = await prisma.transaction.findMany({
      include: {
        Category: true,
        Account: true,
        User_Transaction_payerIdToUser: true,
        User_Transaction_ownerIdToUser: true,
        Invoice: true,
      },
      orderBy: { purchaseDate: "desc" },
    });
    return NextResponse.json(transactions);
  } catch (error) {
    console.error("Error fetching transactions:", error);
    return NextResponse.json(
      { error: "Failed to fetch transactions" },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const transaction = await prisma.transaction.create({
      data: {
        id: crypto.randomUUID(),
        description: data.description,
        amount: data.amount,
        purchaseDate: new Date(data.purchaseDate),
        paymentDate: data.paymentDate ? new Date(data.paymentDate) : null,
        type: data.type,
        splitType: data.splitType || "EQUAL",
        categoryId: data.categoryId,
        accountId: data.accountId,
        payerId: data.payerId,
        ownerId: data.ownerId || null,
        invoiceId: data.invoiceId || null,
        installment: data.installment || 1,
        totalInstallments: data.totalInstallments || 1,
        updatedAt: new Date(),
      },
      include: {
        Category: true,
        Account: true,
        User_Transaction_payerIdToUser: true,
      },
    });
    return NextResponse.json(transaction, { status: 201 });
  } catch (error) {
    console.error("Error creating transaction:", error);
    return NextResponse.json(
      { error: "Failed to create transaction" },
      { status: 500 },
    );
  }
}
