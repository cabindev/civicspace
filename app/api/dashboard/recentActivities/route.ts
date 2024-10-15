import { NextResponse } from 'next/server';
import prisma from '@/app/lib/prisma';

export async function GET() {
  try {
    const recentActivities = await prisma.creativeActivity.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      select: {
        name: true,
        type: true,
        createdAt: true,
      },
    });

    const formattedActivities = recentActivities.map(activity => ({
      description: `New ${activity.type}: ${activity.name}`,
      date: activity.createdAt.toISOString(),
    }));

    return NextResponse.json(formattedActivities);
  } catch (error) {
    console.error('Error fetching recent activities:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}