// app/lib/actions/creative-activity/delete.ts
'use server'

import prisma from '@/app/lib/prisma';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { requireAuth, checkPermissions } from '../shared/auth';
import { deleteFile } from '../shared/upload';
import { ActionResult } from '../shared/types';

export async function deleteCreativeActivity(id: string): Promise<ActionResult> {
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

    // Check if activity exists
    const activity = await prisma.creativeActivity.findUnique({
      where: { id },
      include: {
        images: true,
        user: {
          select: {
            id: true,
            role: true
          }
        }
      }
    });

    if (!activity) {
      return {
        success: false,
        error: 'Creative activity not found'
      };
    }

    // Check permissions (owner or super admin)
    const isOwner = activity.userId === user.id;
    const isSuperAdmin = await checkPermissions(user.id);
    
    if (!isOwner && !isSuperAdmin) {
      return {
        success: false,
        error: 'Insufficient permissions to delete this activity'
      };
    }

    // Delete associated files
    try {
      // Delete images
      for (const image of activity.images) {
        await deleteFile(image.url);
      }

      // Delete report file if exists
      if (activity.reportFileUrl) {
        await deleteFile(activity.reportFileUrl);
      }
    } catch (fileError) {
      console.error('Error deleting files:', fileError);
      // Continue with database deletion even if file deletion fails
    }

    // Delete related records first (due to foreign key constraints)
    await prisma.notification.deleteMany({
      where: {
        activityId: id,
        activityType: 'creativeActivity'
      }
    });

    await prisma.image.deleteMany({
      where: { creativeActivityId: id }
    });

    // Delete the activity
    await prisma.creativeActivity.delete({
      where: { id }
    });

    // Revalidate pages
    revalidatePath('/dashboard/creative-activity');
    revalidatePath('/components/creative-activity');
    revalidatePath('/');

    return {
      success: true,
      message: 'Creative activity deleted successfully'
    };
  } catch (error) {
    console.error('Error deleting creative activity:', error);
    return {
      success: false,
      error: 'Failed to delete creative activity'
    };
  }
}

// Server Action with redirect
export async function deleteCreativeActivityAction(id: string) {
  const result = await deleteCreativeActivity(id);
  
  if (result.success) {
    revalidatePath('/dashboard/creative-activity');
    redirect('/dashboard/creative-activity');
  }
  
  return result;
}

