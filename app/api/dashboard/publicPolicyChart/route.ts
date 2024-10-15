import { NextResponse } from 'next/server';
import prisma from '@/app/lib/prisma';

export async function GET() {
  try {
    const policyLevels = await prisma.publicPolicy.groupBy({
      by: ['level'],
      _count: {
        _all: true,
      },
    });

    const chartData = policyLevels.map(level => ({
      level: level.level,
      count: level._count._all,
    }));

    return NextResponse.json(chartData);
  } catch (error) {
    console.error('Error fetching public policy chart data:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}