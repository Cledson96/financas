import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

function normalizeTransactionOwnership(data: any) {
  const splitType = data.splitType || "INDIVIDUAL";

  if (splitType === "INDIVIDUAL") {
    return {
      splitType,
      ownerId: data.ownerId || data.payerId,
      isHousehold: false,
    };
  }

  return {
    splitType,
    ownerId: null,
    isHousehold: true,
  };
}

export async function GET() {
  try {
    const transactions = await prisma.transaction.findMany({
      include: {
        Category: true,
        Account: true,
        User_Transaction_payerIdToUser: true,
        User_Transaction_ownerIdToUser: true,
        Invoice: true,
        Bill: true,
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
    const ownership = normalizeTransactionOwnership(data);

    const transaction = await prisma.transaction.create({
      data: {
        id: crypto.randomUUID(),
        description: data.description,
        originalDesc: data.originalDesc || null,
        amount: data.amount,
        purchaseDate: new Date(data.purchaseDate),
        paymentDate: data.paymentDate ? new Date(data.paymentDate) : null,
        type: data.type,
        splitType: ownership.splitType,
        categoryId: data.categoryId,
        accountId: data.accountId,
        payerId: data.payerId,
        ownerId: ownership.ownerId,
        invoiceId: data.invoiceId || null,
        installment: data.installment || 1,
        totalInstallments: data.totalInstallments || 1,
        splitShare: data.splitShare || null,
        settled: Boolean(data.settled),
        receiverAccountId: data.receiverAccountId || null,
        updatedAt: new Date(),
        status: data.status || "POSTED",
        source: data.source || "WEB",
        createdByUserId: data.createdByUserId || null,
        createdByAgent: data.createdByAgent || null,
        isHousehold: ownership.isHousehold,
        notes: data.notes || null,
        metadata: data.metadata || null,
      },
      include: {
        Category: true,
        Account: true,
        User_Transaction_payerIdToUser: true,
        User_Transaction_ownerIdToUser: true,
        Bill: true,
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
