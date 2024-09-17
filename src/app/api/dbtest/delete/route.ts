import { NextRequest, NextResponse } from 'next/server';
import prisma from "@/lib/prisma";
import { authOptions } from '@/lib/authOptions';
import { getServerSession } from 'next-auth';

export async function POST(
  req: NextRequest,
  res: NextResponse
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      throw new Error('Unauthorized');
    }
    const { id } = await req.json();
    const data = await prisma.post.delete({
      where: {
        id: parseInt(id, 10),
      },
    });
    
    return NextResponse.json({ data });
  } catch (error) {
    return NextResponse.json({ error }, {status: 401});
  }
}
