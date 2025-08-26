// app/lib/actions/notifications/put.ts
'use server'

import prisma from '@/app/lib/prisma';
import { requireAuth } from '../shared/auth';
import { ActionResult } from '../shared/types';

export async function markNotificationsAsRead(userId: number): Promise<ActionResult> {
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
        error: 'Unauthorized'
      };
    }

    // Check if user is updating their own notifications or is an admin
    if (currentUser.id !== userId && currentUser.role !== 'SUPER_ADMIN') {
      return {
        success: false,
        error: 'Unauthorized to update these notifications'
      };
    }

    await prisma.notification.updateMany({
      where: {
        userId: userId,
        isRead: false
      },
      data: {
        isRead: true
      }
    });

    return {
      success: true,
      message: 'Notifications marked as read'
    };
  } catch (error) {
    console.error('Error marking notifications as read:', error);
    return {
      success: false,
      error: 'Failed to mark notifications as read'
    };
  }
}