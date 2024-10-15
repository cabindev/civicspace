//api/creative-subcategory/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/app/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const subcategory = await prisma.creativeSubCategory.findUnique({
      where: { id: params.id },
      include: { category: true },
    });
    if (!subcategory) {
      return NextResponse.json({ error: 'Subcategory not found' }, { status: 404 });
    }
    return NextResponse.json(subcategory);
  } catch (error) {
    console.error('Error fetching creative subcategory:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const subcategory = await prisma.creativeSubCategory.update({
      where: { id: params.id },
      data: { 
        name: body.name,
        categoryId: body.categoryId 
      },
    });
    return NextResponse.json(subcategory);
  } catch (error) {
    console.error('Error updating creative subcategory:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // ตรวจสอบว่ามี CreativeActivity ที่ใช้ subcategory นี้หรือไม่
    const activitiesUsingSubcategory = await prisma.creativeActivity.findFirst({
      where: { subCategoryId: params.id },
    });

    if (activitiesUsingSubcategory) {
      return NextResponse.json(
        { error: 'Cannot delete subcategory. It is being used by creative activities.' },
        { status: 400 }
      );
    }

    // ถ้าไม่มี CreativeActivity ที่ใช้ subcategory นี้ ให้ดำเนินการลบ
    await prisma.creativeSubCategory.delete({
      where: { id: params.id },
    });
    return NextResponse.json({ message: 'Subcategory deleted successfully' });
  } catch (error) {
    console.error('Error deleting creative subcategory:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}