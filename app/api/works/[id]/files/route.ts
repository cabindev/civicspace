// app/api/works/[id]/files/route.ts — อัปโหลดไฟล์แนบของผลงาน (หลายไฟล์ต่อครั้ง) · เฉพาะแอดมิน (แดชบอร์ดเปิดให้ ADMIN/SUPER_ADMIN เท่านั้น — proxy.ts)
// ตรวจชนิดไฟล์จากเนื้อไฟล์จริง (JPG/PNG/WebP/PDF) ขนาดไม่เกิน 15 MB ต่อไฟล์ · ไฟล์ใหม่เริ่มเป็น "ไม่เผยแพร่" จนกว่าจะเปิดเอง
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/app/lib/prisma';
import { getAdminUser } from '@/app/lib/adminAuth';
import { ALLOWED_TYPES, MAX_FILE_BYTES, saveWorkFile, sniffType } from '@/app/lib/workFiles';

const MAX_FILES_PER_REQUEST = 20;

export async function POST(request: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  if (!(await getAdminUser())) return NextResponse.json({ error: 'ไม่มีสิทธิ์' }, { status: 403 });
  const id = Number((await ctx.params).id);
  const work = Number.isInteger(id) && id > 0 ? await prisma.activity.findFirst({ where: { id, deletedAt: null }, select: { id: true } }) : null;
  if (!work) return NextResponse.json({ error: 'ไม่พบงาน' }, { status: 404 });

  const form = await request.formData().catch(() => null);
  const files = (form?.getAll('files') ?? []).filter((f): f is File => f instanceof File && f.size > 0);
  if (!files.length) return NextResponse.json({ error: 'ไม่พบไฟล์' }, { status: 400 });
  if (files.length > MAX_FILES_PER_REQUEST) return NextResponse.json({ error: `อัปโหลดได้ครั้งละไม่เกิน ${MAX_FILES_PER_REQUEST} ไฟล์` }, { status: 400 });

  const hasCover = (await prisma.activityAttachment.count({ where: { activityId: work.id, isCover: true } })) > 0;
  const saved: number[] = [];
  const rejected: string[] = [];

  for (const file of files) {
    const name = file.name.slice(0, 200) || 'ไฟล์';
    if (file.size > MAX_FILE_BYTES) { rejected.push(`${name} (ใหญ่เกิน 15 MB)`); continue; }
    const buf = Buffer.from(await file.arrayBuffer());
    const type = sniffType(buf);
    if (!type || !ALLOWED_TYPES[type]) { rejected.push(`${name} (รองรับเฉพาะ JPG, PNG, WebP, PDF)`); continue; }
    const filePath = await saveWorkFile(work.id, buf, type);
    const row = await prisma.activityAttachment.create({
      data: {
        activityId: work.id,
        kind: ALLOWED_TYPES[type].kind,
        filePath,
        fileName: name,
        mimeType: type,
        size: buf.length,
        isPublic: false,
        // รูปแรกของงานที่ยังไม่มีปก เป็นปกให้เลย
        isCover: !hasCover && saved.length === 0 && ALLOWED_TYPES[type].kind === 'IMAGE',
      },
      select: { id: true },
    });
    saved.push(row.id);
  }

  return NextResponse.json({ saved, rejected }, { status: saved.length ? 201 : 400 });
}
