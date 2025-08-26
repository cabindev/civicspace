// app/lib/actions/creative-subcategory/get.ts
'use server'

import prisma from '@/app/lib/prisma';
import { ActionResult } from '../shared/types';

export async function getCreativeSubCategories(): Promise<ActionResult> {
  try {
    const subcategories = await prisma.creativeSubCategory.findMany({
      orderBy: { name: 'asc' },
      include: {
        category: {
          select: {
            id: true,
            name: true
          }
        },
        _count: {
          select: {
            activities: true
          }
        }
      }
    });

    return {
      success: true,
      data: subcategories
    };
  } catch (error) {
    console.error('Error fetching creative subcategories:', error);
    return {
      success: false,
      error: 'Failed to fetch creative subcategories'
    };
  }
}

export async function getCreativeSubCategoryById(id: string): Promise<ActionResult> {
  try {
    const subcategory = await prisma.creativeSubCategory.findUnique({
      where: { id },
      include: {
        category: {
          select: {
            id: true,
            name: true
          }
        },
        activities: {
          select: {
            id: true,
            name: true
          }
        }
      }
    });

    if (!subcategory) {
      return {
        success: false,
        error: 'Creative subcategory not found'
      };
    }

    return {
      success: true,
      data: subcategory
    };
  } catch (error) {
    console.error('Error fetching creative subcategory:', error);
    return {
      success: false,
      error: 'Failed to fetch creative subcategory'
    };
  }
}

export async function getCreativeSubCategoriesByCategoryId(categoryId: string): Promise<ActionResult> {
  try {
    const subcategories = await prisma.creativeSubCategory.findMany({
      where: { categoryId },
      orderBy: { name: 'asc' },
      include: {
        _count: {
          select: {
            activities: true
          }
        }
      }
    });

    return {
      success: true,
      data: subcategories
    };
  } catch (error) {
    console.error('Error fetching creative subcategories by category:', error);
    return {
      success: false,
      error: 'Failed to fetch creative subcategories'
    };
  }
}