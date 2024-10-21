import { NextResponse } from 'next/server';
import prisma from '@/app/lib/prisma';

export async function GET() {
  try {
    const categories = await prisma.creativeCategory.findMany({
      include: {
        _count: {
          select: { activities: true },
        },
        activities: {
          select: {
            name: true,
            createdAt: true,
          },
          orderBy: {
            createdAt: 'desc',
          },
          take: 5, // แสดงเฉพาะ 5 กิจกรรมล่าสุด
        },
      },
    });

    const chartData = categories.map(category => ({
      category: category.name,
      activityCount: category._count.activities,
      recentActivities: category.activities.map(activity => ({
        name: activity.name,
        date: activity.createdAt,
      })),
    }));

    return NextResponse.json(chartData);
  } catch (error) {
    console.error('Error fetching creative activity chart data:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}