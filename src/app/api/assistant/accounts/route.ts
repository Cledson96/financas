import { isAssistantAuthorized, unauthorizedResponse, badRequest } from "@/services/assistant/auth.js";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  if (!isAssistantAuthorized(request)) {
    return unauthorizedResponse();
  }

  try {
    const accounts = await prisma.account.findMany({
      where: { isActive: true },
      include: { User: true },
      orderBy: [{ type: "asc" }, { name: "asc" }],
    });
    return NextResponse.json({ accounts });
  } catch (error) {
    console.error("Assistant accounts GET error:", error);
    return badRequest("Failed to list accounts", String(error));
  }
}

export async function POST(request: Request) {
  if (!isAssistantAuthorized(request)) {
    return unauthorizedResponse();
  }

  try {
    const data = await request.json();
    if (!data.name) return badRequest("name is required");
    if (!data.type) return badRequest("type is required");

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
        isActive: data.isActive ?? true,
        isShared: data.isShared ?? false,
        includeInNetWorth: data.includeInNetWorth ?? true,
        includeInAvailableBalance: data.includeInAvailableBalance ?? true,
        subtype: data.subtype || null,
        reserveType: data.reserveType || null,
        notes: data.notes || null,
      },
      include: { User: true },
    });
    return NextResponse.json({ account }, { status: 201 });
  } catch (error) {
    console.error("Assistant accounts POST error:", error);
    return badRequest(error instanceof Error ? error.message : "Failed to create account");
  }
}
