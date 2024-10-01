import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      throw new Error("Unauthorized");
    }
    const data = await prisma.compDynamPost.findMany({
      include: {
        author: true,
        tags: {
          include: {
            tag: true,
          },
        },
      },
      skip: 0,
      take: 100,
    });

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error }, { status: 401 });
  }
}
