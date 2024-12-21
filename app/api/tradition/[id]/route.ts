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
    let body;
    const contentType = request.headers.get('content-type');
    if (contentType?.includes('application/json')) {
      body = await request.json();
    } else if (contentType?.includes('multipart/form-data')) {
      const formData = await request.formData();
      body = Object.fromEntries(formData);
    } else {
      return NextResponse.json({ error: 'Unsupported content type' }, { status: 400 });
    }

    if (body.action === 'incrementViewCount') {
      const updatedTradition = await prisma.tradition.update({
        where: { id: params.id },
        data: { viewCount: { increment: 1 } },
        select: { viewCount: true }
      });
      return NextResponse.json(updatedTradition);
    }

    const traditionData: any = {
      name: body.name,
      categoryId: body.categoryId,
      district: body.district,
      amphoe: body.amphoe,
      province: body.province,
      type: body.type,
      village: body.village || null,
      coordinatorName: body.coordinatorName,
      phone: body.phone || null,
      history: body.history,
      alcoholFreeApproach: body.alcoholFreeApproach,
      results: body.results || null,
      startYear: parseInt(body.startYear as string),
      videoLink: body.videoLink || null,
      hasPolicy: body.hasPolicy === 'true',
      hasAnnouncement: body.hasAnnouncement === 'true',
      hasInspector: body.hasInspector === 'true',
      hasMonitoring: body.hasMonitoring === 'true',
      hasCampaign: body.hasCampaign === 'true',
      hasAlcoholPromote: body.hasAlcoholPromote === 'true',
    };

    ['zipcode', 'district_code', 'amphoe_code', 'province_code'].forEach(field => {
      traditionData[field] = body[field] && !isNaN(Number(body[field])) ? Number(body[field]) : null;
    });

    // Handle existing images
    if (body.existingImages) {
      const existingImages = JSON.parse(body.existingImages);
      await prisma.image.deleteMany({
        where: {
          traditionId: params.id,
          url: { notIn: existingImages }
        }
      });
    }

    // Handle new images (if present)
    if (body.newImages) {
      const newImages = Array.isArray(body.newImages) ? body.newImages : [body.newImages];
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
    }

    // Handle policy file
    await handlePolicyFile(body, params.id);

    const updatedTradition = await prisma.tradition.update({
      where: { id: params.id },
      data: traditionData,
    });

    return NextResponse.json(updatedTradition);
  } catch (error) {
    console.error('Error updating tradition:', error);
    return NextResponse.json({ error: 'Internal Server Error', details: String(error) }, { status: 500 });
  }
}

async function handlePolicyFile(body: any, traditionId: string) {
  const existingTradition = await prisma.tradition.findUnique({
    where: { id: traditionId },
    select: { policyFileUrl: true }
  });

  if (existingTradition?.policyFileUrl) {
    const oldFilePath = path.join(process.cwd(), 'public', existingTradition.policyFileUrl);
    await unlink(oldFilePath).catch(error => console.error('Error deleting old policy file:', error));
  }

  if (body.policyFile instanceof Blob) {
    const buffer = await body.policyFile.arrayBuffer();
    const filename = Date.now() + '-' + body.policyFile.name.replace(/\s+/g, '-');
    const filepath = path.join(process.cwd(), 'public/uploads/policy-files', filename);
    await writeFile(filepath, Buffer.from(buffer));
    
    await prisma.tradition.update({
      where: { id: traditionId },
      data: { policyFileUrl: `/uploads/policy-files/${filename}` },
    });
  } else if (body.removePolicyFile === 'true') {
    await prisma.tradition.update({
      where: { id: traditionId },
      data: { policyFileUrl: null },
    });
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