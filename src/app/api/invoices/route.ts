import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const invoices = await prisma.invoice.findMany({
      include: {
        Account: true,
        Transaction: true,
      },
      orderBy: [{ year: "desc" }, { month: "desc" }],
    });
    return NextResponse.json(invoices);
  } catch (error) {
    console.error("Error fetching invoices:", error);
    return NextResponse.json(
      { error: "Failed to fetch invoices" },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const invoice = await prisma.invoice.create({
      data: {
        id: crypto.randomUUID(),
        month: data.month,
        year: data.year,
        dueDate: new Date(data.dueDate),
        closingDate: new Date(data.closingDate),
        status: data.status || "OPEN",
        amount: data.amount || 0,
        accountId: data.accountId,
      },
      include: {
        Account: true,
      },
    });
    return NextResponse.json(invoice, { status: 201 });
  } catch (error) {
    console.error("Error creating invoice:", error);
    return NextResponse.json(
      { error: "Failed to create invoice" },
      { status: 500 },
    );
  }
}
