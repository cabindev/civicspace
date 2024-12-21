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
        traditions: true,
        publicPolicies: true,
        ethnicGroups: true,
        creativeActivities: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Calculate statistics
    const totalActivities = 
      user.traditions.length + 
      user.publicPolicies.length + 
      user.ethnicGroups.length + 
      user.creativeActivities.length;

    const activityBreakdown = {
      traditions: user.traditions.length,
      publicPolicies: user.publicPolicies.length,
      ethnicGroups: user.ethnicGroups.length,
      creativeActivities: user.creativeActivities.length,
    };

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
        totalActivities,
        activityBreakdown,
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