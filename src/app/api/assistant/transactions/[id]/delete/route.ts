import { isAssistantAuthorized, unauthorizedResponse, badRequest } from "@/services/assistant/auth.js";
import { deleteAssistantTransaction } from "@/services/assistant/service.js";
import { NextResponse } from "next/server";

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!isAssistantAuthorized(request)) {
    return unauthorizedResponse();
  }

  try {
    const { searchParams } = new URL(request.url);
    const hard = searchParams.get("hard") === "true";
    const { id } = await params;
    const result = await deleteAssistantTransaction(id, { hard });
    return NextResponse.json({ result });
  } catch (error) {
    console.error("Assistant transaction DELETE error:", error);
    return badRequest(error instanceof Error ? error.message : "Failed to delete transaction");
  }
}
