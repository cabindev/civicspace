import { NextResponse } from 'next/server';
import prisma from '@/app/lib/prisma';

export async function GET() {
  try {
    const [userCount, creativeActivityCount, traditionCount, publicPolicyCount, ethnicGroupCount] = await Promise.all([
      prisma.user.count(),
      prisma.creativeActivity.count(),
      prisma.tradition.count(),
      prisma.publicPolicy.count(),
      prisma.ethnicGroup.count(),
    ]);

    return NextResponse.json({
      userCount,
      creativeActivityCount,
      traditionCount,
      publicPolicyCount,
      ethnicGroupCount,
    });
  } catch (error) {
    console.error('Error fetching overview data:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}