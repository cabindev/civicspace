//app/api/creative-activity/route.ts
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

    const activityData: any = {
      name: formData.get('name') as string,
      district: formData.get('district') as string,
      amphoe: formData.get('amphoe') as string,
      province: formData.get('province') as string,
      type: formData.get('type') as string,
      village: formData.get('village') as string || null,
      coordinatorName: formData.get('coordinatorName') as string || null,
      phone: formData.get('phone') as string || null,
      description: formData.get('description') as string,
      summary: formData.get('summary') as string,
      results: formData.get('results') as string || null,
      startYear: parseInt(formData.get('startYear') as string),
      videoLink: formData.get('videoLink') as string || null,
      category: {
        connect: { id: formData.get('categoryId') as string }
      },
      subCategory: {
        connect: { id: formData.get('subCategoryId') as string }
      },
      user: {
        connect: { id: user.id }
      }
    };

    ['zipcode', 'district_code', 'amphoe_code', 'province_code'].forEach(field => {
      const value = formData.get(field);
      if (value && !isNaN(Number(value))) {
        activityData[field] = Number(value);
      }
    });

    const activity = await prisma.creativeActivity.create({
      data: activityData,
    });

    // Handle image uploads
    const images = formData.getAll('images') as File[];
    for (const image of images) {
      const buffer = Buffer.from(await image.arrayBuffer());
      const filename = Date.now() + '-' + image.name.replace(/\s+/g, '-');
      const filepath = path.join(process.cwd(), 'public/uploads/creative-activity-images', filename);
      await writeFile(filepath, buffer);
      await prisma.image.create({
        data: {
          url: `/uploads/creative-activity-images/${filename}`,
          creativeActivityId: activity.id,
        },
      });
    }

    // Handle report file upload
    const reportFile = formData.get('reportFile') as File;
    if (reportFile) {
      const buffer = Buffer.from(await reportFile.arrayBuffer());
      const filename = Date.now() + '-' + reportFile.name.replace(/\s+/g, '-');
      const filepath = path.join(process.cwd(), 'public/uploads/creative-activity-files', filename);
      await writeFile(filepath, buffer);
      await prisma.creativeActivity.update({
        where: { id: activity.id },
        data: { reportFileUrl: `/uploads/creative-activity-files/${filename}` },
      });
    }

    // Create notification
    
    // await prisma.notification.create({
    //   data: {
    //     userId: user.id,
    //     activityId: activity.id,
    //     activityType: 'creativeActivity',
    //   }
    // });

    revalidatePath('/api/creative-activity');
    return NextResponse.json(activity, { status: 201 });
  } catch (error) {
    console.error('Error creating creative activity:', error);
    return NextResponse.json({ error: 'Internal Server Error', details: error }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const activities = await prisma.creativeActivity.findMany({
      include: { images: true, category: true, subCategory: true },
      orderBy: { createdAt: 'desc' }
    });
    return NextResponse.json(activities);
  } catch (error) {
    console.error('Error fetching creative activities:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}