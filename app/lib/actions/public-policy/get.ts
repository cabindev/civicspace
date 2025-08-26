// app/lib/actions/public-policy/get.ts
'use server'

import prisma from '@/app/lib/prisma';
import { ActionResult } from '../shared/types';

export async function getPublicPolicies(): Promise<ActionResult> {
  try {
    const policies = await prisma.publicPolicy.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        images: {
          select: {
            id: true,
            url: true
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
      data: policies
    };
  } catch (error) {
    console.error('Error fetching public policies:', error);
    return {
      success: false,
      error: 'Failed to fetch public policies'
    };
  }
}

export async function getPublicPolicyById(id: string): Promise<ActionResult> {
  try {
    const policy = await prisma.publicPolicy.findUnique({
      where: { id },
      include: {
        images: {
          select: {
            id: true,
            url: true
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

    if (!policy) {
      return {
        success: false,
        error: 'Public policy not found'
      };
    }

    return {
      success: true,
      data: policy
    };
  } catch (error) {
    console.error('Error fetching public policy:', error);
    return {
      success: false,
      error: 'Failed to fetch public policy'
    };
  }
}

export async function getPublicPoliciesByUser(userId: number): Promise<ActionResult> {
  try {
    const policies = await prisma.publicPolicy.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      include: {
        images: {
          select: {
            id: true,
            url: true
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
      data: policies
    };
  } catch (error) {
    console.error('Error fetching user public policies:', error);
    return {
      success: false,
      error: 'Failed to fetch user public policies'
    };
  }
}

export async function getLatestPublicPolicies(limit: number = 10): Promise<ActionResult> {
  try {
    const policies = await prisma.publicPolicy.findMany({
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
      data: policies
    };
  } catch (error) {
    console.error('Error fetching latest public policies:', error);
    return {
      success: false,
      error: 'Failed to fetch latest public policies'
    };
  }
}

export async function getPublicPoliciesByLevel(level: any): Promise<ActionResult> {
  try {
    const policies = await prisma.publicPolicy.findMany({
      where: { level },
      orderBy: { createdAt: 'desc' },
      include: {
        images: {
          take: 1,
          select: {
            id: true,
            url: true
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
      data: policies
    };
  } catch (error) {
    console.error('Error fetching public policies by level:', error);
    return {
      success: false,
      error: 'Failed to fetch public policies by level'
    };
  }
}

export async function getPublicPoliciesByHealthRegion(healthRegion: string): Promise<ActionResult> {
  try {
    const policies = await prisma.publicPolicy.findMany({
      where: { healthRegion },
      orderBy: { createdAt: 'desc' },
      include: {
        images: {
          take: 1,
          select: {
            id: true,
            url: true
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
      data: policies
    };
  } catch (error) {
    console.error('Error fetching public policies by health region:', error);
    return {
      success: false,
      error: 'Failed to fetch public policies by health region'
    };
  }
}

export async function incrementViewCount(id: string): Promise<ActionResult> {
  try {
    await prisma.publicPolicy.update({
      where: { id },
      data: {
        viewCount: {
          increment: 1
        }
      }
    });

    return {
      success: true
    };
  } catch (error) {
    console.error('Error incrementing view count:', error);
    return {
      success: false,
      error: 'Failed to increment view count'
    };
  }
}