import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/app/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const subCategory = await prisma.creativeSubCategory.create({
      data: {
        name: body.name,
        categoryId: body.categoryId,
      },
    });
    return NextResponse.json(subCategory, { status: 201 });
  } catch (error) {
    console.error('Error creating creative sub-category:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function GET() {
  try {
    const subCategories = await prisma.creativeSubCategory.findMany({
      include: { category: true }
    });
    return NextResponse.json(subCategories);
  } catch (error) {
    console.error('Error fetching creative sub-categories:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}