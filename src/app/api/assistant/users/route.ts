import { isAssistantAuthorized, unauthorizedResponse, badRequest } from "@/services/assistant/auth.js";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  if (!isAssistantAuthorized(request)) {
    return unauthorizedResponse();
  }

  try {
    const users = await prisma.user.findMany({
      where: { isActive: true },
      orderBy: { name: "asc" },
    });
    return NextResponse.json({ users });
  } catch (error) {
    console.error("Assistant users GET error:", error);
    return badRequest("Failed to list users", String(error));
  }
}

export async function POST(request: Request) {
  if (!isAssistantAuthorized(request)) {
    return unauthorizedResponse();
  }

  try {
    const data = await request.json();
    if (!data.name) return badRequest("name is required");

    const user = await prisma.user.create({
      data: {
        id: crypto.randomUUID(),
        name: data.name,
        email: data.email || null,
        isActive: true,
      },
    });
    return NextResponse.json({ user }, { status: 201 });
  } catch (error) {
    console.error("Assistant users POST error:", error);
    return badRequest(error instanceof Error ? error.message : "Failed to create user");
  }
}
