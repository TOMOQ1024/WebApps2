import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest, res: NextResponse) {
  const { name, description, path, tags } = await req.json();

  try {
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
    console.error(error);
    return NextResponse.json({ error: "Failed to add app" }, { status: 500 });
  }
}
