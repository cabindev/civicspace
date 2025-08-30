// app/lib/actions/notifications/get-global.ts
'use server'

import prisma from '@/app/lib/prisma';
import { requireAuth } from '../shared/auth';
import { ActionResult } from '../shared/types';

export async function getGlobalNotifications(limit: number = 10): Promise<ActionResult> {
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

    // Only allow admins to view global notifications
    if (currentUser.role !== 'SUPER_ADMIN' && currentUser.role !== 'ADMIN') {
      return {
        success: false,
        error: 'Insufficient permissions'
      };
    }

    // Get recent unread notifications from all users
    const notifications = await prisma.notification.findMany({
      where: {
        isRead: false
      },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            image: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: limit
    });

    // Transform notifications to include activity details
    const transformedNotifications = await Promise.all(
      notifications.map(async (notification) => {
        let activityTitle = 'กิจกรรมใหม่';
        
        try {
          // Get activity title based on type and ID
          switch (notification.activityType) {
            case 'tradition':
              const tradition = await prisma.tradition.findUnique({
                where: { id: notification.activityId },
                select: { name: true }
              });
              activityTitle = tradition?.name || 'งานบุญประเพณีใหม่';
              break;
              
            case 'publicPolicy':
              const policy = await prisma.publicPolicy.findUnique({
                where: { id: notification.activityId },
                select: { name: true }
              });
              activityTitle = policy?.name || 'นโยบายสาธารณะใหม่';
              break;
              
            case 'creativeActivity':
              const activity = await prisma.creativeActivity.findUnique({
                where: { id: notification.activityId },
                select: { name: true }
              });
              activityTitle = activity?.name || 'กิจกรรมสร้างสรรค์ใหม่';
              break;
              
            case 'ethnicGroup':
              const ethnicGroup = await prisma.ethnicGroup.findUnique({
                where: { id: notification.activityId },
                select: { name: true }
              });
              activityTitle = ethnicGroup?.name || 'กลุ่มชาติพันธุ์ใหม่';
              break;
              
            default:
              activityTitle = 'กิจกรรมใหม่';
          }
        } catch (error) {
          console.error('Error fetching activity details:', error);
          activityTitle = 'กิจกรรมใหม่';
        }

        return {
          id: notification.id,
          userId: notification.userId,
          userName: `${notification.user.firstName} ${notification.user.lastName}`,
          userImage: notification.user.image,
          activityType: notification.activityType,
          activityTitle,
          createdAt: notification.createdAt.toISOString()
        };
      })
    );

    return {
      success: true,
      data: transformedNotifications
    };
  } catch (error) {
    console.error('Error fetching global notifications:', error);
    return {
      success: false,
      error: 'Failed to fetch notifications'
    };
  }
}