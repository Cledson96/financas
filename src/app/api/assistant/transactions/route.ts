import { getAssistantIdentity, isAssistantAuthorized, unauthorizedResponse, badRequest } from "@/services/assistant/auth.js";
import { createAssistantTransaction, listAssistantTransactions } from "@/services/assistant/service.js";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  if (!isAssistantAuthorized(request)) {
    return unauthorizedResponse();
  }

  try {
    const { searchParams } = new URL(request.url);
    const limit = Number(searchParams.get("limit") || 20);
    const transactions = await listAssistantTransactions({ limit });
    return NextResponse.json({ transactions });
  } catch (error) {
    console.error("Assistant transactions GET error:", error);
    return badRequest("Failed to list transactions", String(error));
  }
}

export async function POST(request: Request) {
  if (!isAssistantAuthorized(request)) {
    return unauthorizedResponse();
  }

  try {
    const payload = await request.json();
    const actor = getAssistantIdentity(request);
    const transaction = await createAssistantTransaction(payload, actor);
    return NextResponse.json({ transaction }, { status: 201 });
  } catch (error) {
    console.error("Assistant transactions POST error:", error);
    return badRequest(error instanceof Error ? error.message : "Failed to create transaction");
  }
}
