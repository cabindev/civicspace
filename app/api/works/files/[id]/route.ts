// app/api/works/files/[id]/route.ts — เปิดไฟล์แนบของผลงาน (ไฟล์จริงอยู่ใน uploads/ นอก public/)
// คนทั่วไป: เฉพาะไฟล์ isPublic ของงานที่เผยแพร่แล้ว · เจ้าหน้าที่: ทุกไฟล์ (ใช้ตรวจก่อนเผยแพร่)
// อ้างด้วย id ของไฟล์ ไม่ใช่ path → เดาไฟล์อื่นไม่ได้
import { NextRequest, NextResponse } from 'next/server';
import fs from 'node:fs/promises';
import prisma from '@/app/lib/prisma';
import { getStaffUser } from '@/app/lib/adminAuth';
import { resolveUpload } from '@/app/lib/workFiles';

const NO_STORE = { 'Cache-Control': 'no-store' };

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const id = Number((await params).id);
  if (!Number.isInteger(id) || id <= 0) return new NextResponse(null, { status: 404, headers: NO_STORE });

  const file = await prisma.activityAttachment.findUnique({
    where: { id },
    select: { filePath: true, mimeType: true, fileName: true, isPublic: true, activity: { select: { isPublished: true, deletedAt: true } } },
  });
  if (!file || file.activity.deletedAt) return new NextResponse(null, { status: 404, headers: NO_STORE });

  const isPublicFile = file.isPublic && file.activity.isPublished;
  // ไฟล์ภายในตอบ 404 (ไม่ใช่ 403) ให้คนทั่วไป — ไม่บอกว่ามีไฟล์อยู่
  if (!isPublicFile && !(await getStaffUser())) return new NextResponse(null, { status: 404, headers: NO_STORE });

  const abs = resolveUpload(file.filePath);
  if (!abs) return new NextResponse(null, { status: 404, headers: NO_STORE });

  try {
    const buf = await fs.readFile(abs);
    return new NextResponse(new Uint8Array(buf), {
      headers: {
        'Content-Type': file.mimeType,
        // เอกสารเปิดในแท็บด้วยชื่อเดิม (ชื่อไทยต้อง encode)
        'Content-Disposition': `inline; filename*=UTF-8''${encodeURIComponent(file.fileName)}`,
        // ไฟล์ภายในห้ามแคชที่ CDN/เบราว์เซอร์ที่ใช้ร่วมกัน
        'Cache-Control': isPublicFile ? 'public, max-age=86400' : 'private, no-store',
        'X-Content-Type-Options': 'nosniff',
      },
    });
  } catch {
    return new NextResponse(null, { status: 404, headers: NO_STORE });
  }
}
