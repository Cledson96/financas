import { getAssistantIdentity, isAssistantAuthorized, unauthorizedResponse, badRequest } from "@/services/assistant/auth.js";
import { createAssistantFixedExpense, listActiveFixedExpenses } from "@/services/assistant/service.js";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  if (!isAssistantAuthorized(request)) {
    return unauthorizedResponse();
  }

  try {
    const fixedExpenses = await listActiveFixedExpenses();
    return NextResponse.json({ fixedExpenses });
  } catch (error) {
    console.error("Assistant fixed expenses GET error:", error);
    return badRequest("Failed to list fixed expenses", String(error));
  }
}

export async function POST(request: Request) {
  if (!isAssistantAuthorized(request)) {
    return unauthorizedResponse();
  }

  try {
    const payload = await request.json();
    const actor = getAssistantIdentity(request);
    const fixedExpense = await createAssistantFixedExpense(payload, actor);
    return NextResponse.json({ fixedExpense }, { status: 201 });
  } catch (error) {
    console.error("Assistant fixed expenses POST error:", error);
    return badRequest(error instanceof Error ? error.message : "Failed to create fixed expense");
  }
}
