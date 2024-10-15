import { NextResponse } from 'next/server';
import prisma from '@/app/lib/prisma';

export async function GET() {
  try {
    const categories = await prisma.traditionCategory.findMany({
      include: {
        _count: {
          select: { traditions: true },
        },
      },
    });

    const chartData = categories.map(category => ({
      category: category.name,
      count: category._count.traditions,
    }));

    return NextResponse.json(chartData);
  } catch (error) {
    console.error('Error fetching tradition chart data:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}