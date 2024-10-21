import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/app/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const latestTraditions = await prisma.tradition.findMany({
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

    const formattedTraditions = latestTraditions.map(tradition => ({
      ...tradition,
      createdAt: tradition.createdAt.toISOString()
    }));

    return NextResponse.json(formattedTraditions);
  } catch (error) {
    console.error('Error fetching latest traditions for home page:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}