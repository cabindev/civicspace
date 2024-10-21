//app/api/home/creative-activity/route.ts
import { NextResponse } from 'next/server';
import prisma from '@/app/lib/prisma';
import { revalidatePath } from 'next/cache';

export async function GET() {
  try {
    const latestCreativeActivities = await prisma.creativeActivity.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        category: {
          select: { name: true }
        },
        province: true,
        createdAt: true
      },
    });

    const formattedCreativeActivities = latestCreativeActivities.map(activity => ({
      ...activity,
      createdAt: activity.createdAt.toISOString()
    }));

    revalidatePath ('/api/home/creative-activity')

    return NextResponse.json(formattedCreativeActivities);
  } catch (error) {
    console.error('Error fetching latest creative activities for home page:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}