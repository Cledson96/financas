import { getAssistantIdentity, isAssistantAuthorized, unauthorizedResponse, badRequest } from "@/services/assistant/auth.js";
import { createAssistantBill, listBills, generateRecurringBills } from "@/services/assistant/service.js";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  if (!isAssistantAuthorized(request)) {
    return unauthorizedResponse();
  }

  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status") || undefined;
    const dueBefore = searchParams.get("dueBefore") || undefined;
    const overdueOnly = searchParams.get("overdueOnly") === "true";
    const limit = Number(searchParams.get("limit") || 100);

    const bills = await listBills({ status, dueBefore, overdueOnly, limit });
    return NextResponse.json({ bills });
  } catch (error) {
    console.error("Assistant bills GET error:", error);
    return badRequest("Failed to list bills", String(error));
  }
}

export async function POST(request: Request) {
  if (!isAssistantAuthorized(request)) {
    return unauthorizedResponse();
  }

  try {
    const payload = await request.json();
    const actor = getAssistantIdentity(request);

    if (payload.action === "generateRecurring") {
      const created = await generateRecurringBills({
        month: Number(payload.month),
        year: Number(payload.year),
        actor,
      });
      return NextResponse.json({ created }, { status: 201 });
    }

    const bill = await createAssistantBill(payload, actor);
    return NextResponse.json({ bill }, { status: 201 });
  } catch (error) {
    console.error("Assistant bills POST error:", error);
    return badRequest(error instanceof Error ? error.message : "Failed to create bill");
  }
}
