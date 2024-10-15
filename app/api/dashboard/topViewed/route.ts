import { NextResponse } from 'next/server';
import prisma from '@/app/lib/prisma';

export async function GET() {
  try {
    const [topTraditions, topPolicies] = await Promise.all([
      prisma.tradition.findMany({
        take: 5,
        orderBy: { viewCount: 'desc' },
        select: { name: true, type: true, viewCount: true },
      }),
      prisma.publicPolicy.findMany({
        take: 5,
        orderBy: { viewCount: 'desc' },
        select: { name: true, type: true, viewCount: true },
      }),
    ]);

    const topItems = [...topTraditions, ...topPolicies]
      .sort((a, b) => b.viewCount - a.viewCount)
      .slice(0, 5);

    return NextResponse.json(topItems);
  } catch (error) {
    console.error('Error fetching top viewed items:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}