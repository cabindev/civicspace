// app/lib/actions/users/delete.ts
'use server'

import prisma from '@/app/lib/prisma';
import { revalidatePath } from 'next/cache';
import { requireAuth, checkPermissions } from '../shared/auth';
import { ActionResult } from '../shared/types';

export async function deleteUser(userId: number): Promise<ActionResult> {
  try {
    // Check authentication
    const authResult = await requireAuth();
    if (!authResult.success) {
      return authResult;
    }

    const currentUser = authResult.data?.user;
    if (!currentUser) {
      return {
        success: false,
        error: 'User not found'
      };
    }

    // Check if user has permission to delete users (must be super admin)
    const isSuperAdmin = await checkPermissions(currentUser.id);
    if (!isSuperAdmin) {
      return {
        success: false,
        error: 'Insufficient permissions to delete users'
      };
    }

    // Prevent self-deletion
    if (currentUser.id === userId) {
      return {
        success: false,
        error: 'Cannot delete your own account'
      };
    }

    // Check if user exists
    const userToDelete = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        _count: {
          select: {
            traditions: true,
            publicPolicies: true,
            ethnicGroups: true,
            creativeActivities: true,
            notifications: true
          }
        }
      }
    });

    if (!userToDelete) {
      return {
        success: false,
        error: 'User not found'
      };
    }

    // Check if user has associated data
    const hasAssociatedData = (
      userToDelete._count.traditions > 0 ||
      userToDelete._count.publicPolicies > 0 ||
      userToDelete._count.ethnicGroups > 0 ||
      userToDelete._count.creativeActivities > 0
    );

    if (hasAssociatedData) {
      return {
        success: false,
        error: 'Cannot delete user with associated data. Please transfer or delete their content first.'
      };
    }

    // Delete associated notifications first
    await prisma.notification.deleteMany({
      where: { userId }
    });

    // Delete the user
    await prisma.user.delete({
      where: { id: userId }
    });

    // Revalidate pages
    revalidatePath('/dashboard/users');

    return {
      success: true,
      message: 'User deleted successfully'
    };
  } catch (error) {
    console.error('Error deleting user:', error);
    return {
      success: false,
      error: 'Failed to delete user'
    };
  }
}