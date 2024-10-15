import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/app/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const category = await prisma.creativeCategory.create({
      data: { name: body.name },
    });
    return NextResponse.json(category, { status: 201 });
  } catch (error) {
    console.error('Error creating creative category:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function GET() {
  try {
    const categories = await prisma.creativeCategory.findMany({
      include: { subCategories: true }
    });
    return NextResponse.json(categories);
  } catch (error) {
    console.error('Error fetching creative categories:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}