import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { authOptions } from "@/lib/authOptions";
import { getServerSession } from "next-auth";
import { CompDynamPost } from "@prisma/client";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      throw new Error("Unauthorized");
    }
    console.log(session.user);
    const input = (await req.json()) as CompDynamPost & { tags: string[] };

    const tags = await Promise.all(
      input.tags.map(async (tagName) => {
        let tag = await prisma.tag.findUnique({
          where: { name: tagName },
        });

        if (!tag) {
          tag = await prisma.tag.create({
            data: { name: tagName },
          });
        }

        return tag;
      })
    );

    const data = await prisma.compDynamPost.create({
      data: {
        authorId: input.authorId,
        z0Expression: input.z0Expression,
        expression: input.expression,
        radius: input.radius,
        originX: input.originX,
        originY: input.originY,
        tags: {
          create: tags.map((tag) => ({
            tag: {
              connect: { id: tag.id },
            },
          })),
        },
      },
    });

    return NextResponse.json({ data });
  } catch (error) {
    return NextResponse.json({ error }, { status: 401 });
  }
}
