import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/app/lib/prisma';
import { writeFile, unlink } from 'fs/promises';
import path from 'path';

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const activity = await prisma.creativeActivity.findUnique({
      where: { id: params.id },
      include: { 
        category: true, 
        subCategory: true, 
        images: true,
        user: {
          select: {
            firstName: true,
            lastName: true,
            image: true,
            email: true
          }
        }
      },
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
      const updatedActivity = await prisma.creativeActivity.update({
        where: { id: params.id },
        data: { viewCount: { increment: 1 } },
        select: { viewCount: true }
      });
      return NextResponse.json(updatedActivity);
    }

    const currentActivity = await prisma.creativeActivity.findUnique({
      where: { id: params.id },
      select: { userId: true }
    });

    const activityData: any = {
      name: body.name,
      categoryId: body.categoryId,
      subCategoryId: body.subCategoryId,
      district: body.district,
      amphoe: body.amphoe,
      province: body.province,
      type: body.type,
      village: body.village || null,
      coordinatorName: body.coordinatorName,
      phone: body.phone || null,
      description: body.description,
      summary: body.summary,
      results: body.results || null,
      startYear: parseInt(body.startYear as string),
      videoLink: body.videoLink || null,
    };

    ['zipcode', 'district_code', 'amphoe_code', 'province_code'].forEach(field => {
      activityData[field] = body[field] && !isNaN(Number(body[field])) ? Number(body[field]) : null;
    });

    const updatedActivity = await prisma.creativeActivity.update({
      where: { id: params.id },
      data: activityData,
    });

    const existingImages = JSON.parse(body.existingImages || '[]');
    await prisma.image.deleteMany({
      where: {
        creativeActivityId: params.id,
        url: { notIn: existingImages }
      }
    });

    if (body.newImages) {
      const newImages = Array.isArray(body.newImages) ? body.newImages : [body.newImages];
      for (const image of newImages) {
        if (image instanceof Blob) {
          const buffer = await image.arrayBuffer();
          const filename = Date.now() + '-' + (image as File).name.replace(/\s+/g, '-');
          const filepath = path.join(process.cwd(), 'public/uploads/creative-activity-images', filename);
          await writeFile(filepath, Buffer.from(buffer));
          await prisma.image.create({
            data: {
              url: `/uploads/creative-activity-images/${filename}`,
              creativeActivityId: params.id,
            },
          });
        }
      }
    }

    // Handle report file
    await handleReportFile(body, params.id);

    // Create notification for update

    if (currentActivity) {
      await prisma.notification.create({
        data: {
          userId: currentActivity.userId,
          activityId: params.id,
          activityType: 'creativeActivity_updated',
        }
      });
    }

    // Fetch final updated activity with all relations
    const finalUpdatedActivity = await prisma.creativeActivity.findUnique({
      where: { id: params.id },
      include: { images: true, category: true, subCategory: true },
    });

    return NextResponse.json(finalUpdatedActivity);
  } catch (error) {
    console.error('Error updating creative activity:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

async function handleReportFile(body: any, activityId: string) {
  const existingActivity = await prisma.creativeActivity.findUnique({
    where: { id: activityId },
    select: { reportFileUrl: true }
  });

  if (existingActivity?.reportFileUrl) {
    const oldFilePath = path.join(process.cwd(), 'public', existingActivity.reportFileUrl);
    await unlink(oldFilePath).catch(error => console.error('Error deleting old report file:', error));
  }

  if (body.reportFile instanceof Blob) {
    const buffer = await body.reportFile.arrayBuffer();
    const filename = Date.now() + '-' + body.reportFile.name.replace(/\s+/g, '-');
    const filepath = path.join(process.cwd(), 'public/uploads/creative-activity-files', filename);
    await writeFile(filepath, Buffer.from(buffer));
    
    await prisma.creativeActivity.update({
      where: { id: activityId },
      data: { reportFileUrl: `/uploads/creative-activity-files/${filename}` },
    });
  } else if (body.removeReportFile === 'true') {
    await prisma.creativeActivity.update({
      where: { id: activityId },
      data: { reportFileUrl: null },
    });
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

    // Delete associated notifications
    
    // await prisma.notification.deleteMany({
    //   where: {
    //     activityId: params.id,
    //     activityType: {
    //       in: ['creativeActivity', 'creativeActivity_updated']
    //     }
    //   }
    // });

    // Delete associated images
    for (const image of activity.images) {
      const imagePath = path.join(process.cwd(), 'public', image.url);
      await unlink(imagePath).catch(error => console.error('Error deleting image file:', error));
      await prisma.image.delete({ where: { id: image.id } });
    }

    // Delete report file if exists
    if (activity.reportFileUrl) {
      const reportFilePath = path.join(process.cwd(), 'public', activity.reportFileUrl);
      await unlink(reportFilePath).catch(error => console.error('Error deleting report file:', error));
    }

    // Delete the activity
    await prisma.creativeActivity.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ message: 'Creative Activity deleted successfully' }, { status: 200 });
  } catch (error) {
    console.error('Error deleting creative activity:', error);
    return NextResponse.json({ error: 'Internal Server Error', details: error }, { status: 500 });
  }
}