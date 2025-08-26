// app/lib/actions/search/autocomplete.ts
'use server'

import prisma from '@/app/lib/prisma';
import { ActionResult } from '../shared/types';

export interface AutocompleteResult {
  id: string;
  name: string;
  type: 'tradition' | 'publicPolicy' | 'ethnicGroup' | 'creativeActivity';
}

export async function getAutocompleteResults(
  query: string,
  limit: number = 5
): Promise<ActionResult<AutocompleteResult[]>> {
  try {
    if (!query || query.trim().length === 0) {
      return {
        success: true,
        data: []
      };
    }

    const searchQuery = query.trim();

    const [traditions, publicPolicies, ethnicGroups, creativeActivities] = await Promise.all([
      prisma.tradition.findMany({
        where: { 
          name: { 
            contains: searchQuery
          } 
        },
        select: { id: true, name: true },
        take: limit,
      }),
      prisma.publicPolicy.findMany({
        where: { 
          name: { 
            contains: searchQuery
          } 
        },
        select: { id: true, name: true },
        take: limit,
      }),
      prisma.ethnicGroup.findMany({
        where: { 
          name: { 
            contains: searchQuery
          } 
        },
        select: { id: true, name: true },
        take: limit,
      }),
      prisma.creativeActivity.findMany({
        where: { 
          name: { 
            contains: searchQuery
          } 
        },
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

    // Sort by relevance (exact matches first, then partial matches)
    const sortedResults = results.sort((a, b) => {
      const aExact = a.name.toLowerCase() === searchQuery.toLowerCase();
      const bExact = b.name.toLowerCase() === searchQuery.toLowerCase();
      
      if (aExact && !bExact) return -1;
      if (!aExact && bExact) return 1;
      
      // If both are exact or both are partial, sort alphabetically
      return a.name.localeCompare(b.name, 'th');
    });

    return {
      success: true,
      data: sortedResults.slice(0, limit)
    };
  } catch (error) {
    console.error('Autocomplete error:', error);
    return {
      success: false,
      error: 'เกิดข้อผิดพลาดในการค้นหา'
    };
  }
}