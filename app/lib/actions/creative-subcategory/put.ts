// app/lib/actions/creative-subcategory/put.ts
'use server'

import prisma from '@/app/lib/prisma';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { requireAuth } from '../shared/auth';
import { validateFormData, extractFormDataString } from '../shared/validation';
import { ActionResult } from '../shared/types';

export async function updateCreativeSubCategory(id: string, formData: FormData): Promise<ActionResult> {
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

    if (!name) {
      return {
        success: false,
        error: 'Name is required'
      };
    }
    const categoryId = extractFormDataString(formData, 'categoryId');

    if (!name || !categoryId) {
      return {
        success: false,
        error: 'Name and category ID are required'
      };
    }

    // Check if subcategory exists
    const existingSubCategory = await prisma.creativeSubCategory.findUnique({
      where: { id }
    });

    if (!existingSubCategory) {
      return {
        success: false,
        error: 'Creative subcategory not found'
      };
    }

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

    // Check if name is already used by another subcategory in the same category
    const duplicateSubCategory = await prisma.creativeSubCategory.findFirst({
      where: { 
        name,
        categoryId,
        id: { not: id }
      }
    });

    if (duplicateSubCategory) {
      return {
        success: false,
        error: 'Subcategory name already exists in this category'
      };
    }

    // Update the subcategory
    const updatedSubCategory = await prisma.creativeSubCategory.update({
      where: { id },
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

    // Revalidate pages
    revalidatePath('/dashboard/creative-subcategory');
    revalidatePath(`/dashboard/creative-subcategory/${id}`);
    revalidatePath('/dashboard/creative-category');

    return {
      success: true,
      data: updatedSubCategory,
      message: 'Creative subcategory updated successfully'
    };
  } catch (error) {
    console.error('Error updating creative subcategory:', error);
    return {
      success: false,
      error: 'Failed to update creative subcategory'
    };
  }
}

// Server Action with redirect (for form submissions)
export async function updateCreativeSubCategoryAction(id: string, formData: FormData) {
  const result = await updateCreativeSubCategory(id, formData);
  
  if (result.success) {
    redirect('/dashboard/creative-subcategory');
  }
  
  return result;
}