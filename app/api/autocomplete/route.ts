import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/app/lib/prisma';

export interface AutocompleteResult {
  id: string;
  name: string;
  type: 'tradition' | 'publicPolicy' | 'ethnicGroup' | 'creativeActivity';
}

export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams.get('q');
  const limit = parseInt(request.nextUrl.searchParams.get('limit') || '5', 10);

  if (!query) {
    return NextResponse.json({ results: [] });
  }

  try {
    const [traditions, publicPolicies, ethnicGroups, creativeActivities] = await Promise.all([
      prisma.tradition.findMany({
        where: { name: { contains: query } },
        select: { id: true, name: true },
        take: limit,
      }),
      prisma.publicPolicy.findMany({
        where: { name: { contains: query } },
        select: { id: true, name: true },
        take: limit,
      }),
      prisma.ethnicGroup.findMany({
        where: { name: { contains: query } },
        select: { id: true, name: true },
        take: limit,
      }),
      prisma.creativeActivity.findMany({
        where: { name: { contains: query } },
        select: { id: true, name: true },
        take: limit,
      }),
    ]);

    const results: AutocompleteResult[] = [
      ...traditions.map(t => ({ id: t.id, name: t.name, type: 'tradition' as const })),
      ...publicPolicies.map(p => ({ id: p.id, name: p.name, type: 'publicPolicy' as const })),
      ...ethnicGroups.map(e => ({ id: e.id, name: e.name, type: 'ethnicGroup' as const })),
      ...creativeActivities.map(c => ({ id: c.id, name: c.name, type: 'creativeActivity' as const })),
    ];

    return NextResponse.json({ results });
  } catch (error) {
    console.error('Autocomplete error:', error);
    return NextResponse.json({ error: 'เกิดข้อผิดพลาดในการค้นหา' }, { status: 500 });
  }
}