import { getAssistantIdentity, isAssistantAuthorized, unauthorizedResponse, badRequest } from "@/services/assistant/auth.js";
import { getAssistantTransaction } from "@/services/assistant/service.js";
import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!isAssistantAuthorized(request)) {
    return unauthorizedResponse();
  }

  try {
    const { id } = await params;
    const transaction = await getAssistantTransaction(id);
    return NextResponse.json({ transaction });
  } catch (error) {
    console.error("Assistant transaction GET error:", error);
    return badRequest(error instanceof Error ? error.message : "Failed to get transaction");
  }
}
