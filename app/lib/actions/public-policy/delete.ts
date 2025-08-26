// app/lib/actions/public-policy/delete.ts
'use server'

import prisma from '@/app/lib/prisma';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { requireAuth, checkPermissions } from '../shared/auth';
import { deleteFile } from '../shared/upload';
import { ActionResult } from '../shared/types';

export async function deletePublicPolicy(id: string): Promise<ActionResult> {
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

    // Check if policy exists
    const policy = await prisma.publicPolicy.findUnique({
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

    if (!policy) {
      return {
        success: false,
        error: 'Public policy not found'
      };
    }

    // Check permissions (owner or super admin)
    const isOwner = policy.userId === user.id;
    const isSuperAdmin = await checkPermissions(user.id);
    
    if (!isOwner && !isSuperAdmin) {
      return {
        success: false,
        error: 'Insufficient permissions to delete this policy'
      };
    }

    // Delete associated files
    try {
      // Delete images
      for (const image of policy.images) {
        await deleteFile(image.url);
      }

      // Delete policy file if exists
      if (policy.policyFileUrl) {
        await deleteFile(policy.policyFileUrl);
      }
    } catch (fileError) {
      console.error('Error deleting files:', fileError);
      // Continue with database deletion even if file deletion fails
    }

    // Delete related records first (due to foreign key constraints)
    await prisma.notification.deleteMany({
      where: {
        activityId: id,
        activityType: 'publicPolicy'
      }
    });

    await prisma.image.deleteMany({
      where: { publicPolicyId: id }
    });

    // Delete the policy
    await prisma.publicPolicy.delete({
      where: { id }
    });

    // Revalidate pages
    revalidatePath('/dashboard/public-policy');
    revalidatePath('/components/public-policy');
    revalidatePath('/');

    return {
      success: true,
      message: 'Public policy deleted successfully'
    };
  } catch (error) {
    console.error('Error deleting public policy:', error);
    return {
      success: false,
      error: 'Failed to delete public policy'
    };
  }
}

// Server Action with redirect
export async function deletePublicPolicyAction(id: string) {
  const result = await deletePublicPolicy(id);
  
  if (result.success) {
    revalidatePath('/dashboard/public-policy');
    redirect('/dashboard/public-policy');
  }
  
  return result;
}

// Increment view count
export async function incrementPublicPolicyViewCount(id: string): Promise<ActionResult> {
  try {
    const policy = await prisma.publicPolicy.findUnique({
      where: { id },
      select: { id: true, viewCount: true }
    });

    if (!policy) {
      return {
        success: false,
        error: 'Public policy not found'
      };
    }

    const updatedPolicy = await prisma.publicPolicy.update({
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
      data: updatedPolicy
    };
  } catch (error) {
    console.error('Error incrementing public policy view count:', error);
    return {
      success: false,
      error: 'Failed to increment view count'
    };
  }
}