import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/app/lib/prisma';
import { writeFile } from 'fs/promises';
import path from 'path';
import { getServerSession } from 'next-auth/next';
import authOptions from '@/app/lib/configs/auth/authOptions';
import { revalidatePath } from 'next/cache';

export async function POST(request: NextRequest) {
  console.log('Ethnic Group API route hit');

  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const formData = await request.formData();

    const ethnicGroupData: any = {
      name: formData.get('name') as string,
      history: formData.get('history') as string,
      activityName: formData.get('activityName') as string,
      activityOrigin: formData.get('activityOrigin') as string,
      province: formData.get('province') as string,
      amphoe: formData.get('amphoe') as string,
      district: formData.get('district') as string,
      village: formData.get('village') as string || null,
      type: formData.get('type') as string,
      activityDetails: formData.get('activityDetails') as string,
      alcoholFreeApproach: formData.get('alcoholFreeApproach') as string,
      startYear: parseInt(formData.get('startYear') as string),
      results: formData.get('results') as string || null,
      videoLink: formData.get('videoLink') as string || null,
      category: {
        connect: { id: formData.get('categoryId') as string }
      },
      user: {
        connect: { id: user.id }
      }
    };

    ['zipcode', 'district_code', 'amphoe_code', 'province_code'].forEach(field => {
      const value = formData.get(field);
      if (value && !isNaN(Number(value))) {
        ethnicGroupData[field] = Number(value);
      }
    });

    const ethnicGroup = await prisma.ethnicGroup.create({
      data: ethnicGroupData,
    });

    // Handle image uploads
    const images = formData.getAll('images') as File[];
    for (const image of images) {
      const buffer = Buffer.from(await image.arrayBuffer());
      const filename = Date.now() + '-' + image.name.replace(/\s+/g, '-');
      const filepath = path.join(process.cwd(), 'public/uploads/ethnic-group-images', filename);
      await writeFile(filepath, buffer);
      await prisma.image.create({
        data: {
          url: `/uploads/ethnic-group-images/${filename}`,
          ethnicGroupId: ethnicGroup.id,
        },
      });
    }

    // Handle file upload
    const file = formData.get('fileUrl') as File;
    if (file) {
      const buffer = Buffer.from(await file.arrayBuffer());
      const filename = Date.now() + '-' + file.name.replace(/\s+/g,'-');
      const filepath = path.join(process.cwd(), 'public/uploads/ethnic-group-files', filename);
      await writeFile(filepath, buffer);
      await prisma.ethnicGroup.update({
        where: { id: ethnicGroup.id },
        data: { fileUrl: `/uploads/ethnic-group-files/${filename}` },
      });
    }

    // Create notification

    // await prisma.notification.create({
    //   data: {
    //     userId: user.id,
    //     activityId: ethnicGroup.id,
    //     activityType: 'ethnicGroup',
    //   }
    // });

    revalidatePath('/api/ethnic-group');
    return NextResponse.json(ethnicGroup, { status: 201 });
  } catch (error) {
    console.error('Error creating ethnic group:', error);
    return NextResponse.json({ error: 'Internal Server Error', details: error }, { status: 500 });
  }
}

export async function GET() {
  try {
    const ethnicGroups = await prisma.ethnicGroup.findMany({
      include: { images: true, category: true },
      orderBy: { createdAt: 'desc' }
    });
    return NextResponse.json(ethnicGroups);
  } catch (error) {
    console.error('Error fetching ethnic groups:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}