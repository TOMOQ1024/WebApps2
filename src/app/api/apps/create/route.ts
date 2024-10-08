import { authOptions } from "@/lib/authOptions";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest, res: NextResponse) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      throw new Error("Unauthorized");
    }
    const { name, description, path, tags } = await req.json();

    // タグがすでに存在するか確認し、なければ作成
    const tagRecords = await Promise.all(
      tags.map(async (tag: string) => {
        return prisma.tag.upsert({
          where: { name: tag },
          update: {},
          create: { name: tag },
        });
      })
    );

    // 新しいアプリを作成し、タグを関連付け
    const newApp = await prisma.app.create({
      data: {
        name,
        description,
        path,
        tags: {
          create: tagRecords.map((tagRecord) => ({
            tagId: tagRecord.id,
          })),
        },
      },
    });

    return NextResponse.json(newApp, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error }, { status: 500 });
  }
}
