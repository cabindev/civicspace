// app/lib/actions/creative-subcategory/post.ts
'use server'

import prisma from '@/app/lib/prisma';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { requireAuth } from '../shared/auth';
import { validateFormData, extractFormDataString } from '../shared/validation';
import { ActionResult } from '../shared/types';

export async function createCreativeSubCategory(formData: FormData): Promise<ActionResult> {
  try {
    // Check authentication
    const authResult = await requireAuth();
    if (!authResult.success) {
      return authResult;
    }

    // Validate required fields
    const validation = validateFormData(formData, ['name', 'categoryId']);
    if (!validation.success) {
      return validation;
    }

    const name = extractFormDataString(formData, 'name');
    const categoryId = extractFormDataString(formData, 'categoryId');

    // Check if category exists
    const category = await prisma.creativeCategory.findUnique({
      where: { id: categoryId }
    });

    if (!category) {
      return {
        success: false,
        error: 'Creative category not found'
      };
    }

    // Check if subcategory name already exists in this category
    const existingSubCategory = await prisma.creativeSubCategory.findFirst({
      where: { 
        name,
        categoryId 
      }
    });

    if (existingSubCategory) {
      return {
        success: false,
        error: 'Subcategory name already exists in this category'
      };
    }

    // Create the subcategory
    const subcategory = await prisma.creativeSubCategory.create({
      data: { 
        name,
        categoryId 
      },
      include: {
        category: {
          select: {
            id: true,
            name: true
          }
        }
      }
    });

    // Revalidate the subcategories list page
    revalidatePath('/dashboard/creative-subcategory');
    revalidatePath('/dashboard/creative-category');

    return {
      success: true,
      data: subcategory,
      message: 'Creative subcategory created successfully'
    };
  } catch (error) {
    console.error('Error creating creative subcategory:', error);
    return {
      success: false,
      error: 'Failed to create creative subcategory'
    };
  }
}

// Server Action with redirect (for form submissions)
export async function createCreativeSubCategoryAction(formData: FormData) {
  const result = await createCreativeSubCategory(formData);
  
  if (result.success) {
    redirect('/dashboard/creative-subcategory');
  }
  
  return result;
}