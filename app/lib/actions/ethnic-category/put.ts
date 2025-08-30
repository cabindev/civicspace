// app/lib/actions/ethnic-category/put.ts
'use server'

import prisma from '@/app/lib/prisma';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { requireAuth } from '../shared/auth';
import { validateFormData, extractFormDataString } from '../shared/validation';
import { ActionResult } from '../shared/types';

// Direct update function (for client-side calls)
export async function updateEthnicCategoryDirect(id: string, formData: FormData): Promise<ActionResult> {
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
    const existingCategory = await prisma.ethnicCategory.findUnique({
      where: { id }
    });

    if (!existingCategory) {
      return {
        success: false,
        error: 'Ethnic category not found'
      };
    }

    // Check if name is already used by another category
    const duplicateCategory = await prisma.ethnicCategory.findFirst({
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
    const updatedCategory = await prisma.ethnicCategory.update({
      where: { id },
      data: { name }
    });

    // Revalidate pages
    revalidatePath('/dashboard/ethnic-category');
    revalidatePath(`/dashboard/ethnic-category/${id}`);

    return {
      success: true,
      data: updatedCategory,
      message: 'Ethnic category updated successfully'
    };
  } catch (error) {
    console.error('Error updating ethnic category:', error);
    return {
      success: false,
      error: 'Failed to update ethnic category'
    };
  }
}

export async function updateEthnicCategory(id: string, formData: FormData): Promise<ActionResult> {
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
    const existingCategory = await prisma.ethnicCategory.findUnique({
      where: { id }
    });

    if (!existingCategory) {
      return {
        success: false,
        error: 'Ethnic category not found'
      };
    }

    // Check if name is already used by another category
    const duplicateCategory = await prisma.ethnicCategory.findFirst({
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
    const updatedCategory = await prisma.ethnicCategory.update({
      where: { id },
      data: { name }
    });

    // Revalidate pages
    revalidatePath('/dashboard/ethnic-category');
    revalidatePath(`/dashboard/ethnic-category/${id}`);

    return {
      success: true,
      data: updatedCategory,
      message: 'Ethnic category updated successfully'
    };
  } catch (error) {
    console.error('Error updating ethnic category:', error);
    return {
      success: false,
      error: 'Failed to update ethnic category'
    };
  }
}

// Server Action with redirect (for form submissions)
export async function updateEthnicCategoryAction(id: string, formData: FormData) {
  const result = await updateEthnicCategory(id, formData);
  
  if (result.success) {
    redirect('/dashboard/ethnic-category');
  }
  
  return result;
}