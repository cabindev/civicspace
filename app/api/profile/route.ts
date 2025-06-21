//app/api/profile/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import authOptions from '@/app/lib/configs/auth/authOptions';
import prisma from '@/app/lib/prisma';
import { revalidatePath } from 'next/cache';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
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

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // ปรับ image path ถ้าจำเป็น
    let imagePath = user.image;
    if (imagePath && !imagePath.startsWith('/uploads/profiles/') && !imagePath.startsWith('http')) {
      // ถ้าเป็น path เก่าให้แปลงเป็น path ใหม่
      if (imagePath.startsWith('/uploads/')) {
        // ใช้ path เดิมก่อน (ไม่แปลง) เพราะไฟล์อาจจะยังอยู่ที่เดิม
        imagePath = user.image;
      } else {
        // ถ้าเป็นแค่ filename ให้เพิ่ม path
        imagePath = `/uploads/profiles/${imagePath}`;
      }
    }

    const userData = {
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      image: imagePath,
      role: user.role,
      publicPoliciesCount: user._count.publicPolicies,
      ethnicGroupsCount: user._count.ethnicGroups,
      traditionsCount: user._count.traditions,
      creativeActivitiesCount: user._count.creativeActivities,
    };

    revalidatePath('/api/profile');
    return NextResponse.json(userData);
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}