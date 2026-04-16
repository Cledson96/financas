import { isAssistantAuthorized, unauthorizedResponse, badRequest } from "@/services/assistant/auth.js";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  if (!isAssistantAuthorized(request)) {
    return unauthorizedResponse();
  }

  try {
    const categories = await prisma.category.findMany({
      orderBy: [{ type: "asc" }, { name: "asc" }],
    });
    return NextResponse.json({ categories });
  } catch (error) {
    console.error("Assistant categories GET error:", error);
    return badRequest("Failed to list categories", String(error));
  }
}

export async function POST(request: Request) {
  if (!isAssistantAuthorized(request)) {
    return unauthorizedResponse();
  }

  try {
    const data = await request.json();
    if (!data.name) return badRequest("name is required");
    if (!data.type) return badRequest("type is required");

    const category = await prisma.category.create({
      data: {
        id: crypto.randomUUID(),
        name: data.name,
        type: data.type,
        icon: data.icon || null,
      },
    });
    return NextResponse.json({ category }, { status: 201 });
  } catch (error) {
    console.error("Assistant categories POST error:", error);
    return badRequest(error instanceof Error ? error.message : "Failed to create category");
  }
}
