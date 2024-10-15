import { NextResponse } from 'next/server';
import prisma from '@/app/lib/prisma';

export async function GET() {
  try {
    const ethnicCategories = await prisma.ethnicCategory.findMany({
      include: {
        _count: {
          select: { ethnicGroups: true },
        },
      },
    });

    const chartData = ethnicCategories.map(category => ({
      category: category.name,
      count: category._count.ethnicGroups,
    }));

    return NextResponse.json(chartData);
  } catch (error) {
    console.error('Error fetching ethnic group chart data:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}