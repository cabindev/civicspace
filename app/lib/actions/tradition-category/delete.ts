// app/lib/actions/tradition-category/delete.ts
'use server'

import prisma from '@/app/lib/prisma';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { requireAuth, checkPermissions } from '../shared/auth';
import { ActionResult } from '../shared/types';

export async function deleteTraditionCategory(id: string): Promise<ActionResult> {
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
    const category = await prisma.traditionCategory.findUnique({
      where: { id }
    });

    if (!category) {
      return {
        success: false,
        error: 'Tradition category not found'
      };
    }

    // Check if category is being used by any traditions
    const traditionsUsingCategory = await prisma.tradition.findFirst({
      where: { categoryId: id }
    });

    if (traditionsUsingCategory) {
      return {
        success: false,
        error: 'Cannot delete category. It is being used by traditions.'
      };
    }

    // Delete the category
    await prisma.traditionCategory.delete({
      where: { id }
    });

    // Revalidate the categories list page
    revalidatePath('/dashboard/tradition-category');

    return {
      success: true,
      message: 'Tradition category deleted successfully'
    };
  } catch (error) {
    console.error('Error deleting tradition category:', error);
    return {
      success: false,
      error: 'Failed to delete tradition category'
    };
  }
}

// Server Action with redirect (for form submissions)
export async function deleteTraditionCategoryAction(id: string) {
  const result = await deleteTraditionCategory(id);
  
  if (result.success) {
    revalidatePath('/dashboard/tradition-category');
    redirect('/dashboard/tradition-category');
  }
  
  return result;
}

// For client-side calls (without redirect)
export async function deleteTraditionCategoryClient(id: string): Promise<ActionResult> {
  const result = await deleteTraditionCategory(id);
  
  if (result.success) {
    revalidatePath('/dashboard/tradition-category');
  }
  
  return result;
}