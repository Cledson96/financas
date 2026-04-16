import { isAssistantAuthorized, unauthorizedResponse, badRequest } from "@/services/assistant/auth.js";
import { listAssistantTransactions } from "@/services/assistant/service.js";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  if (!isAssistantAuthorized(request)) {
    return unauthorizedResponse();
  }

  try {
    const { searchParams } = new URL(request.url);
    const filters = {
      type: searchParams.get("type") || undefined,
      categoryId: searchParams.get("categoryId") || undefined,
      accountId: searchParams.get("accountId") || undefined,
      payerId: searchParams.get("payerId") || undefined,
      ownerId: searchParams.get("ownerId") || undefined,
      status: searchParams.get("status") || undefined,
      source: searchParams.get("source") || undefined,
      isHousehold: searchParams.get("isHousehold") === "true" ? true : searchParams.get("isHousehold") === "false" ? false : undefined,
      startDate: searchParams.get("startDate") || undefined,
      endDate: searchParams.get("endDate") || undefined,
      search: searchParams.get("search") || undefined,
      limit: Number(searchParams.get("limit") || 50),
      offset: Number(searchParams.get("offset") || 0),
    };

    const result = await listAssistantTransactions(filters);
    return NextResponse.json(result);
  } catch (error) {
    console.error("Assistant transactions GET error:", error);
    return badRequest("Failed to list transactions", String(error));
  }
}
