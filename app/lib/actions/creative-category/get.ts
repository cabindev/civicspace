// app/lib/actions/creative-category/get.ts
'use server'

import prisma from '@/app/lib/prisma';
import { ActionResult } from '../shared/types';

export async function getCreativeCategories(): Promise<ActionResult> {
  try {
    const categories = await prisma.creativeCategory.findMany({
      include: { subCategories: true },
      orderBy: { name: 'asc' }
    });

    return {
      success: true,
      data: categories
    };
  } catch (error) {
    console.error('Error fetching creative categories:', error);
    return {
      success: false,
      error: 'Failed to fetch creative categories'
    };
  }
}

export async function getCreativeCategoryById(id: string): Promise<ActionResult> {
  try {
    const category = await prisma.creativeCategory.findUnique({
      where: { id },
      include: { subCategories: true }
    });

    if (!category) {
      return {
        success: false,
        error: 'Creative category not found'
      };
    }

    return {
      success: true,
      data: category
    };
  } catch (error) {
    console.error('Error fetching creative category:', error);
    return {
      success: false,
      error: 'Failed to fetch creative category'
    };
  }
}