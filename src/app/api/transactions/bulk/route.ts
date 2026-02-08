import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function PATCH(request: Request) {
  try {
    const { ids, data } = await request.json();

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json({ error: "No IDs provided" }, { status: 400 });
    }

    // Update transactions
    await prisma.transaction.updateMany({
      where: {
        id: { in: ids },
      },
      data: {
        ...data,
        updatedAt: new Date(),
      },
    });

    return NextResponse.json({ success: true, count: ids.length });
  } catch (error) {
    console.error("Error updating bulk transactions:", error);
    return NextResponse.json(
      { error: "Failed to update transactions" },
      { status: 500 },
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const { ids } = await request.json();

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json({ error: "No IDs provided" }, { status: 400 });
    }

    await prisma.transaction.deleteMany({
      where: {
        id: { in: ids },
      },
    });

    return NextResponse.json({ success: true, count: ids.length });
  } catch (error) {
    console.error("Error deleting bulk transactions:", error);
    return NextResponse.json(
      { error: "Failed to delete transactions" },
      { status: 500 },
    );
  }
}
