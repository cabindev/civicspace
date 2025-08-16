import { NextResponse } from 'next/server';
import prisma from '@/app/lib/prisma';

export async function GET() {
  try {
    // ดึงข้อมูล type ที่มีอยู่จริงจากทุกตาราง
    const [traditionTypes, policyTypes, ethnicTypes, activityTypes] = await Promise.all([
      prisma.tradition.findMany({
        select: { type: true },
        distinct: ['type']
      }),
      prisma.publicPolicy.findMany({
        select: { type: true },
        distinct: ['type']
      }),
      prisma.ethnicGroup.findMany({
        select: { type: true },
        distinct: ['type']
      }),
      prisma.creativeActivity.findMany({
        select: { type: true },
        distinct: ['type']
      })
    ]);

    // รวมข้อมูล type ทั้งหมดและหาค่าที่ไม่ซ้ำ
    const allTypes = [
      ...traditionTypes.map(t => t.type),
      ...policyTypes.map(t => t.type),
      ...ethnicTypes.map(t => t.type),
      ...activityTypes.map(t => t.type)
    ];

    const uniqueTypes = [...new Set(allTypes)].filter(Boolean).sort();

    return NextResponse.json({
      traditionTypes: traditionTypes.map(t => t.type),
      policyTypes: policyTypes.map(t => t.type),
      ethnicTypes: ethnicTypes.map(t => t.type),
      activityTypes: activityTypes.map(t => t.type),
      allTypes: uniqueTypes
    });
  } catch (error) {
    console.error('Error fetching regions:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}