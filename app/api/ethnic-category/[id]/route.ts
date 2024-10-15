import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/app/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const category = await prisma.ethnicCategory.findUnique({
      where: { id: params.id },
    });
    if (!category) {
      return NextResponse.json({ error: 'Category not found' }, { status: 404 });
    }
    return NextResponse.json(category);
  } catch (error) {
    console.error('Error fetching ethnic category:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const category = await prisma.ethnicCategory.update({
      where: { id: params.id },
      data: { name: body.name },
    });
    return NextResponse.json(category);
  } catch (error) {
    console.error('Error updating ethnic category:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // ตรวจสอบว่ามี EthnicGroup ที่ใช้ category นี้หรือไม่
    const ethnicGroupsUsingCategory = await prisma.ethnicGroup.findFirst({
      where: { categoryId: params.id },
    });

    if (ethnicGroupsUsingCategory) {
      return NextResponse.json(
        { error: 'Cannot delete category. It is being used by ethnic groups.' },
        { status: 400 }
      );
    }

    // ถ้าไม่มี EthnicGroup ที่ใช้ category นี้ ให้ดำเนินการลบ
    await prisma.ethnicCategory.delete({
      where: { id: params.id },
    });
    return NextResponse.json({ message: 'Category deleted successfully' });
  } catch (error) {
    console.error('Error deleting ethnic category:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}