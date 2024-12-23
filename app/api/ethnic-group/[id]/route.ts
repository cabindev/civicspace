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

    return NextResponse.json(ethnicGroup);
  } catch (error) {
    console.error('Error fetching ethnic group:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
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
      const updatedEthnicGroup = await prisma.ethnicGroup.update({
        where: { id: params.id },
        data: { viewCount: { increment: 1 } },
        select: { viewCount: true }
      });
      return NextResponse.json(updatedEthnicGroup);
    }

    const currentEthnicGroup = await prisma.ethnicGroup.findUnique({
      where: { id: params.id },
      select: { userId: true }
    });

    const ethnicGroupData: any = {
      categoryId: body.categoryId,
      name: body.name,
      district: body.district,
      amphoe: body.amphoe,
      province: body.province,
      village: body.village || null,
      history: body.history,
      activityName: body.activityName,
      activityOrigin: body.activityOrigin,
      activityDetails: body.activityDetails,
      alcoholFreeApproach: body.alcoholFreeApproach,
      results: body.results || null,
      startYear: parseInt(body.startYear as string),
      videoLink: body.videoLink || null,
    };

    ['zipcode', 'district_code', 'amphoe_code', 'province_code'].forEach(field => {
      ethnicGroupData[field] = body[field] && !isNaN(Number(body[field])) ? Number(body[field]) : null;
    });

    const updatedEthnicGroup = await prisma.ethnicGroup.update({
      where: { id: params.id },
      data: ethnicGroupData,
    });

    // Handle existing images
    if (body.existingImages) {
      const existingImages = JSON.parse(body.existingImages);
      await prisma.image.deleteMany({
        where: {
          ethnicGroupId: params.id,
          url: { notIn: existingImages }
        }
      });
    }

    // Handle new images
    if (body.newImages) {
      const newImages = Array.isArray(body.newImages) ? body.newImages : [body.newImages];
      for (const image of newImages) {
        if (image instanceof Blob) {
          const buffer = await image.arrayBuffer();
          const filename = Date.now() + '-' + (image as File).name.replace(/\s+/g, '-');
          const filepath = path.join(process.cwd(), 'public/uploads/ethnic-group-images', filename);
          await writeFile(filepath, Buffer.from(buffer));
          await prisma.image.create({
            data: {
              url: `/uploads/ethnic-group-images/${filename}`,
              ethnicGroupId: params.id,
            },
          });
        }
      }
    }

    // Handle file upload
    if (body.fileUrl instanceof Blob) {
      const buffer = await body.fileUrl.arrayBuffer();
      const filename = Date.now() + '-' + body.fileUrl.name.replace(/\s+/g, '-');
      const filepath = path.join(process.cwd(), 'public/uploads/ethnic-group-files', filename);
      await writeFile(filepath, Buffer.from(buffer));
      ethnicGroupData.fileUrl = `/uploads/ethnic-group-files/${filename}`;
    } else if (body.removeFile === 'true') {
      ethnicGroupData.fileUrl = null;
    }

    if (ethnicGroupData.fileUrl !== undefined) {
      await prisma.ethnicGroup.update({
        where: { id: params.id },
        data: { fileUrl: ethnicGroupData.fileUrl },
      });
    }

    // Create notification for update

    // if (currentEthnicGroup) {
    //   await prisma.notification.create({
    //     data: {
    //       userId: currentEthnicGroup.userId,
    //       activityId: params.id,
    //       activityType: 'ethnicGroup_updated',
    //     }
    //   });
    // }

    const finalUpdatedEthnicGroup = await prisma.ethnicGroup.findUnique({
      where: { id: params.id },
      include: { images: true, category: true },
    });

    return NextResponse.json(finalUpdatedEthnicGroup);
  } catch (error) {
    console.error('Error updating ethnic group:', error);
    return NextResponse.json({ error: 'Internal Server Error', details: String(error) }, { status: 500 });
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

    // Delete associated notifications

    // await prisma.notification.deleteMany({
    //   where: {
    //     activityId: params.id,
    //     activityType: {
    //       in: ['ethnicGroup', 'ethnicGroup_updated']
    //     }
    //   }
    // });

    // Delete associated images
    for (const image of ethnicGroup.images) {
      const imagePath = path.join(process.cwd(), 'public', image.url);
      await unlink(imagePath).catch(error => console.error('Error deleting image file:', error));
      await prisma.image.delete({ where: { id: image.id } });
    }

    // Delete associated file if exists
    if (ethnicGroup.fileUrl) {
      const filePath = path.join(process.cwd(), 'public', ethnicGroup.fileUrl);
      await unlink(filePath).catch(error => console.error('Error deleting file:', error));
    }

    // Delete the ethnic group
    await prisma.ethnicGroup.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ message: 'Ethnic group deleted successfully' }, { status: 200 });
  } catch (error) {
    console.error('Error deleting ethnic group:', error);
    return NextResponse.json({ error: 'Internal Server Error', details: error }, { status: 500 });
  }
}