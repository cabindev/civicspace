// app/lib/actions/notifications/create.ts
'use server'

import prisma from '@/app/lib/prisma';
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
    await prisma.notification.update({
      where: {
        id: notificationId
      },
      data: {
        isRead: true
      }
    });

    return {
      success: true
    };
  } catch (error) {
    console.error('Error marking notification as read:', error);
    return {
      success: false,
      error: 'Failed to mark notification as read'
    };
  }
}