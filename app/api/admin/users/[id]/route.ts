// app/api/admin/users/[id]/route.ts — จัดการผู้ใช้รายคน
// PATCH  { role } : อนุมัติ PENDING → MEMBER ได้ทั้ง ADMIN/SUPER_ADMIN · เปลี่ยน role แบบอื่นทั้งหมดเฉพาะ SUPER_ADMIN
// DELETE          : ปฏิเสธบัญชี = ลบ ได้เฉพาะ role PENDING (บัญชีที่อนุมัติแล้วห้ามลบที่นี่)
import { NextRequest, NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs/promises';
import { Prisma } from '@prisma/client';
import prisma from '@/app/lib/prisma';
import { getAdminUser } from '@/app/lib/adminAuth';

// role ที่ตั้งให้ได้ — ตั้งกลับเป็น PENDING ไม่ได้
const ASSIGNABLE_ROLES = ['MEMBER', 'ADMIN', 'SUPER_ADMIN'] as const;
type AssignableRole = (typeof ASSIGNABLE_ROLES)[number];

const PUBLIC_FIELDS = { id: true, firstName: true, lastName: true, email: true, role: true } as const;

function parseId(raw: string) {
  const id = Number(raw);
  return Number.isInteger(id) && id > 0 ? id : null;
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const admin = await getAdminUser();
  if (!admin) return NextResponse.json({ error: 'เฉพาะผู้ดูแลระบบ' }, { status: 403 });

  const id = parseId((await params).id);
  if (!id) return NextResponse.json({ error: 'ไม่พบผู้ใช้' }, { status: 404 });

  const body = await request.json().catch(() => null);
  const role = body?.role as AssignableRole | undefined;
  if (!role || !ASSIGNABLE_ROLES.includes(role)) {
    return NextResponse.json({ error: 'role ไม่ถูกต้อง' }, { status: 400 });
  }

  const target = await prisma.user.findUnique({ where: { id }, select: { id: true, role: true } });
  if (!target) return NextResponse.json({ error: 'ไม่พบผู้ใช้' }, { status: 404 });

  if (target.id === admin.id) {
    // กัน SUPER_ADMIN คนสุดท้ายลดสิทธิ์ตัวเองจนไม่มีใครจัดการระบบได้
    return NextResponse.json({ error: 'เปลี่ยน role ของตัวเองไม่ได้' }, { status: 400 });
  }

  const isApproval = target.role === 'PENDING' && role === 'MEMBER';
  if (!isApproval && admin.role !== 'SUPER_ADMIN') {
    return NextResponse.json({ error: 'เปลี่ยน role ได้เฉพาะผู้ดูแลสูงสุด (SUPER_ADMIN)' }, { status: 403 });
  }

  try {
    if (isApproval) {
      // อัปเดตเฉพาะที่ยังเป็น PENDING — ถ้า SUPER_ADMIN เพิ่งเลื่อนเป็น ADMIN ไปก่อน ห้ามกด "อนุมัติ" แล้วกลายเป็นลดสิทธิ์
      const { count } = await prisma.user.updateMany({ where: { id, role: 'PENDING' }, data: { role } });
      if (count === 0) return NextResponse.json({ error: 'บัญชีนี้ไม่ได้รออนุมัติแล้ว' }, { status: 409 });
      const user = await prisma.user.findUnique({ where: { id }, select: PUBLIC_FIELDS });
      return NextResponse.json({ message: 'อนุมัติบัญชีแล้ว', user });
    }
    const user = await prisma.user.update({ where: { id }, data: { role }, select: PUBLIC_FIELDS });
    return NextResponse.json({ message: 'เปลี่ยน role แล้ว', user });
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2025') {
      return NextResponse.json({ error: 'ไม่พบผู้ใช้' }, { status: 404 });
    }
    console.error('Error updating user role:', err);
    return NextResponse.json({ error: 'ไม่สามารถบันทึกได้' }, { status: 500 });
  }
}

export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const admin = await getAdminUser();
  if (!admin) return NextResponse.json({ error: 'เฉพาะผู้ดูแลระบบ' }, { status: 403 });

  const id = parseId((await params).id);
  if (!id) return NextResponse.json({ error: 'ไม่พบผู้ใช้' }, { status: 404 });

  const user = await prisma.user.findUnique({ where: { id }, select: { role: true, image: true } });
  if (!user) return NextResponse.json({ error: 'ไม่พบผู้ใช้' }, { status: 404 });
  if (user.role !== 'PENDING') {
    return NextResponse.json({ error: 'ปฏิเสธได้เฉพาะบัญชีที่รออนุมัติ' }, { status: 400 });
  }

  try {
    // deleteMany + role: 'PENDING' — ถ้ามีแอดมินอีกคนอนุมัติไปก่อนหน้าเสี้ยววินาที จะไม่ลบบัญชีที่อนุมัติแล้ว
    const { count } = await prisma.user.deleteMany({ where: { id, role: 'PENDING' } });
    if (count === 0) return NextResponse.json({ error: 'บัญชีนี้ไม่ได้รออนุมัติแล้ว' }, { status: 409 });
  } catch (err) {
    // ตารางอื่นที่จะผูกกับ User ในอนาคต (FK) — ลบไม่ได้ ต้องไม่ลบข้อมูลงานทิ้ง
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2003') {
      return NextResponse.json({ error: 'บัญชีนี้มีข้อมูลผูกอยู่ ลบไม่ได้' }, { status: 400 });
    }
    console.error('Error deleting user:', err);
    return NextResponse.json({ error: 'ไม่สามารถลบบัญชีได้' }, { status: 500 });
  }

  // รูปที่อัปตอนสมัคร (public/img/) — ลบตามไป ไม่ให้ไฟล์ค้าง · รูปจาก Google เป็น URL ภายนอก ไม่แตะ
  // ค่าใน DB ห้ามพาออกนอกโฟลเดอร์นี้ได้ (เช็คแบบเดียวกับ /api/auth/signup/[id])
  const img = user.image;
  if (img && img.startsWith('/img/') && path.basename(img) === img.slice('/img/'.length)) {
    await fs.unlink(path.join(process.cwd(), 'public/img', path.basename(img))).catch(() => {});
  }

  return NextResponse.json({ message: 'ปฏิเสธบัญชีแล้ว' });
}
