// app/lib/actions/notifications/get.ts
'use server'

import prisma from '@/app/lib/prisma';
import { requireAuth } from '../shared/auth';
import { ActionResult } from '../shared/types';

export async function getNotifications(userId: number): Promise<ActionResult> {
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

    // Check if user is requesting their own notifications or is an admin
    if (currentUser.id !== userId && currentUser.role !== 'SUPER_ADMIN') {
      return {
        success: false,
        error: 'Unauthorized to access these notifications'
      };
    }

    const notifications = await prisma.notification.findMany({
      where: {
        userId: userId,
        isRead: false
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return {
      success: true,
      data: notifications
    };
  } catch (error) {
    console.error('Error fetching notifications:', error);
    return {
      success: false,
      error: 'Failed to fetch notifications'
    };
  }
}