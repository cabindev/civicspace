// app/lib/actions/ethnic-group/delete.ts
'use server'

import prisma from '@/app/lib/prisma';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { requireAuth, checkPermissions } from '../shared/auth';
import { deleteFile } from '../shared/upload';
import { ActionResult } from '../shared/types';

export async function deleteEthnicGroup(id: string): Promise<ActionResult> {
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

    // Check if ethnic group exists
    const ethnicGroup = await prisma.ethnicGroup.findUnique({
      where: { id },
      select: {
        id: true,
        fileUrl: true,
        userId: true,
        images: true,
        user: {
          select: {
            id: true,
            role: true
          }
        }
      }
    });

    if (!ethnicGroup) {
      return {
        success: false,
        error: 'Ethnic group not found'
      };
    }

    // Check permissions (owner or super admin)
    const isOwner = ethnicGroup.userId === user.id;
    const isSuperAdmin = await checkPermissions(user.id);
    
    if (!isOwner && !isSuperAdmin) {
      return {
        success: false,
        error: 'Insufficient permissions to delete this ethnic group'
      };
    }

    // Delete associated files
    try {
      // Delete images
      for (const image of ethnicGroup.images) {
        await deleteFile(image.url);
      }

      // Delete report file if exists
      if (ethnicGroup.fileUrl) {
        await deleteFile(ethnicGroup.fileUrl);
      }
    } catch (fileError) {
      console.error('Error deleting files:', fileError);
      // Continue with database deletion even if file deletion fails
    }

    // Delete related records first (due to foreign key constraints)
    await prisma.notification.deleteMany({
      where: {
        activityId: id,
        activityType: 'ethnicGroup'
      }
    });

    await prisma.image.deleteMany({
      where: { ethnicGroupId: id }
    });

    // Delete the ethnic group
    await prisma.ethnicGroup.delete({
      where: { id }
    });

    // Revalidate pages
    revalidatePath('/dashboard/ethnic-group');
    revalidatePath('/components/ethnic-group');
    revalidatePath('/');

    return {
      success: true,
      message: 'Ethnic group deleted successfully'
    };
  } catch (error) {
    console.error('Error deleting ethnic group:', error);
    return {
      success: false,
      error: 'Failed to delete ethnic group'
    };
  }
}

// Server Action with redirect
export async function deleteEthnicGroupAction(id: string) {
  const result = await deleteEthnicGroup(id);
  
  if (result.success) {
    revalidatePath('/dashboard/ethnic-group');
    redirect('/dashboard/ethnic-group');
  }
  
  return result;
}

// Increment view count
export async function incrementEthnicGroupViewCount(id: string): Promise<ActionResult> {
  try {
    const ethnicGroup = await prisma.ethnicGroup.findUnique({
      where: { id },
      select: { id: true, viewCount: true }
    });

    if (!ethnicGroup) {
      return {
        success: false,
        error: 'Ethnic group not found'
      };
    }

    const updatedEthnicGroup = await prisma.ethnicGroup.update({
      where: { id },
      data: {
        viewCount: {
          increment: 1
        }
      },
      select: {
        id: true,
        viewCount: true
      }
    });

    return {
      success: true,
      data: updatedEthnicGroup
    };
  } catch (error) {
    console.error('Error incrementing ethnic group view count:', error);
    return {
      success: false,
      error: 'Failed to increment view count'
    };
  }
}