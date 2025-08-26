// app/lib/actions/ethnic-category/delete.ts
'use server'

import prisma from '@/app/lib/prisma';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { requireAuth, checkPermissions } from '../shared/auth';
import { ActionResult } from '../shared/types';

export async function deleteEthnicCategory(id: string): Promise<ActionResult> {
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
    const category = await prisma.ethnicCategory.findUnique({
      where: { id }
    });

    if (!category) {
      return {
        success: false,
        error: 'Ethnic category not found'
      };
    }

    // Check if category is being used by any ethnic groups
    const ethnicGroupsUsingCategory = await prisma.ethnicGroup.findFirst({
      where: { categoryId: id }
    });

    if (ethnicGroupsUsingCategory) {
      return {
        success: false,
        error: 'Cannot delete category. It is being used by ethnic groups.'
      };
    }

    // Delete the category
    await prisma.ethnicCategory.delete({
      where: { id }
    });

    // Revalidate the categories list page
    revalidatePath('/dashboard/ethnic-category');

    return {
      success: true,
      message: 'Ethnic category deleted successfully'
    };
  } catch (error) {
    console.error('Error deleting ethnic category:', error);
    return {
      success: false,
      error: 'Failed to delete ethnic category'
    };
  }
}

// Server Action with redirect
export async function deleteEthnicCategoryAction(id: string) {
  const result = await deleteEthnicCategory(id);
  
  if (result.success) {
    revalidatePath('/dashboard/ethnic-category');
    redirect('/dashboard/ethnic-category');
  }
  
  return result;
}