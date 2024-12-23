// app/api/public-policy/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/app/lib/prisma';
import { writeFile, unlink } from 'fs/promises';
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
      const updatedPolicy = await prisma.publicPolicy.update({
        where: { id: params.id },
        data: { viewCount: { increment: 1 } },
        select: { viewCount: true }
      });
      return NextResponse.json(updatedPolicy);
    }

    const policyData: any = {
      name: body.name,
      signingDate: new Date(body.signingDate),
      level: body.level,
      district: body.district,
      amphoe: body.amphoe,
      province: body.province,
      type: body.type,
      village: body.village || null,
      content: Array.isArray(body.content) ? body.content : JSON.parse(body.content as string),
      summary: body.summary,
      results: body.results || null,
      videoLink: body.videoLink || null,
    };

    ['zipcode', 'district_code', 'amphoe_code', 'province_code'].forEach(field => {
      policyData[field] = body[field] && !isNaN(Number(body[field])) ? Number(body[field]) : null;
    });

    const currentPolicy = await prisma.publicPolicy.findUnique({
      where: { id: params.id },
      select: { userId: true }
    });

    const updatedPolicy = await prisma.publicPolicy.update({
      where: { id: params.id },
      data: policyData,
    });

    if (body.existingImages) {
      const existingImages = JSON.parse(body.existingImages);
      await prisma.image.deleteMany({
        where: {
          publicPolicyId: params.id,
          url: { notIn: existingImages }
        }
      });
    }

    if (body.newImages) {
      const newImages = Array.isArray(body.newImages) ? body.newImages : [body.newImages];
      for (const image of newImages) {
        if (image instanceof Blob) {
          const buffer = await image.arrayBuffer();
          const filename = Date.now() + '-' + (image as File).name.replace(/\s+/g, '-');
          const filepath = path.join(process.cwd(), 'public/uploads/public-policy-images', filename);
          await writeFile(filepath, Buffer.from(buffer));
          await prisma.image.create({
            data: {
              url: `/uploads/public-policy-images/${filename}`,
              publicPolicyId: params.id,
            },
          });
        }
      }
    }

    if (body.policyFile instanceof Blob) {
      const buffer = await body.policyFile.arrayBuffer();
      const filename = Date.now() + '-' + body.policyFile.name.replace(/\s+/g, '-');
      const filepath = path.join(process.cwd(), 'public/uploads/policy-files', filename);
      await writeFile(filepath, Buffer.from(buffer));
      policyData.policyFileUrl = `/uploads/policy-files/${filename}`;
    } else if (body.removePolicyFile === 'true') {
      policyData.policyFileUrl = null;
    }

    if (policyData.policyFileUrl !== undefined) {
      await prisma.publicPolicy.update({
        where: { id: params.id },
        data: { policyFileUrl: policyData.policyFileUrl },
      });
    }

    // Create notification for update
    if (currentPolicy) {
      await prisma.notification.create({
        data: {
          userId: currentPolicy.userId,
          activityId: params.id,
          activityType: 'publicPolicy_updated',
        }
      });
    }

    const finalUpdatedPolicy = await prisma.publicPolicy.findUnique({
      where: { id: params.id },
      include: { images: true },
    });

    return NextResponse.json(finalUpdatedPolicy);
  } catch (error) {
    console.error('Error updating public policy:', error);
    return NextResponse.json({ error: 'Internal Server Error', details: String(error) }, { status: 500 });
  }
}

export async function DELETE(
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

    // Delete associated notifications
    await prisma.notification.deleteMany({
      where: {
        activityId: params.id,
        activityType: {
          in: ['publicPolicy', 'publicPolicy_updated']
        }
      }
    });

    for (const image of policy.images) {
      const imagePath = path.join(process.cwd(), 'public', image.url);
      await unlink(imagePath).catch(error => console.error('Error deleting image file:', error));
      await prisma.image.delete({ where: { id: image.id } });
    }

    if (policy.policyFileUrl) {
      const policyFilePath = path.join(process.cwd(), 'public', policy.policyFileUrl);
      await unlink(policyFilePath).catch(error => console.error('Error deleting policy file:', error));
    }

    await prisma.publicPolicy.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ message: 'Policy deleted successfully' });
  } catch (error) {
    console.error('Error deleting public policy:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}