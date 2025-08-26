// app/lib/actions/tradition/delete.ts
'use server'

import prisma from '@/app/lib/prisma';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { requireAuth, checkPermissions } from '../shared/auth';
import { deleteFile } from '../shared/upload';
import { ActionResult } from '../shared/types';

export async function deleteTradition(id: string): Promise<ActionResult> {
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

    // Check if tradition exists
    const tradition = await prisma.tradition.findUnique({
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

    if (!tradition) {
      return {
        success: false,
        error: 'Tradition not found'
      };
    }

    // Check permissions (owner or super admin)
    const isOwner = tradition.userId === user.id;
    const isSuperAdmin = await checkPermissions(user.id);
    
    if (!isOwner && !isSuperAdmin) {
      return {
        success: false,
        error: 'Insufficient permissions to delete this tradition'
      };
    }

    // Delete associated files
    try {
      // Delete images
      for (const image of tradition.images) {
        await deleteFile(image.url);
      }
    } catch (fileError) {
      console.error('Error deleting files:', fileError);
      // Continue with database deletion even if file deletion fails
    }

    // Delete related records first (due to foreign key constraints)
    await prisma.notification.deleteMany({
      where: {
        activityId: id,
        activityType: 'tradition'
      }
    });

    await prisma.image.deleteMany({
      where: { traditionId: id }
    });

    // Delete the tradition
    await prisma.tradition.delete({
      where: { id }
    });

    // Revalidate pages
    revalidatePath('/dashboard/tradition');
    revalidatePath('/components/traditions');
    revalidatePath('/');

    return {
      success: true,
      message: 'Tradition deleted successfully'
    };
  } catch (error) {
    console.error('Error deleting tradition:', error);
    return {
      success: false,
      error: 'Failed to delete tradition'
    };
  }
}

// Server Action with redirect
export async function deleteTraditionAction(id: string) {
  const result = await deleteTradition(id);
  
  if (result.success) {
    revalidatePath('/dashboard/tradition');
    redirect('/dashboard/tradition');
  }
  
  return result;
}

// Increment view count
export async function incrementTraditionViewCount(id: string): Promise<ActionResult> {
  try {
    const tradition = await prisma.tradition.findUnique({
      where: { id },
      select: { id: true, viewCount: true }
    });

    if (!tradition) {
      return {
        success: false,
        error: 'Tradition not found'
      };
    }

    const updatedTradition = await prisma.tradition.update({
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
      data: updatedTradition
    };
  } catch (error) {
    console.error('Error incrementing tradition view count:', error);
    return {
      success: false,
      error: 'Failed to increment view count'
    };
  }
}