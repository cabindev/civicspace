import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/app/lib/prisma';
import { writeFile, unlink } from 'fs/promises';
import path from 'path';

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const activity = await prisma.creativeActivity.findUnique({
      where: { id: params.id },
      include: { category: true, subCategory: true, images: true },
    });

    if (!activity) {
      return NextResponse.json({ error: 'Creative Activity not found' }, { status: 404 });
    }

    // Increment view count
    await prisma.creativeActivity.update({
      where: { id: params.id },
      data: { viewCount: { increment: 1 } },
    });

    return NextResponse.json(activity);
  } catch (error) {
    console.error('Error fetching creative activity:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const formData = await request.formData();

    const updateData: any = {
      name: formData.get('name') as string,
      district: formData.get('district') as string,
      amphoe: formData.get('amphoe') as string,
      province: formData.get('province') as string,
      zipcode: formData.get('zipcode') ? parseInt(formData.get('zipcode') as string) : null,
      district_code: formData.get('district_code') ? parseInt(formData.get('district_code') as string) : null,
      amphoe_code: formData.get('amphoe_code') ? parseInt(formData.get('amphoe_code') as string) : null,
      province_code: formData.get('province_code') ? parseInt(formData.get('province_code') as string) : null,
      type: formData.get('type') as string,
      village: formData.get('village') as string | null,
      coordinatorName: formData.get('coordinatorName') as string,
      phone: formData.get('phone') as string | null,
      description: formData.get('description') as string,
      summary: formData.get('summary') as string,
      results: formData.get('results') as string | null,
      startYear: parseInt(formData.get('startYear') as string),
      videoLink: formData.get('videoLink') as string | null,
      category: { connect: { id: formData.get('categoryId') as string } },
      subCategory: { connect: { id: formData.get('subCategoryId') as string } },
    };

    const activity = await prisma.creativeActivity.update({
      where: { id: params.id },
      data: updateData,
    });

    // Handle image uploads
    const images = formData.getAll('images') as File[];
    for (const image of images) {
      if (image instanceof File) {
        const buffer = Buffer.from(await image.arrayBuffer());
        const filename = Date.now() + '-' + image.name;
        const filepath = path.join(process.cwd(), 'public/uploads/creative-activity-images', filename);
        await writeFile(filepath, buffer);
        await prisma.image.create({
          data: {
            url: `/uploads/creative-activity-images/${filename}`,
            creativeActivityId: activity.id,
          },
        });
      }
    }

    // Handle report file upload
    const reportFile = formData.get('reportFile') as File | null;
    if (reportFile instanceof File) {
      const buffer = Buffer.from(await reportFile.arrayBuffer());
      const filename = Date.now() + '-' + reportFile.name;
      const filepath = path.join(process.cwd(), 'public/uploads/creative-activity-files', filename);
      await writeFile(filepath, buffer);
      await prisma.creativeActivity.update({
        where: { id: activity.id },
        data: { reportFileUrl: `/uploads/creative-activity-files/${filename}` },
      });
    }

    return NextResponse.json(activity, { status: 200 });
  } catch (error) {
    console.error('Error updating creative activity:', error);
    return NextResponse.json({ error: 'Internal Server Error', details: error }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const activity = await prisma.creativeActivity.findUnique({
      where: { id: params.id },
      include: { images: true },
    });

    if (!activity) {
      return NextResponse.json({ error: 'Creative Activity not found' }, { status: 404 });
    }

    for (const image of activity.images) {
      const imagePath = path.join(process.cwd(), 'public', image.url);
      await unlink(imagePath).catch(error => console.error('Error deleting image file:', error));
      await prisma.image.delete({ where: { id: image.id } });
    }

    if (activity.reportFileUrl) {
      const reportFilePath = path.join(process.cwd(), 'public', activity.reportFileUrl);
      await unlink(reportFilePath).catch(error => console.error('Error deleting report file:', error));
    }

    await prisma.creativeActivity.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ message: 'Creative Activity deleted successfully' }, { status: 200 });
  } catch (error) {
    console.error('Error deleting creative activity:', error);
    return NextResponse.json({ error: 'Internal Server Error', details: error }, { status: 500 });
  }
}