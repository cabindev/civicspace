// app/lib/actions/creative-category/post.ts
'use server'

import prisma from '@/app/lib/prisma';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { requireAuth } from '../shared/auth';
import { validateFormData, extractFormDataString } from '../shared/validation';
import { ActionResult } from '../shared/types';

export async function createCreativeCategory(formData: FormData): Promise<ActionResult> {
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

    // Check if category name already exists
    const existingCategory = await prisma.creativeCategory.findFirst({
      where: { name }
    });

    if (existingCategory) {
      return {
        success: false,
        error: 'Category name already exists'
      };
    }

    // Create the category
    const category = await prisma.creativeCategory.create({
      data: { name }
    });

    // Revalidate the categories list page
    revalidatePath('/dashboard/creative-category');

    return {
      success: true,
      data: category,
      message: 'Creative category created successfully'
    };
  } catch (error) {
    console.error('Error creating creative category:', error);
    return {
      success: false,
      error: 'Failed to create creative category'
    };
  }
}

// Server Action with redirect (for form submissions)
export async function createCreativeCategoryAction(prevState: ActionResult, formData: FormData) {
  const result = await createCreativeCategory(formData);
  
  if (result.success) {
    redirect('/dashboard/creative-category');
  }
  
  // If there's an error, it will be handled by the form component
  return result;
}