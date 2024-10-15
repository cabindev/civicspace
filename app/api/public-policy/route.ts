// app/api/public-policy/route.ts

import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/app/lib/prisma';
import { writeFile } from 'fs/promises';
import path from 'path';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();

    const policyData: any = {
      name: formData.get('name') as string || 'Untitled Policy',
      signingDate: new Date(formData.get('signingDate') as string) || new Date(),
      level: formData.get('level') as string || 'UNKNOWN',
      district: formData.get('district') as string || 'UNKNOWN',
      amphoe: formData.get('amphoe') as string || 'UNKNOWN',
      province: formData.get('province') as string || 'UNKNOWN',
      type: formData.get('type') as string || 'UNKNOWN',
      village: formData.get('village') as string || null,
      content: formData.get('content') ? JSON.parse(formData.get('content') as string) : [],
      summary: formData.get('summary') as string || '',
      results: formData.get('results') as string || null,
      videoLink: formData.get('videoLink') as string || null,
    };

    // Handle numeric fields
    ['zipcode', 'district_code', 'amphoe_code', 'province_code'].forEach(field => {
      const value = formData.get(field);
      policyData[field] = value && !isNaN(Number(value)) ? Number(value) : null;
    });

    console.log('Policy Data to be created:', policyData); // For debugging

    // Create the public policy
    const policy = await prisma.publicPolicy.create({
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
          publicPolicyId: policy.id,
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
        where: { id: policy.id },
        data: { policyFileUrl: `/uploads/policy-files/${filename}` },
      });
    }

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
    });
    return NextResponse.json(policies);
  } catch (error) {
    console.error('Error fetching public policies:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}