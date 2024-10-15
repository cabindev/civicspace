//app/api/creative-activity/route.ts
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/app/lib/prisma';
import { writeFile } from 'fs/promises';
import path from 'path';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();

    const activityData: any = {
      categoryId: formData.get('categoryId') as string,
      subCategoryId: formData.get('subCategoryId') as string,
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
    };

    // Handle numeric fields
    ['zipcode', 'district_code', 'amphoe_code', 'province_code'].forEach(field => {
      const value = formData.get(field);
      if (value && !isNaN(Number(value))) {
        activityData[field] = Number(value);
      }
    });

    console.log('Creative Activity Data to be created:', activityData); // For debugging

    // Create the creative activity
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
    });
    return NextResponse.json(activities);
  } catch (error) {
    console.error('Error fetching creative activities:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}