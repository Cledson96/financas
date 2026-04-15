import { isAssistantAuthorized, unauthorizedResponse, badRequest } from "@/services/assistant/auth.js";
import { listCardLimits } from "@/services/assistant/service.js";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  if (!isAssistantAuthorized(request)) {
    return unauthorizedResponse();
  }

  try {
    const cards = await listCardLimits();
    return NextResponse.json({ cards });
  } catch (error) {
    console.error("Assistant cards limits GET error:", error);
    return badRequest("Failed to load card limits", String(error));
  }
}
