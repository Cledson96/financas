import { isAssistantAuthorized, unauthorizedResponse, badRequest } from "@/services/assistant/auth.js";
import { listBills } from "@/services/assistant/service.js";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  if (!isAssistantAuthorized(request)) {
    return unauthorizedResponse();
  }

  try {
    const { searchParams } = new URL(request.url);
    const days = Number(searchParams.get("days") || 7);
    const dueBefore = new Date();
    dueBefore.setDate(dueBefore.getDate() + days);
    const bills = await listBills({ dueBefore, limit: 100 });
    return NextResponse.json({ bills });
  } catch (error) {
    console.error("Assistant due soon GET error:", error);
    return badRequest("Failed to list due soon bills", String(error));
  }
}
