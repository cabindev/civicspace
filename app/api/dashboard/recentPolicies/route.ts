// api/dashboard/recentPolicies/route.ts
import { NextResponse } from 'next/server';
import prisma from '@/app/lib/prisma';

export async function GET() {
  try {
    const recentPolicies = await prisma.publicPolicy.findMany({
      take: 5,
      orderBy: { signingDate: 'desc' },
      select: {
        name: true,
        signingDate: true,
        level: true,
        district: true,
        amphoe: true,
        province: true,
      },
    });

    return NextResponse.json(recentPolicies);
  } catch (error) {
    console.error('Error fetching recent policies:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}