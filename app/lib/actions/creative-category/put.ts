// app/lib/actions/creative-category/put.ts
'use server'

import prisma from '@/app/lib/prisma';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { requireAuth } from '../shared/auth';
import { validateFormData, extractFormDataString } from '../shared/validation';
import { ActionResult } from '../shared/types';

export async function updateCreativeCategory(id: string, formData: FormData): Promise<ActionResult> {
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

    // Check if category exists
    const existingCategory = await prisma.creativeCategory.findUnique({
      where: { id }
    });

    if (!existingCategory) {
      return {
        success: false,
        error: 'Creative category not found'
      };
    }

    // Check if name is already used by another category
    const duplicateCategory = await prisma.creativeCategory.findFirst({
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
    const updatedCategory = await prisma.creativeCategory.update({
      where: { id },
      data: { name }
    });

    // Revalidate pages
    revalidatePath('/dashboard/creative-category');
    revalidatePath(`/dashboard/creative-category/${id}`);

    return {
      success: true,
      data: updatedCategory,
      message: 'Creative category updated successfully'
    };
  } catch (error) {
    console.error('Error updating creative category:', error);
    return {
      success: false,
      error: 'Failed to update creative category'
    };
  }
}

// Server Action with redirect (for form submissions)
export async function updateCreativeCategoryAction(id: string, prevState: ActionResult, formData: FormData) {
  const result = await updateCreativeCategory(id, formData);
  
  if (result.success) {
    redirect('/dashboard/creative-category');
  }
  
  return result;
}