import { isAssistantAuthorized, unauthorizedResponse, badRequest } from "@/services/assistant/auth.js";
import { listBills } from "@/services/assistant/service.js";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  if (!isAssistantAuthorized(request)) {
    return unauthorizedResponse();
  }

  try {
    const bills = await listBills({ overdueOnly: true, limit: 100 });
    return NextResponse.json({ bills });
  } catch (error) {
    console.error("Assistant overdue GET error:", error);
    return badRequest("Failed to list overdue bills", String(error));
  }
}
