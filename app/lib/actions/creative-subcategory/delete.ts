// app/lib/actions/creative-subcategory/delete.ts
'use server'

import prisma from '@/app/lib/prisma';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { requireAuth, checkPermissions } from '../shared/auth';
import { ActionResult } from '../shared/types';

export async function deleteCreativeSubCategory(id: string): Promise<ActionResult> {
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

    // Check permissions (only super admin can delete subcategories)
    const hasPermission = await checkPermissions(user.id);
    if (!hasPermission) {
      return {
        success: false,
        error: 'Insufficient permissions'
      };
    }

    // Check if subcategory exists
    const subcategory = await prisma.creativeSubCategory.findUnique({
      where: { id }
    });

    if (!subcategory) {
      return {
        success: false,
        error: 'Creative subcategory not found'
      };
    }

    // Check if subcategory is being used by any creative activities
    const activitiesUsingSubcategory = await prisma.creativeActivity.findFirst({
      where: { subCategoryId: id }
    });

    if (activitiesUsingSubcategory) {
      return {
        success: false,
        error: 'Cannot delete subcategory. It is being used by creative activities.'
      };
    }

    // Delete the subcategory
    await prisma.creativeSubCategory.delete({
      where: { id }
    });

    // Revalidate the subcategories list page
    revalidatePath('/dashboard/creative-subcategory');
    revalidatePath('/dashboard/creative-category');

    return {
      success: true,
      message: 'Creative subcategory deleted successfully'
    };
  } catch (error) {
    console.error('Error deleting creative subcategory:', error);
    return {
      success: false,
      error: 'Failed to delete creative subcategory'
    };
  }
}

// Server Action with redirect
export async function deleteCreativeSubCategoryAction(id: string) {
  const result = await deleteCreativeSubCategory(id);
  
  if (result.success) {
    revalidatePath('/dashboard/creative-subcategory');
    redirect('/dashboard/creative-subcategory');
  }
  
  return result;
}