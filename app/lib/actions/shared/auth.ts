// app/lib/actions/shared/auth.ts
import { getServerSession } from 'next-auth/next';
import authOptions from '@/app/lib/configs/auth/authOptions';
import prisma from '@/app/lib/prisma';
import { ActionResult } from './types';

export async function requireAuth(): Promise<ActionResult<{ user: any }>> {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return {
        success: false,
        error: 'Unauthorized - No session found'
      };
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return {
        success: false,
        error: 'User not found'
      };
    }

    return {
      success: true,
      data: { user }
    };
  } catch (error) {
    console.error('Authentication error:', error);
    return {
      success: false,
      error: 'Authentication failed'
    };
  }
}

export async function getCurrentUser() {
  const authResult = await requireAuth();
  return authResult.success ? authResult.data?.user : null;
}

export async function checkPermissions(userId: number, resourceUserId?: number): Promise<boolean> {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) return false;

    // Super admin can do everything
    if (user.role === 'SUPER_ADMIN') return true;

    // Regular users can only edit their own resources
    if (resourceUserId && userId !== resourceUserId) return false;

    return true;
  } catch (error) {
    console.error('Permission check error:', error);
    return false;
  }
}