// app/lib/actions/creative-category/delete.ts
'use server'

import prisma from '@/app/lib/prisma';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { requireAuth, checkPermissions } from '../shared/auth';
import { ActionResult } from '../shared/types';

export async function deleteCreativeCategory(id: string): Promise<ActionResult> {
  try {
    // Check authentication
    const authResult = await requireAuth();
    if (!authResult.success) {
      return authResult;
    }

    const user = authResult.data?.user;
    if (!user) {
      return {
        success: false,
        error: 'User not found'
      };
    }

    // Check permissions (only super admin can delete categories)
    const hasPermission = await checkPermissions(user.id);
    if (!hasPermission) {
      return {
        success: false,
        error: 'Insufficient permissions'
      };
    }

    // Check if category exists
    const category = await prisma.creativeCategory.findUnique({
      where: { id }
    });

    if (!category) {
      return {
        success: false,
        error: 'Creative category not found'
      };
    }

    // Check if category is being used by any activities
    const activitiesUsingCategory = await prisma.creativeActivity.findFirst({
      where: { categoryId: id }
    });

    if (activitiesUsingCategory) {
      return {
        success: false,
        error: 'Cannot delete category. It is being used by creative activities.'
      };
    }

    // Check if category has subcategories
    const subCategories = await prisma.creativeSubCategory.findFirst({
      where: { categoryId: id }
    });

    if (subCategories) {
      return {
        success: false,
        error: 'Cannot delete category. It has subcategories. Please delete subcategories first.'
      };
    }

    // Delete the category
    await prisma.creativeCategory.delete({
      where: { id }
    });

    // Revalidate the categories list page
    revalidatePath('/dashboard/creative-category');

    return {
      success: true,
      message: 'Creative category deleted successfully'
    };
  } catch (error) {
    console.error('Error deleting creative category:', error);
    return {
      success: false,
      error: 'Failed to delete creative category'
    };
  }
}

// Server Action with redirect
export async function deleteCreativeCategoryAction(id: string) {
  const result = await deleteCreativeCategory(id);
  
  if (result.success) {
    revalidatePath('/dashboard/creative-category');
    redirect('/dashboard/creative-category');
  }
  
  return result;
}