import prisma from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  req: NextRequest,
  res: NextResponse
) {
  try {
    const username = req.headers.get('username') || '';
    const passhash = req.headers.get('passhash') || '';
    console.log(username, passhash, prisma);
    console.log(`findmany: ${await prisma.user.findMany()}`);
    const user = await prisma.user.findFirst({
      where: {
        name: username,
        passhash: passhash
      }
    })
    console.log(user);
    if (user) {
      return NextResponse.json(user);
    } else {
      throw new Error('Invalid password');
    }
  } catch (error: any) {
    return NextResponse.json({error: error.message}, { status: 403 });
  }
}
