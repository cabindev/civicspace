// app/api/admin/users/route.ts — GET รายชื่อผู้ใช้ทั้งหมด + สถิติ (ADMIN / SUPER_ADMIN)
import { NextResponse } from 'next/server';
import prisma from '@/app/lib/prisma';
import { getAdminUser } from '@/app/lib/adminAuth';

export async function GET() {
  const admin = await getAdminUser();
  if (!admin) return NextResponse.json({ error: 'เฉพาะผู้ดูแลระบบ' }, { status: 403 });

  try {
    const rows = await prisma.user.findMany({
      // ห้ามส่ง password / resetToken ออกไป — เลือกเฉพาะฟิลด์ที่หน้าจัดการใช้
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        image: true,
        role: true,
        emailVerified: true,
        password: true, // ใช้คำนวณ hasPassword เท่านั้น ตัดทิ้งก่อนตอบ
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    const users = rows.map(({ password, ...u }) => ({ ...u, hasPassword: Boolean(password) }));

    const stats = {
      total: users.length,
      pending: users.filter((u) => u.role === 'PENDING').length,
      members: users.filter((u) => u.role === 'MEMBER').length,
      admins: users.filter((u) => u.role === 'ADMIN' || u.role === 'SUPER_ADMIN').length,
    };

    return NextResponse.json({ users, stats, me: admin });
  } catch (err) {
    console.error('Error fetching users:', err);
    return NextResponse.json({ error: 'ไม่สามารถดึงรายชื่อผู้ใช้ได้' }, { status: 500 });
  }
}
