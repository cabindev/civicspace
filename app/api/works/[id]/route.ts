// app/api/works/[id]/route.ts — อ่าน / แก้ / ลบ (ซ่อน) ผลงาน · เฉพาะแอดมิน (แดชบอร์ดเปิดให้ ADMIN/SUPER_ADMIN เท่านั้น — proxy.ts)
// ลบ = ตั้ง deletedAt (กู้คืนได้จากฐานข้อมูล) ไม่ลบไฟล์จริง
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/app/lib/prisma';
import { getAdminUser } from '@/app/lib/adminAuth';
import { parseWorkInput } from '@/app/lib/workInput';

type Ctx = { params: Promise<{ id: string }> };
const workId = async (ctx: Ctx) => {
  const id = Number((await ctx.params).id);
  return Number.isInteger(id) && id > 0 ? id : null;
};

export async function GET(_req: NextRequest, ctx: Ctx) {
  if (!(await getAdminUser())) return NextResponse.json({ error: 'ไม่มีสิทธิ์' }, { status: 403 });
  const id = await workId(ctx);
  const work = id
    ? await prisma.activity.findFirst({
        where: { id, deletedAt: null },
        include: {
          attachments: { orderBy: [{ isCover: 'desc' }, { id: 'asc' }] },
          links: { orderBy: [{ sortOrder: 'asc' }, { id: 'asc' }] },
          areas: { orderBy: [{ sortOrder: 'asc' }, { id: 'asc' }] },
        },
      })
    : null;
  if (!work) return NextResponse.json({ error: 'ไม่พบงาน' }, { status: 404 });
  return NextResponse.json({ work });
}

export async function PATCH(request: NextRequest, ctx: Ctx) {
  if (!(await getAdminUser())) return NextResponse.json({ error: 'ไม่มีสิทธิ์' }, { status: 403 });
  const id = await workId(ctx);
  const existing = id ? await prisma.activity.findFirst({ where: { id, deletedAt: null }, select: { id: true, isPublished: true, publishedAt: true } }) : null;
  if (!existing) return NextResponse.json({ error: 'ไม่พบงาน' }, { status: 404 });

  const body = await request.json().catch(() => null);
  if (!body || typeof body !== 'object') return NextResponse.json({ error: 'ข้อมูลไม่ถูกต้อง' }, { status: 400 });
  const parsed = parseWorkInput(body);
  if ('error' in parsed) return NextResponse.json({ error: parsed.error }, { status: 400 });

  await prisma.$transaction([
    prisma.activityLink.deleteMany({ where: { activityId: existing.id } }),
    prisma.activity.update({
      where: { id: existing.id },
      data: {
        ...parsed.data,
        isPublished: parsed.isPublished,
        // วันเผยแพร่ครั้งแรกคงไว้ ไม่เปลี่ยนทุกครั้งที่บันทึก
        publishedAt: parsed.isPublished ? (existing.publishedAt ?? new Date()) : existing.publishedAt,
        links: { create: parsed.links },
      },
    }),
  ]);
  return NextResponse.json({ ok: true });
}

export async function DELETE(_req: NextRequest, ctx: Ctx) {
  if (!(await getAdminUser())) return NextResponse.json({ error: 'ไม่มีสิทธิ์' }, { status: 403 });
  const id = await workId(ctx);
  const res = id ? await prisma.activity.updateMany({ where: { id, deletedAt: null }, data: { deletedAt: new Date(), isPublished: false } }) : { count: 0 };
  if (!res.count) return NextResponse.json({ error: 'ไม่พบงาน' }, { status: 404 });
  return NextResponse.json({ ok: true });
}
