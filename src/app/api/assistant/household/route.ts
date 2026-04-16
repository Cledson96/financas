import { isAssistantAuthorized, unauthorizedResponse, badRequest } from "@/services/assistant/auth.js";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  if (!isAssistantAuthorized(request)) {
    return unauthorizedResponse();
  }

  try {
    const household = await prisma.householdConfig.findFirst({
      where: { isActive: true },
      include: {
        User_HouseholdConfig_partner1IdToUser: true,
        User_HouseholdConfig_partner2IdToUser: true,
      },
    });
    return NextResponse.json({ household });
  } catch (error) {
    console.error("Assistant household GET error:", error);
    return badRequest("Failed to get household", String(error));
  }
}

export async function POST(request: Request) {
  if (!isAssistantAuthorized(request)) {
    return unauthorizedResponse();
  }

  try {
    const data = await request.json();
    if (!data.partner1Id) return badRequest("partner1Id is required");
    if (!data.partner2Id) return badRequest("partner2Id is required");

    const existing = await prisma.householdConfig.findFirst({
      where: { isActive: true },
    });
    if (existing) return badRequest("Household already exists. Use PATCH to update.");

    const household = await prisma.householdConfig.create({
      data: {
        id: crypto.randomUUID(),
        partner1Id: data.partner1Id,
        partner2Id: data.partner2Id,
        partner1Share: data.partner1Share ?? 0.5,
        updatedAt: new Date(),
        defaultSharedRule: data.defaultSharedRule || "SHARED",
        isActive: true,
        notes: data.notes || null,
      },
      include: {
        User_HouseholdConfig_partner1IdToUser: true,
        User_HouseholdConfig_partner2IdToUser: true,
      },
    });
    return NextResponse.json({ household }, { status: 201 });
  } catch (error) {
    console.error("Assistant household POST error:", error);
    return badRequest(error instanceof Error ? error.message : "Failed to create household");
  }
}
