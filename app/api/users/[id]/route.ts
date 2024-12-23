// app/api/users/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/app/lib/prisma';

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { role } = await request.json();
    const updatedUser = await prisma.user.update({
      where: { id: Number(params.id) },
      data: { role },
    });
    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error('Failed to update user:', error);
    return NextResponse.json({ error: 'Failed to update user' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await prisma.user.delete({
      where: { id: Number(params.id) },
    });
    return NextResponse.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Failed to delete user:', error);
    return NextResponse.json({ error: 'Failed to delete user' }, { status: 500 });
  }
}

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: Number(params.id) },
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
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
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

    // Format response
    return NextResponse.json({
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
    });

  } catch (error) {
    console.error('Failed to fetch user details:', error);
    return NextResponse.json(
      { error: 'Failed to fetch user details' }, 
      { status: 500 }
    );
  }
}