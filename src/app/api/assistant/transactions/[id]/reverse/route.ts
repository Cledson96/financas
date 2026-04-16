import { getAssistantIdentity, isAssistantAuthorized, unauthorizedResponse, badRequest } from "@/services/assistant/auth.js";
import { reverseAssistantTransaction } from "@/services/assistant/service.js";
import { NextResponse } from "next/server";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!isAssistantAuthorized(request)) {
    return unauthorizedResponse();
  }

  try {
    const payload = await request.json().catch(() => ({}));
    const actor = getAssistantIdentity(request);
    const { id } = await params;
    const result = await reverseAssistantTransaction(id, payload, actor);
    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    console.error("Assistant transaction reverse error:", error);
    return badRequest(error instanceof Error ? error.message : "Failed to reverse transaction");
  }
}
