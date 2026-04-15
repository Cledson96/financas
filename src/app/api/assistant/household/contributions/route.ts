import { isAssistantAuthorized, unauthorizedResponse, badRequest } from "@/services/assistant/auth.js";
import { getHouseholdContributions } from "@/services/assistant/service.js";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  if (!isAssistantAuthorized(request)) {
    return unauthorizedResponse();
  }

  try {
    const { searchParams } = new URL(request.url);
    const now = new Date();
    const month = Number(searchParams.get("month") || now.getUTCMonth() + 1);
    const year = Number(searchParams.get("year") || now.getUTCFullYear());
    const summary = await getHouseholdContributions({ month, year });
    return NextResponse.json(summary);
  } catch (error) {
    console.error("Assistant household contributions GET error:", error);
    return badRequest(error instanceof Error ? error.message : "Failed to load household contributions");
  }
}
