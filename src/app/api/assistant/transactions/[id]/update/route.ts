import { getAssistantIdentity, isAssistantAuthorized, unauthorizedResponse, badRequest } from "@/services/assistant/auth.js";
import { updateAssistantTransaction } from "@/services/assistant/service.js";
import { NextResponse } from "next/server";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!isAssistantAuthorized(request)) {
    return unauthorizedResponse();
  }

  try {
    const payload = await request.json();
    const actor = getAssistantIdentity(request);
    const { id } = await params;
    const transaction = await updateAssistantTransaction(id, payload, actor);
    return NextResponse.json({ transaction });
  } catch (error) {
    console.error("Assistant transaction PATCH error:", error);
    return badRequest(error instanceof Error ? error.message : "Failed to update transaction");
  }
}
