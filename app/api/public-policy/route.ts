// app/api/public-policy/route.ts
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/app/lib/prisma';
import { writeFile } from 'fs/promises';
import path from 'path';
import { getServerSession } from 'next-auth/next';
import authOptions from '@/app/lib/configs/auth/authOptions';
import { revalidatePath } from 'next/cache';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const formData = await request.formData();

    const policyData: any = {
      name: formData.get('name') as string || 'Untitled Policy',
      signingDate: new Date(formData.get('signingDate') as string) || new Date(),
      level: formData.get('level') as string || 'UNKNOWN',
      healthRegion: formData.get('healthRegion') as string || null,
      district: formData.get('district') as string || 'UNKNOWN',
      amphoe: formData.get('amphoe') as string || 'UNKNOWN',
      province: formData.get('province') as string || 'UNKNOWN',
      type: formData.get('type') as string || 'UNKNOWN',
      village: formData.get('village') as string || null,
      content: formData.get('content') ? JSON.parse(formData.get('content') as string) : [],
      summary: formData.get('summary') as string || '',
      results: formData.get('results') as string || null,
      videoLink: formData.get('videoLink') as string || null,
      userId: user.id
    };

    ['zipcode', 'district_code', 'amphoe_code', 'province_code'].forEach(field => {
      const value = formData.get(field);
      policyData[field] = value && !isNaN(Number(value)) ? Number(value) : null;
    });

    const policy = await prisma.publicPolicy.create({
      data: policyData,
    });

    const images = formData.getAll('images') as File[];
    for (const image of images) {
      const buffer = Buffer.from(await image.arrayBuffer());
      const filename = Date.now() + '-' + image.name.replace(/\s+/g, '-');
      const filepath = path.join(process.cwd(), 'public/uploads/public-policy-images', filename);
      await writeFile(filepath, buffer);
      await prisma.image.create({
        data: {
          url: `/uploads/public-policy-images/${filename}`,
          publicPolicyId: policy.id,
        },
      });
    }

    const policyFile = formData.get('policyFile') as File;
    if (policyFile) {
      const buffer = Buffer.from(await policyFile.arrayBuffer());
      const filename = Date.now() + '-' + policyFile.name.replace(/\s+/g, '-');
      const filepath = path.join(process.cwd(), 'public/uploads/policy-files', filename);
      await writeFile(filepath, buffer);
      await prisma.publicPolicy.update({
        where: { id: policy.id },
        data: { policyFileUrl: `/uploads/policy-files/${filename}` },
      });
    }

    // Create notification
    await prisma.notification.create({
      data: {
        userId: user.id,
        activityId: policy.id,
        activityType: 'publicPolicy',
      }
    });

    revalidatePath('/api/public-policy');
    return NextResponse.json(policy, { status: 201 });
  } catch (error) {
    console.error('Error creating public policy:', error);
    return NextResponse.json({ error: 'Internal Server Error', details: error }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const policies = await prisma.publicPolicy.findMany({
      include: { images: true },
      orderBy: { createdAt: 'desc' }
    });
    return NextResponse.json(policies);
  } catch (error) {
    console.error('Error fetching public policies:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}