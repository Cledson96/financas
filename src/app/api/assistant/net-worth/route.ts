import { isAssistantAuthorized, unauthorizedResponse, badRequest } from "@/services/assistant/auth.js";
import { getNetWorthSummary } from "@/services/assistant/service.js";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  if (!isAssistantAuthorized(request)) {
    return unauthorizedResponse();
  }

  try {
    const summary = await getNetWorthSummary();
    return NextResponse.json(summary);
  } catch (error) {
    console.error("Assistant net-worth GET error:", error);
    return badRequest("Failed to load net worth summary", String(error));
  }
}
