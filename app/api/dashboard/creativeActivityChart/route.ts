import { NextResponse } from 'next/server';
import prisma from '@/app/lib/prisma';

export async function GET() {
  try {
    const categories = await prisma.creativeCategory.findMany({
      include: {
        subCategories: {
          include: {
            _count: {
              select: { activities: true },
            },
          },
        },
      },
    });

    const chartData = categories.map(category => ({
      category: category.name,
      subCategories: category.subCategories.map(sub => sub.name),
      subCategoryCounts: Object.fromEntries(
        category.subCategories.map(sub => [
          sub.name,
          sub._count.activities
        ])
      ),
    }));

    return NextResponse.json(chartData);
  } catch (error) {
    console.error('Error fetching creative activity chart data:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}