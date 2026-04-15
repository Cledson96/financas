import { getAssistantIdentity, isAssistantAuthorized, unauthorizedResponse, badRequest } from "@/services/assistant/auth.js";
import { getAssistantContext } from "@/services/assistant/service.js";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  if (!isAssistantAuthorized(request)) {
    return unauthorizedResponse();
  }

  try {
    const context = await getAssistantContext();
    return NextResponse.json({
      actor: getAssistantIdentity(request),
      context,
    });
  } catch (error) {
    console.error("Assistant context error:", error);
    return badRequest("Failed to load assistant context", String(error));
  }
}
