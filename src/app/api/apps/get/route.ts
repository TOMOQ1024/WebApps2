import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const data = await prisma.app.findMany({
      include: {
        tags: {
          include: {
            tag: true,
          },
        },
      },
    });

    return NextResponse.json(
      data.map((a) => ({
        id: a.id,
        name: a.name,
        description: a.description,
        path: a.path,
        createdAt: a.createdAt,
        tags: a.tags.map((t) => t.tag.name),
      }))
    );
  } catch (error) {
    return NextResponse.json({ error }, { status: 401 });
  }
}
