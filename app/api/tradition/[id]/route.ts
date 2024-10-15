import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/app/lib/prisma';
import { writeFile, unlink } from 'fs/promises';
import path from 'path';

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const tradition = await prisma.tradition.findUnique({
      where: { id: params.id },
      include: { category: true, images: true },
    });

    if (!tradition) {
      return NextResponse.json({ error: 'Tradition not found' }, { status: 404 });
    }

    // Increment view count
    await prisma.tradition.update({
      where: { id: params.id },
      data: { viewCount: { increment: 1 } },
    });

    return NextResponse.json(tradition);
  } catch (error) {
    console.error('Error fetching tradition:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const formData = await request.formData();

    const updateData: any = {
      categoryId: formData.get('categoryId') as string,
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
      history: formData.get('history') as string,
      alcoholFreeApproach: formData.get('alcoholFreeApproach') as string,
      results: formData.get('results') as string | null,
      startYear: parseInt(formData.get('startYear') as string),
      videoLink: formData.get('videoLink') as string | null,
    };

    const tradition = await prisma.tradition.update({
      where: { id: params.id },
      data: updateData,
    });

    // Handle image uploads
    const images = formData.getAll('images') as File[];
    for (const image of images) {
      if (image instanceof File) {
        const buffer = Buffer.from(await image.arrayBuffer());
        const filename = Date.now() + '-' + image.name;
        const filepath = path.join(process.cwd(), 'public/uploads/tradition-images', filename);
        await writeFile(filepath, buffer);
        await prisma.image.create({
          data: {
            url: `/uploads/tradition-images/${filename}`,
            traditionId: tradition.id,
          },
        });
      }
    }

    // Handle policy file upload
    const policyFile = formData.get('policyFile') as File | null;
    if (policyFile instanceof File) {
      const buffer = Buffer.from(await policyFile.arrayBuffer());
      const filename = Date.now() + '-' + policyFile.name;
      const filepath = path.join(process.cwd(), 'public/uploads/policy-files', filename);
      await writeFile(filepath, buffer);
      await prisma.tradition.update({
        where: { id: tradition.id },
        data: { policyFileUrl: `/uploads/policy-files/${filename}` },
      });
    }

    return NextResponse.json(tradition, { status: 200 });
  } catch (error) {
    console.error('Error updating tradition:', error);
    return NextResponse.json({ error: 'Internal Server Error', details: error }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const tradition = await prisma.tradition.findUnique({
      where: { id: params.id },
      include: { images: true },
    });

    if (!tradition) {
      return NextResponse.json({ error: 'Tradition not found' }, { status: 404 });
    }

    for (const image of tradition.images) {
      const imagePath = path.join(process.cwd(), 'public', image.url);
      await unlink(imagePath).catch(error => console.error('Error deleting image file:', error));
      await prisma.image.delete({ where: { id: image.id } });
    }

    if (tradition.policyFileUrl) {
      const policyFilePath = path.join(process.cwd(), 'public', tradition.policyFileUrl);
      await unlink(policyFilePath).catch(error => console.error('Error deleting policy file:', error));
    }

    await prisma.tradition.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ message: 'Tradition deleted successfully' }, { status: 200 });
  } catch (error) {
    console.error('Error deleting tradition:', error);
    return NextResponse.json({ error: 'Internal Server Error', details: error }, { status: 500 });
  }
}