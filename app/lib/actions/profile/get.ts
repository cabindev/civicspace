// app/lib/actions/profile/get.ts
'use server'

import prisma from '@/app/lib/prisma';
import { requireAuth } from '../shared/auth';
import { ActionResult } from '../shared/types';

export async function getProfile(): Promise<ActionResult> {
  try {
    // Check authentication
    const authResult = await requireAuth();
    if (!authResult.success) {
      return authResult;
    }

    const user = authResult.data?.user;
    
    if (!user) {
      return {
        success: false,
        error: 'User not found'
      };
    }

    const profileUser = await prisma.user.findUnique({
      where: { email: user.email },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        image: true,
        role: true,
        _count: {
          select: {
            publicPolicies: true,
            ethnicGroups: true,
            traditions: true,
            creativeActivities: true,
          }
        }
      }
    });

    if (!profileUser) {
      return {
        success: false,
        error: 'User not found'
      };
    }

    // ปรับ image path ถ้าจำเป็น
    let imagePath = profileUser.image;
    if (imagePath && !imagePath.startsWith('/uploads/profiles/') && !imagePath.startsWith('http')) {
      // ถ้าเป็น path เก่าให้แปลงเป็น path ใหม่
      if (imagePath.startsWith('/uploads/')) {
        // ใช้ path เดิมก่อน (ไม่แปลง) เพราะไฟล์อาจจะยังอยู่ที่เดิม
        imagePath = profileUser.image;
      } else {
        // ถ้าเป็นแค่ filename ให้เพิ่ม path
        imagePath = `/uploads/profiles/${imagePath}`;
      }
    }

    const userData = {
      id: profileUser.id,
      firstName: profileUser.firstName,
      lastName: profileUser.lastName,
      email: profileUser.email,
      image: imagePath,
      role: profileUser.role,
      publicPoliciesCount: profileUser._count.publicPolicies,
      ethnicGroupsCount: profileUser._count.ethnicGroups,
      traditionsCount: profileUser._count.traditions,
      creativeActivitiesCount: profileUser._count.creativeActivities,
    };

    return {
      success: true,
      data: userData
    };
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return {
      success: false,
      error: 'Failed to fetch profile'
    };
  }
}