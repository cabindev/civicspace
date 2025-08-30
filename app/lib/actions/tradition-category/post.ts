// app/lib/actions/tradition-category/post.ts
'use server'

import prisma from '@/app/lib/prisma';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { requireAuth } from '../shared/auth';
import { validateFormData, extractFormDataString } from '../shared/validation';
import { ActionResult } from '../shared/types';

export async function createTraditionCategory(formData: FormData): Promise<ActionResult> {
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

    // Check if category name already exists
    const existingCategory = await prisma.traditionCategory.findFirst({
      where: { name }
    });

    if (existingCategory) {
      return {
        success: false,
        error: 'Category name already exists'
      };
    }

    // Create the category
    const category = await prisma.traditionCategory.create({
      data: { name }
    });

    // Revalidate the categories list page
    revalidatePath('/dashboard/tradition-category');

    return {
      success: true,
      data: category,
      message: 'Tradition category created successfully'
    };
  } catch (error) {
    console.error('Error creating tradition category:', error);
    return {
      success: false,
      error: 'Failed to create tradition category'
    };
  }
}

// Server Action with redirect (for form submissions)
export async function createTraditionCategoryAction(prevState: ActionResult, formData: FormData) {
  const result = await createTraditionCategory(formData);
  
  if (result.success) {
    redirect('/dashboard/tradition-category');
  }
  
  return result;
}