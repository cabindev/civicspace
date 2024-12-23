// app/lib/notifications.ts
import prisma from './prisma';

export async function createActivityNotification(
  userId: number,
  activityId: string,
  activityType: string
) {
  try {
    await prisma.notification.create({
      data: {
        userId,
        activityId,
        activityType,
      }
    });
  } catch (error) {
    console.error('Failed to create notification:', error);
  }
}