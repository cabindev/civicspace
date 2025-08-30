// app/lib/actions/tradition-category/put.ts
'use server'

import prisma from '@/app/lib/prisma';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { requireAuth } from '../shared/auth';
import { validateFormData, extractFormDataString } from '../shared/validation';
import { ActionResult } from '../shared/types';

export async function updateTraditionCategory(id: string, formData: FormData): Promise<ActionResult> {
  try {
    // Check authentication
    const authResult = await requireAuth();
    if (!authResult.success) {
      return authResult;
    }

    // Validate required fields
    const validation = validateFormData(formData, ['name']);
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

    // Check if category exists
    const existingCategory = await prisma.traditionCategory.findUnique({
      where: { id }
    });

    if (!existingCategory) {
      return {
        success: false,
        error: 'Tradition category not found'
      };
    }

    // Check if name is already used by another category
    const duplicateCategory = await prisma.traditionCategory.findFirst({
      where: { 
        name,
        id: { not: id }
      }
    });

    if (duplicateCategory) {
      return {
        success: false,
        error: 'Category name already exists'
      };
    }

    // Update the category
    const updatedCategory = await prisma.traditionCategory.update({
      where: { id },
      data: { name }
    });

    // Revalidate pages
    revalidatePath('/dashboard/tradition-category');
    revalidatePath(`/dashboard/tradition-category/${id}`);

    return {
      success: true,
      data: updatedCategory,
      message: 'Tradition category updated successfully'
    };
  } catch (error) {
    console.error('Error updating tradition category:', error);
    return {
      success: false,
      error: 'Failed to update tradition category'
    };
  }
}

// Server Action with redirect (for form submissions)
export async function updateTraditionCategoryAction(id: string, prevState: ActionResult, formData: FormData) {
  const result = await updateTraditionCategory(id, formData);
  
  if (result.success) {
    redirect('/dashboard/tradition-category');
  }
  
  return result;
}