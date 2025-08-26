// app/lib/actions/ethnic-category/get.ts
'use server'

import prisma from '@/app/lib/prisma';
import { ActionResult } from '../shared/types';

export async function getEthnicCategories(): Promise<ActionResult> {
  try {
    // Fetch categories with count in parallel for better performance
    const [categories, counts] = await Promise.all([
      prisma.ethnicCategory.findMany({
        orderBy: { name: 'asc' },
        select: {
          id: true,
          name: true
        }
      }),
      prisma.ethnicGroup.groupBy({
        by: ['categoryId'],
        _count: {
          id: true
        }
      })
    ]);

    // Map counts to categories
    const countMap = new Map(counts.map(c => [c.categoryId, c._count.id]));
    const categoriesWithCount = categories.map(category => ({
      ...category,
      _count: {
        ethnicGroups: countMap.get(category.id) || 0
      }
    }));

    return {
      success: true,
      data: categoriesWithCount
    };
  } catch (error) {
    console.error('Error fetching ethnic categories:', error);
    return {
      success: false,
      error: 'Failed to fetch ethnic categories'
    };
  }
}

export async function getEthnicCategoryById(id: string): Promise<ActionResult> {
  try {
    const category = await prisma.ethnicCategory.findUnique({
      where: { id },
      include: {
        ethnicGroups: {
          select: {
            id: true,
            name: true
          }
        }
      }
    });

    if (!category) {
      return {
        success: false,
        error: 'Ethnic category not found'
      };
    }

    return {
      success: true,
      data: category
    };
  } catch (error) {
    console.error('Error fetching ethnic category:', error);
    return {
      success: false,
      error: 'Failed to fetch ethnic category'
    };
  }
}