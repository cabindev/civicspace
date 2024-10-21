// app/api/tradition/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/app/lib/prisma';
import { writeFile, unlink } from 'fs/promises';
import path from 'path';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const tradition = await prisma.tradition.findUnique({
      where: { id: params.id },
      include: { category: true, images: true },
    });

    if (!tradition) {
      return NextResponse.json({ error: 'Tradition not found' }, { status: 404 });
    }

    return NextResponse.json(tradition);
  } catch (error) {
    console.error('Error fetching tradition:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const formData = await request.formData();
    const traditionData: any = {};

    for (const [key, value] of Object.entries(Object.fromEntries(formData))) {
      if (key !== 'newImages' && key !== 'policyFile' && key !== 'existingImages') {
        traditionData[key] = value;
      }
    }

    // Parse numeric fields
    ['startYear', 'zipcode', 'district_code', 'amphoe_code', 'province_code'].forEach(field => {
      if (traditionData[field]) {
        traditionData[field] = parseInt(traditionData[field], 10);
      }
    });

    if (formData.get('action') === 'incrementViewCount') {
      const updatedTradition = await prisma.tradition.update({
        where: { id: params.id },
        data: { viewCount: { increment: 1 } },
        select: { viewCount: true }
      });
      return NextResponse.json(updatedTradition);
    }

    // Handle existing images
    if (formData.get('existingImages')) {
      const existingImages = JSON.parse(formData.get('existingImages') as string);
      await prisma.image.deleteMany({
        where: {
          traditionId: params.id,
          url: { notIn: existingImages }
        }
      });
    }

    // Handle new images
    const newImages = formData.getAll('newImages');
    for (const image of newImages) {
      if (image instanceof Blob) {
        const buffer = await image.arrayBuffer();
        const filename = Date.now() + '-' + (image as File).name.replace(/\s+/g, '-');
        const filepath = path.join(process.cwd(), 'public/uploads/tradition-images', filename);
        await writeFile(filepath, Buffer.from(buffer));
        await prisma.image.create({
          data: {
            url: `/uploads/tradition-images/${filename}`,
            traditionId: params.id,
          },
        });
      }
    }

    // Handle policy file
    const policyFile = formData.get('policyFile');
    if (policyFile instanceof Blob) {
      const buffer = await policyFile.arrayBuffer();
      const filename = Date.now() + '-' + policyFile.name.replace(/\s+/g, '-');
      const filepath = path.join(process.cwd(), 'public/uploads/policy-files', filename);
      await writeFile(filepath, Buffer.from(buffer));
      traditionData.policyFileUrl = `/uploads/policy-files/${filename}`;
    } else if (formData.get('removePolicyFile') === 'true') {
      traditionData.policyFileUrl = null;
    }

    const updatedTradition = await prisma.tradition.update({
      where: { id: params.id },
      data: traditionData,
    });

    // Fetch updated tradition with images
    const finalUpdatedTradition = await prisma.tradition.findUnique({
      where: { id: params.id },
      include: { images: true, category: true },
    });

    return NextResponse.json(finalUpdatedTradition);
  } catch (error) {
    console.error('Error updating tradition:', error);
    return NextResponse.json({ error: 'Internal Server Error', details: String(error) }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const tradition = await prisma.tradition.findUnique({
      where: { id: params.id },
      include: { images: true },
    });

    if (!tradition) {
      return NextResponse.json({ error: 'Tradition not found' }, { status: 404 });
    }

    // Delete associated images
    for (const image of tradition.images) {
      const imagePath = path.join(process.cwd(), 'public', image.url);
      await unlink(imagePath).catch(error => console.error('Error deleting image file:', error));
      await prisma.image.delete({ where: { id: image.id } });
    }

    // Delete associated policy file
    if (tradition.policyFileUrl) {
      const policyFilePath = path.join(process.cwd(), 'public', tradition.policyFileUrl);
      await unlink(policyFilePath).catch(error => console.error('Error deleting policy file:', error));
    }

    // Delete the tradition
    await prisma.tradition.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ message: 'Tradition deleted successfully' });
  } catch (error) {
    console.error('Error deleting tradition:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}