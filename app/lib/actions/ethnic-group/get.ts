// app/lib/actions/ethnic-group/get.ts
'use server'

import prisma from '@/app/lib/prisma';
import { ActionResult } from '../shared/types';

export async function getEthnicGroups(): Promise<ActionResult> {
  try {
    const ethnicGroups = await prisma.ethnicGroup.findMany({
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
      data: ethnicGroups
    };
  } catch (error) {
    console.error('Error fetching ethnic groups:', error);
    return {
      success: false,
      error: 'Failed to fetch ethnic groups'
    };
  }
}

export async function getEthnicGroupById(id: string): Promise<ActionResult> {
  try {
    const ethnicGroup = await prisma.ethnicGroup.findUnique({
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

    if (!ethnicGroup) {
      return {
        success: false,
        error: 'Ethnic group not found'
      };
    }

    return {
      success: true,
      data: ethnicGroup
    };
  } catch (error) {
    console.error('Error fetching ethnic group:', error);
    return {
      success: false,
      error: 'Failed to fetch ethnic group'
    };
  }
}

// Increment view count
export async function incrementEthnicGroupViewCount(id: string): Promise<ActionResult> {
  try {
    const ethnicGroup = await prisma.ethnicGroup.findUnique({
      where: { id },
      select: { id: true, viewCount: true }
    });

    if (!ethnicGroup) {
      return {
        success: false,
        error: 'Ethnic group not found'
      };
    }

    const updatedEthnicGroup = await prisma.ethnicGroup.update({
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
      data: updatedEthnicGroup
    };
  } catch (error) {
    console.error('Error incrementing view count:', error);
    return {
      success: false,
      error: 'Failed to increment view count'
    };
  }
}

export async function getEthnicGroupsByUser(userId: number): Promise<ActionResult> {
  try {
    const ethnicGroups = await prisma.ethnicGroup.findMany({
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
        _count: {
          select: {
            images: true
          }
        }
      }
    });

    return {
      success: true,
      data: ethnicGroups
    };
  } catch (error) {
    console.error('Error fetching user ethnic groups:', error);
    return {
      success: false,
      error: 'Failed to fetch user ethnic groups'
    };
  }
}

export async function getLatestEthnicGroups(limit: number = 10): Promise<ActionResult> {
  try {
    const ethnicGroups = await prisma.ethnicGroup.findMany({
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
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true
          }
        }
      }
    });

    return {
      success: true,
      data: ethnicGroups
    };
  } catch (error) {
    console.error('Error fetching latest ethnic groups:', error);
    return {
      success: false,
      error: 'Failed to fetch latest ethnic groups'
    };
  }
}

export async function getEthnicGroupsByCategory(categoryId: string): Promise<ActionResult> {
  try {
    const ethnicGroups = await prisma.ethnicGroup.findMany({
      where: { categoryId },
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
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true
          }
        }
      }
    });

    return {
      success: true,
      data: ethnicGroups
    };
  } catch (error) {
    console.error('Error fetching ethnic groups by category:', error);
    return {
      success: false,
      error: 'Failed to fetch ethnic groups by category'
    };
  }
}