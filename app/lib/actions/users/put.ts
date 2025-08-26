// app/lib/actions/users/put.ts
'use server'

import prisma from '@/app/lib/prisma';
import { revalidatePath } from 'next/cache';
import { requireAuth, checkPermissions } from '../shared/auth';
import { ActionResult } from '../shared/types';

export async function updateUserRole(userId: number, role: string): Promise<ActionResult> {
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

    // Check if user has permission to update roles (must be super admin)
    const isSuperAdmin = await checkPermissions(currentUser.id);
    if (!isSuperAdmin) {
      return {
        success: false,
        error: 'Insufficient permissions to update user roles'
      };
    }

    // Validate role
    const validRoles = ['SUPER_ADMIN', 'ADMIN', 'MEMBER'];
    if (!validRoles.includes(role)) {
      return {
        success: false,
        error: 'Invalid role specified'
      };
    }

    // Update user role
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { role: role as any },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        role: true,
        image: true,
      }
    });

    // Revalidate pages
    revalidatePath('/dashboard/users');
    revalidatePath(`/dashboard/users/${userId}`);

    return {
      success: true,
      data: updatedUser,
      message: 'User role updated successfully'
    };
  } catch (error) {
    console.error('Error updating user role:', error);
    return {
      success: false,
      error: 'Failed to update user role'
    };
  }
}