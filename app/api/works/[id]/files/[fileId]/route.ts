// app/api/works/[id]/files/[fileId]/route.ts — แก้ไฟล์แนบ (เผยแพร่/ปก/คำบรรยาย) หรือลบ · เฉพาะแอดมิน (แดชบอร์ดเปิดให้ ADMIN/SUPER_ADMIN เท่านั้น — proxy.ts)
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/app/lib/prisma';
import { getAdminUser } from '@/app/lib/adminAuth';
import { removeWorkFile } from '@/app/lib/workFiles';

type Ctx = { params: Promise<{ id: string; fileId: string }> };

async function findFile(ctx: Ctx) {
  const p = await ctx.params;
  const activityId = Number(p.id);
  const id = Number(p.fileId);
  if (!Number.isInteger(activityId) || !Number.isInteger(id)) return null;
  // ต้องเป็นไฟล์ของงานนี้จริง — กันแก้ไฟล์ของงานอื่นด้วยการเปลี่ยนเลข
  return prisma.activityAttachment.findFirst({ where: { id, activityId }, select: { id: true, activityId: true, kind: true, filePath: true } });
}

export async function PATCH(request: NextRequest, ctx: Ctx) {
  if (!(await getAdminUser())) return NextResponse.json({ error: 'ไม่มีสิทธิ์' }, { status: 403 });
  const file = await findFile(ctx);
  if (!file) return NextResponse.json({ error: 'ไม่พบไฟล์' }, { status: 404 });
  const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;

  const data: { isPublic?: boolean; caption?: string | null; isCover?: boolean } = {};
  if (typeof body.isPublic === 'boolean') data.isPublic = body.isPublic;
  if (typeof body.caption === 'string') data.caption = body.caption.trim().slice(0, 300) || null;

  if (body.isCover === true) {
    if (file.kind !== 'IMAGE') return NextResponse.json({ error: 'ปกต้องเป็นรูปภาพ' }, { status: 400 });
    // ปกมีได้รูปเดียวต่องาน — และปกต้องเผยแพร่ ไม่งั้นการ์ดหน้าสาธารณะไม่มีรูป
    await prisma.$transaction([
      prisma.activityAttachment.updateMany({ where: { activityId: file.activityId, isCover: true }, data: { isCover: false } }),
      prisma.activityAttachment.update({ where: { id: file.id }, data: { ...data, isCover: true, isPublic: true } }),
    ]);
    return NextResponse.json({ ok: true });
  }

  await prisma.activityAttachment.update({ where: { id: file.id }, data });
  return NextResponse.json({ ok: true });
}

export async function DELETE(_req: NextRequest, ctx: Ctx) {
  if (!(await getAdminUser())) return NextResponse.json({ error: 'ไม่มีสิทธิ์' }, { status: 403 });
  const file = await findFile(ctx);
  if (!file) return NextResponse.json({ error: 'ไม่พบไฟล์' }, { status: 404 });
  await prisma.activityAttachment.delete({ where: { id: file.id } });
  await removeWorkFile(file.filePath);
  return NextResponse.json({ ok: true });
}
