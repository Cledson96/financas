import {
  isAssistantAuthorized,
  unauthorizedResponse,
  badRequest,
} from "@/services/assistant/auth.js";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!isAssistantAuthorized(request)) {
    return unauthorizedResponse();
  }

  try {
    const { id } = await params;

    const existing = await prisma.budget.findUnique({ where: { id } });
    if (!existing) {
      return badRequest("Budget not found");
    }

    await prisma.budget.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Assistant budget DELETE error:", error);
    return badRequest(
      error instanceof Error ? error.message : "Failed to delete budget",
    );
  }
}
