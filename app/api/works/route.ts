// app/api/works/route.ts — รายการผลงานทั้งหมด (รวมที่ยังไม่เผยแพร่) และสร้างงานใหม่ · เฉพาะแอดมิน (แดชบอร์ดเปิดให้ ADMIN/SUPER_ADMIN เท่านั้น — proxy.ts)
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/app/lib/prisma';
import { getAdminUser } from '@/app/lib/adminAuth';
import { parseWorkInput } from '@/app/lib/workInput';

export async function GET() {
  if (!(await getAdminUser())) return NextResponse.json({ error: 'ไม่มีสิทธิ์' }, { status: 403 });
  const works = await prisma.activity.findMany({
    where: { deletedAt: null },
    select: {
      id: true, title: true, issueKey: true, province: true, district: true, areaName: true,
      startDate: true, isPublished: true, status: true, sourceSystem: true, updatedAt: true,
      _count: { select: { attachments: true, links: true } },
    },
    orderBy: [{ startDate: 'desc' }, { id: 'desc' }],
  });
  return NextResponse.json({ works });
}

export async function POST(request: NextRequest) {
  const user = await getAdminUser();
  if (!user) return NextResponse.json({ error: 'ไม่มีสิทธิ์' }, { status: 403 });

  const body = await request.json().catch(() => null);
  if (!body || typeof body !== 'object') return NextResponse.json({ error: 'ข้อมูลไม่ถูกต้อง' }, { status: 400 });
  const parsed = parseWorkInput(body);
  if ('error' in parsed) return NextResponse.json({ error: parsed.error }, { status: 400 });

  const author = await prisma.user.findUnique({ where: { id: user.id }, select: { firstName: true, lastName: true, email: true } });
  const work = await prisma.activity.create({
    data: {
      ...parsed.data,
      category: 'Civic Space',
      authorName: [author?.firstName, author?.lastName].filter(Boolean).join(' ') || null,
      authorEmail: author?.email ?? null,
      isPublished: parsed.isPublished,
      publishedAt: parsed.isPublished ? new Date() : null,
      links: { create: parsed.links },
    },
    select: { id: true },
  });
  return NextResponse.json({ id: work.id }, { status: 201 });
}
