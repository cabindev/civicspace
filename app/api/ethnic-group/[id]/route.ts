import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/app/lib/prisma';
import { writeFile, unlink } from 'fs/promises';
import path from 'path';

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const ethnicGroup = await prisma.ethnicGroup.findUnique({
      where: { id: params.id },
      include: { category: true, images: true },
    });

    if (!ethnicGroup) {
      return NextResponse.json({ error: 'Ethnic group not found' }, { status: 404 });
    }

    // Increment view count
    await prisma.ethnicGroup.update({
      where: { id: params.id },
      data: { viewCount: { increment: 1 } },
    });

    return NextResponse.json(ethnicGroup);
  } catch (error) {
    console.error('Error fetching ethnic group:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const formData = await request.formData();

    const updateData: any = {
      categoryId: formData.get('categoryId') as string,
      name: formData.get('name') as string,
      history: formData.get('history') as string,
      activityName: formData.get('activityName') as string,
      activityOrigin: formData.get('activityOrigin') as string,
      province: formData.get('province') as string,
      amphoe: formData.get('amphoe') as string,
      district: formData.get('district') as string,
      village: formData.get('village') as string | null,
      activityDetails: formData.get('activityDetails') as string,
      alcoholFreeApproach: formData.get('alcoholFreeApproach') as string,
      startYear: parseInt(formData.get('startYear') as string),
      results: formData.get('results') as string | null,
      videoLink: formData.get('videoLink') as string | null,
    };

    ['zipcode', 'district_code', 'amphoe_code', 'province_code'].forEach(field => {
      const value = formData.get(field);
      if (value && !isNaN(Number(value))) {
        updateData[field] = Number(value);
      }
    });

    const ethnicGroup = await prisma.ethnicGroup.update({
      where: { id: params.id },
      data: updateData,
    });

    // Handle image uploads
    const images = formData.getAll('images') as File[];
    for (const image of images) {
      if (image instanceof File) {
        const buffer = Buffer.from(await image.arrayBuffer());
        const filename = Date.now() + '-' + image.name;
        const filepath = path.join(process.cwd(), 'public/uploads/ethnic-group-images', filename);
        await writeFile(filepath, buffer);
        await prisma.image.create({
          data: {
            url: `/uploads/ethnic-group-images/${filename}`,
            ethnicGroupId: ethnicGroup.id,
          },
        });
      }
    }

    // Handle file upload
    const file = formData.get('fileUrl') as File | null;
    if (file instanceof File) {
      const buffer = Buffer.from(await file.arrayBuffer());
      const filename = Date.now() + '-' + file.name;
      const filepath = path.join(process.cwd(), 'public/uploads/ethnic-group-files', filename);
      await writeFile(filepath, buffer);
      await prisma.ethnicGroup.update({
        where: { id: ethnicGroup.id },
        data: { fileUrl: `/uploads/ethnic-group-files/${filename}` },
      });
    }

    return NextResponse.json(ethnicGroup, { status: 200 });
  } catch (error) {
    console.error('Error updating ethnic group:', error);
    return NextResponse.json({ error: 'Internal Server Error', details: error }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const ethnicGroup = await prisma.ethnicGroup.findUnique({
      where: { id: params.id },
      include: { images: true },
    });

    if (!ethnicGroup) {
      return NextResponse.json({ error: 'Ethnic group not found' }, { status: 404 });
    }

    for (const image of ethnicGroup.images) {
      const imagePath = path.join(process.cwd(), 'public', image.url);
      await unlink(imagePath).catch(error => console.error('Error deleting image file:', error));
      await prisma.image.delete({ where: { id: image.id } });
    }

    if (ethnicGroup.fileUrl) {
      const filePath = path.join(process.cwd(), 'public', ethnicGroup.fileUrl);
      await unlink(filePath).catch(error => console.error('Error deleting file:', error));
    }

    await prisma.ethnicGroup.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ message: 'Ethnic group deleted successfully' }, { status: 200 });
  } catch (error) {
    console.error('Error deleting ethnic group:', error);
    return NextResponse.json({ error: 'Internal Server Error', details: error }, { status: 500 });
  }
}