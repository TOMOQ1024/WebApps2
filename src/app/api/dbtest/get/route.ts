import { NextRequest, NextResponse } from 'next/server';
import prisma from "@/lib/prisma";
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';

export async function GET(
  req: NextRequest,
  res: NextResponse
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      throw new Error('Unauthorized');
    }
    const data = await prisma.post.findMany();
    
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error }, {status: 401});
  }
}
