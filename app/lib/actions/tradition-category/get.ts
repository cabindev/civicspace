// app/lib/actions/tradition-category/get.ts
'use server'

import prisma from '@/app/lib/prisma';
import { ActionResult } from '../shared/types';

export async function getTraditionCategories(): Promise<ActionResult> {
  try {
    const categories = await prisma.traditionCategory.findMany({
      orderBy: { name: 'asc' },
      include: {
        _count: {
          select: {
            traditions: true
          }
        }
      }
    });

    return {
      success: true,
      data: categories
    };
  } catch (error) {
    console.error('Error fetching tradition categories:', error);
    return {
      success: false,
      error: 'Failed to fetch tradition categories'
    };
  }
}

export async function getTraditionCategoryById(id: string): Promise<ActionResult> {
  try {
    const category = await prisma.traditionCategory.findUnique({
      where: { id },
      include: {
        traditions: {
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
        error: 'Tradition category not found'
      };
    }

    return {
      success: true,
      data: category
    };
  } catch (error) {
    console.error('Error fetching tradition category:', error);
    return {
      success: false,
      error: 'Failed to fetch tradition category'
    };
  }
}