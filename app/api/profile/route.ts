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

    const userData = {
      ...user,
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