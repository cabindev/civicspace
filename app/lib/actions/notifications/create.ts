// app/lib/actions/notifications/create.ts
'use server'

import prisma from '@/app/lib/prisma';
import { revalidatePath } from 'next/cache';
import { ActionResult } from '../shared/types';

export async function createNotification(
  userId: number,
  activityId: string,
  activityType: 'tradition' | 'publicPolicy' | 'ethnicGroup' | 'creativeActivity'
): Promise<ActionResult> {
  try {
    const notification = await prisma.notification.create({
      data: {
        userId,
        activityId,
        activityType,
        isRead: false
      }
    });

    return {
      success: true,
      data: notification
    };
  } catch (error) {
    console.error('Error creating notification:', error);
    return {
      success: false,
      error: 'Failed to create notification'
    };
  }
}

export async function markNotificationAsRead(notificationId: string): Promise<ActionResult> {
  try {
    // Check if notification exists before updating
    const existingNotification = await prisma.notification.findUnique({
      where: { id: notificationId }
    });

    if (!existingNotification) {
      return {
        success: false,
        error: 'Notification not found'
      };
    }

    // Update notification
    const updatedNotification = await prisma.notification.update({
      where: {
        id: notificationId
      },
      data: {
        isRead: true
      }
    });

    console.log(`Notification ${notificationId} marked as read for user ${updatedNotification.userId}`);

    // Force revalidate pages with notifications
    revalidatePath('/dashboard');
    revalidatePath('/dashboard/users');
    
    return {
      success: true,
      data: updatedNotification
    };
  } catch (error) {
    console.error('Error marking notification as read:', error);
    return {
      success: false,
      error: 'Failed to mark notification as read'
    };
  }
}