import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/app/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const latestPolicies = await prisma.publicPolicy.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        level: true,
        province: true,
        type: true,
        createdAt: true,
        viewCount: true,
        images: {
          take: 1,
          select: {
            id: true,
            url: true,
          },
        },
      },
    });

    const formattedPolicies = latestPolicies.map(policy => ({
      ...policy,
      createdAt: policy.createdAt.toISOString(),
      image: policy.images[0]?.url || null,
    }));

    return NextResponse.json(formattedPolicies);
  } catch (error) {
    console.error('Error fetching latest public policies for home page:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export type PublicPolicyData = {
  id: string;
  name: string;
  level: string;
  province: string;
  type: string;
  createdAt: string;
  viewCount: number;
  image: string | null;
};