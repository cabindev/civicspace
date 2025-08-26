// app/lib/actions/users/get.ts
'use server'

import prisma from '@/app/lib/prisma';
import { ActionResult } from '../shared/types';

export async function getUsers(): Promise<ActionResult> {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        role: true,
        image: true,
      },
      orderBy: { createdAt: 'desc' }
    });

    return {
      success: true,
      data: users
    };
  } catch (error) {
    console.error('Error fetching users:', error);
    return {
      success: false,
      error: 'Failed to fetch users'
    };
  }
}

export async function getUserById(id: number): Promise<ActionResult> {
  try {
    const user = await prisma.user.findUnique({
      where: { id },
      include: {
        traditions: {
          select: {
            id: true,
            name: true,
            type: true,
            province: true,
            createdAt: true,
          }
        },
        publicPolicies: {
          select: {
            id: true,
            name: true,
            level: true,
            province: true,
            createdAt: true,
          }
        },
        ethnicGroups: {
          select: {
            id: true,
            name: true,
            type: true,
            province: true,
            createdAt: true,
          }
        },
        creativeActivities: {
          select: {
            id: true,
            name: true,
            type: true,
            province: true,
            createdAt: true,
          }
        },
      },
    });

    if (!user) {
      return {
        success: false,
        error: 'User not found'
      };
    }

    // รวมทุกกิจกรรมเพื่อคำนวณสถิติรายเดือน
    const allActivities = [
      ...user.traditions,
      ...user.publicPolicies,
      ...user.ethnicGroups,
      ...user.creativeActivities,
    ];

    // จัดกลุ่มตามเดือน
    const monthlyData = allActivities.reduce((acc: any, activity) => {
      const date = new Date(activity.createdAt);
      const monthYear = date.toLocaleString('th-TH', { 
        month: 'short',
        year: '2-digit'
      });
      const key = monthYear.replace(' ', ' '); // เช่น "ธ.ค. 67"
      
      if (!acc[key]) {
        acc[key] = { month: key, count: 0 };
      }
      acc[key].count += 1;
      return acc;
    }, {});

    // แปลงเป็น array และเรียงตามวันที่
    const sortedMonthlyData = Object.values(monthlyData).sort((a: any, b: any) => {
      const [aMonth, aYear] = a.month.split(' ');
      const [bMonth, bYear] = b.month.split(' ');
      const thaiMonths = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 
                         'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'];
      
      if (aYear !== bYear) return Number(aYear) - Number(bYear);
      return thaiMonths.indexOf(aMonth) - thaiMonths.indexOf(bMonth);
    });

    // Format response data
    const responseData = {
      user: {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        image: user.image,
      },
      activities: {
        traditions: user.traditions,
        publicPolicies: user.publicPolicies,
        ethnicGroups: user.ethnicGroups,
        creativeActivities: user.creativeActivities,
      },
      statistics: {
        totalActivities: allActivities.length,
        activityBreakdown: {
          traditions: user.traditions.length,
          publicPolicies: user.publicPolicies.length,
          ethnicGroups: user.ethnicGroups.length,
          creativeActivities: user.creativeActivities.length,
        },
        monthlyActivities: sortedMonthlyData,
      },
    };

    return {
      success: true,
      data: responseData
    };
  } catch (error) {
    console.error('Error fetching user details:', error);
    return {
      success: false,
      error: 'Failed to fetch user details'
    };
  }
}