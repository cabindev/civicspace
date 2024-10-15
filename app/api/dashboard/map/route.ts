import { NextResponse } from 'next/server';
import prisma from '@/app/lib/prisma';

// สมมติว่ามีฟังก์ชันแปลงที่อยู่เป็นพิกัด
async function getCoordinates(district: string, amphoe: string, province: string) {
  // ใช้บริการ geocoding API เพื่อแปลงที่อยู่เป็นพิกัด
  // นี่เป็นเพียงตัวอย่าง คุณต้องใช้บริการจริงๆ เช่น Google Maps Geocoding API
  return { lat: 13.7563, lng: 100.5018 }; // ตัวอย่างค่าคงที่
}

export async function GET() {
  try {
    const [traditions, policies] = await Promise.all([
      prisma.tradition.findMany({
        select: {
          name: true,
          type: true,
          district: true,
          amphoe: true,
          province: true,
        },
      }),
      prisma.publicPolicy.findMany({
        select: {
          name: true,
          type: true,
          district: true,
          amphoe: true,
          province: true,
        },
      }),
    ]);

    const mapData = await Promise.all([
      ...traditions.map(async t => {
        const coordinates = await getCoordinates(t.district, t.amphoe, t.province);
        return {
          name: t.name,
          type: 'Tradition',
          ...coordinates,
        };
      }),
      ...policies.map(async p => {
        const coordinates = await getCoordinates(p.district, p.amphoe, p.province);
        return {
          name: p.name,
          type: 'Policy',
          ...coordinates,
        };
      }),
    ]);

    return NextResponse.json(mapData);
  } catch (error) {
    console.error('Error fetching map data:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}