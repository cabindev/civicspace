import { NextResponse } from 'next/server';
import prisma from '@/app/lib/prisma';

export async function GET() {
  try {
    const latestEthnicGroups = await prisma.ethnicGroup.findMany({
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

    const formattedEthnicGroups = latestEthnicGroups.map(group => ({
      ...group,
      createdAt: group.createdAt.toISOString()
    }));

    return NextResponse.json(formattedEthnicGroups);
  } catch (error) {
    console.error('Error fetching latest ethnic groups for home page:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}