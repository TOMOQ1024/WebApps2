import { NextRequest, NextResponse } from 'next/server';
import prisma from "@/lib/prisma";
import { authOptions } from '@/lib/authOptions';
import { getServerSession } from 'next-auth';

export async function POST(
  req: NextRequest,
  res: NextResponse
) {
  try {
    const user = await getServerSession(authOptions);
    if (!user) {
      throw new Error('no session data');
    }
    const { expression } = await req.json();
    const data = await prisma.post.create({
      select: {
        id: true,
        expression: true,
        // title: true,
        // description: true,
      },
      data: {
        expression: expression,
      },
    });
    
    return NextResponse.json({ data });
  } catch (error) {
    return NextResponse.json({ error }, {status: 403});
  }
}
