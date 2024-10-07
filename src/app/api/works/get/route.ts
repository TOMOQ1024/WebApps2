import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";

export async function GET(req: NextRequest) {
  const page = +(req.nextUrl.searchParams.get("page") ?? -1);
  const take = +(req.nextUrl.searchParams.get("take") ?? -1);
  try {
    if (page < 0 || take < 0) throw new Error(`invalid search params`);
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
      skip: page * take,
      take: take,
    });

    return NextResponse.json(data);
  } catch (error) {
    console.log(error);
    return NextResponse.json({ error }, { status: 401 });
  }
}
