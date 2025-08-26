// app/lib/actions/creative-activity/get.ts
'use server'

import prisma from '@/app/lib/prisma';
import { ActionResult } from '../shared/types';

export async function getCreativeActivities(): Promise<ActionResult> {
  try {
    const activities = await prisma.creativeActivity.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        images: {
          select: {
            id: true,
            url: true
          }
        },
        category: {
          select: {
            id: true,
            name: true
          }
        },
        subCategory: {
          select: {
            id: true,
            name: true
          }
        },
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true
          }
        },
        _count: {
          select: {
            images: true
          }
        }
      }
    });

    return {
      success: true,
      data: activities
    };
  } catch (error) {
    console.error('Error fetching creative activities:', error);
    return {
      success: false,
      error: 'Failed to fetch creative activities'
    };
  }
}

export async function getCreativeActivityById(id: string): Promise<ActionResult> {
  try {
    const activity = await prisma.creativeActivity.findUnique({
      where: { id },
      include: {
        images: {
          select: {
            id: true,
            url: true
          }
        },
        category: {
          select: {
            id: true,
            name: true
          }
        },
        subCategory: {
          select: {
            id: true,
            name: true
          }
        },
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            image: true
          }
        }
      }
    });

    if (!activity) {
      return {
        success: false,
        error: 'Creative activity not found'
      };
    }

    return {
      success: true,
      data: activity
    };
  } catch (error) {
    console.error('Error fetching creative activity:', error);
    return {
      success: false,
      error: 'Failed to fetch creative activity'
    };
  }
}

export async function getCreativeActivitiesByUser(userId: number): Promise<ActionResult> {
  try {
    const activities = await prisma.creativeActivity.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      include: {
        images: {
          select: {
            id: true,
            url: true
          }
        },
        category: {
          select: {
            id: true,
            name: true
          }
        },
        subCategory: {
          select: {
            id: true,
            name: true
          }
        },
        _count: {
          select: {
            images: true
          }
        }
      }
    });

    return {
      success: true,
      data: activities
    };
  } catch (error) {
    console.error('Error fetching user creative activities:', error);
    return {
      success: false,
      error: 'Failed to fetch user creative activities'
    };
  }
}

export async function getLatestCreativeActivities(limit: number = 10): Promise<ActionResult> {
  try {
    const activities = await prisma.creativeActivity.findMany({
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        images: {
          take: 1,
          select: {
            id: true,
            url: true
          }
        },
        category: {
          select: {
            id: true,
            name: true
          }
        },
        subCategory: {
          select: {
            id: true,
            name: true
          }
        },
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true
          }
        }
      }
    });

    return {
      success: true,
      data: activities
    };
  } catch (error) {
    console.error('Error fetching latest creative activities:', error);
    return {
      success: false,
      error: 'Failed to fetch latest creative activities'
    };
  }
}

// Increment view count
export async function incrementCreativeActivityViewCount(id: string): Promise<ActionResult> {
  try {
    const activity = await prisma.creativeActivity.findUnique({
      where: { id },
      select: { id: true, viewCount: true }
    });

    if (!activity) {
      return {
        success: false,
        error: 'Creative activity not found'
      };
    }

    const updatedActivity = await prisma.creativeActivity.update({
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
      data: updatedActivity
    };
  } catch (error) {
    console.error('Error incrementing view count:', error);
    return {
      success: false,
      error: 'Failed to increment view count'
    };
  }
}