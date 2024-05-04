import { NextRequest, NextResponse } from 'next/server';
import prisma from "@/lib/prisma";
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';

export async function GET(
  req: NextRequest,
  res: NextResponse
) {
  try {
    const user = await getServerSession(authOptions);
    if (!user) {
      throw new Error('no session data');
    }
    const data = await prisma.post.findMany();
    
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error }, {status: 403});
  }
}
