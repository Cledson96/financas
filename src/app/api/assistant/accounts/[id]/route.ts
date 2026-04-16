import { isAssistantAuthorized, unauthorizedResponse, badRequest } from "@/services/assistant/auth.js";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!isAssistantAuthorized(request)) {
    return unauthorizedResponse();
  }

  try {
    const { id } = await params;
    const data = await request.json();

    const existing = await prisma.account.findUnique({ where: { id } });
    if (!existing) return badRequest("Account not found");

    const update: Record<string, unknown> = {};

    const fields = [
      "name", "type", "bankName", "balance", "limit",
      "dueDay", "closingDay", "userId", "isActive",
      "isShared", "includeInNetWorth", "includeInAvailableBalance",
      "subtype", "reserveType", "notes",
    ];

    for (const field of fields) {
      if (data[field] !== undefined) {
        update[field] = data[field];
      }
    }

    const account = await prisma.account.update({
      where: { id },
      data: update,
      include: { User: true },
    });

    return NextResponse.json({ account });
  } catch (error) {
    console.error("Assistant account PATCH error:", error);
    return badRequest(error instanceof Error ? error.message : "Failed to update account");
  }
}
