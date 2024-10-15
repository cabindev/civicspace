import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/app/lib/prisma';
import { writeFile } from 'fs/promises';
import path from 'path';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const policy = await prisma.publicPolicy.findUnique({
      where: { id: params.id },
      include: { images: true },
    });

    if (!policy) {
      return NextResponse.json({ error: 'Policy not found' }, { status: 404 });
    }

    return NextResponse.json(policy);
  } catch (error) {
    console.error('Error fetching public policy:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const formData = await request.formData();

    const policyData: any = {
      name: formData.get('name') as string,
      signingDate: new Date(formData.get('signingDate') as string),
      level: formData.get('level') as string,
      district: formData.get('district') as string,
      amphoe: formData.get('amphoe') as string,
      province: formData.get('province') as string,
      type: formData.get('type') as string,
      village: formData.get('village') as string || null,
      content: JSON.parse(formData.get('content') as string),
      summary: formData.get('summary') as string,
      results: formData.get('results') as string || null,
      videoLink: formData.get('videoLink') as string || null,
    };

    ['zipcode', 'district_code', 'amphoe_code', 'province_code'].forEach(field => {
      const value = formData.get(field);
      policyData[field] = value && !isNaN(Number(value)) ? Number(value) : null;
    });

    const updatedPolicy = await prisma.publicPolicy.update({
      where: { id: params.id },
      data: policyData,
    });

    // Handle image uploads
    const images = formData.getAll('images') as File[];
    for (const image of images) {
      const buffer = Buffer.from(await image.arrayBuffer());
      const filename = Date.now() + '-' + image.name.replace(/\s+/g, '-');
      const filepath = path.join(process.cwd(), 'public/uploads/public-policy-images', filename);
      await writeFile(filepath, buffer);
      await prisma.image.create({
        data: {
          url: `/uploads/public-policy-images/${filename}`,
          publicPolicyId: updatedPolicy.id,
        },
      });
    }

    // Handle policy file upload
    const policyFile = formData.get('policyFile') as File;
    if (policyFile) {
      const buffer = Buffer.from(await policyFile.arrayBuffer());
      const filename = Date.now() + '-' + policyFile.name.replace(/\s+/g, '-');
      const filepath = path.join(process.cwd(), 'public/uploads/policy-files', filename);
      await writeFile(filepath, buffer);
      await prisma.publicPolicy.update({
        where: { id: updatedPolicy.id },
        data: { policyFileUrl: `/uploads/policy-files/${filename}` },
      });
    }

    return NextResponse.json(updatedPolicy);
  } catch (error) {
    console.error('Error updating public policy:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.publicPolicy.delete({
      where: { id: params.id },
    });
    return NextResponse.json({ message: 'Policy deleted successfully' });
  } catch (error) {
    console.error('Error deleting public policy:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}