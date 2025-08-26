// app/lib/actions/tradition/get.ts
'use server'

import prisma from '@/app/lib/prisma';
import { ActionResult } from '../shared/types';

export async function getTraditions(): Promise<ActionResult> {
  try {
    const traditions = await prisma.tradition.findMany({
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
      data: traditions
    };
  } catch (error) {
    console.error('Error fetching traditions:', error);
    return {
      success: false,
      error: 'Failed to fetch traditions'
    };
  }
}

export async function getTraditionById(id: string): Promise<ActionResult> {
  try {
    const tradition = await prisma.tradition.findUnique({
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

    if (!tradition) {
      return {
        success: false,
        error: 'Tradition not found'
      };
    }

    return {
      success: true,
      data: tradition
    };
  } catch (error) {
    console.error('Error fetching tradition:', error);
    return {
      success: false,
      error: 'Failed to fetch tradition'
    };
  }
}

export async function getTraditionsByUser(userId: number): Promise<ActionResult> {
  try {
    const traditions = await prisma.tradition.findMany({
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
      data: traditions
    };
  } catch (error) {
    console.error('Error fetching user traditions:', error);
    return {
      success: false,
      error: 'Failed to fetch user traditions'
    };
  }
}

export async function getLatestTraditions(limit: number = 10): Promise<ActionResult> {
  try {
    const traditions = await prisma.tradition.findMany({
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
      data: traditions
    };
  } catch (error) {
    console.error('Error fetching latest traditions:', error);
    return {
      success: false,
      error: 'Failed to fetch latest traditions'
    };
  }
}

export async function getTraditionsByCategory(categoryId: string): Promise<ActionResult> {
  try {
    const traditions = await prisma.tradition.findMany({
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
      data: traditions
    };
  } catch (error) {
    console.error('Error fetching traditions by category:', error);
    return {
      success: false,
      error: 'Failed to fetch traditions by category'
    };
  }
}