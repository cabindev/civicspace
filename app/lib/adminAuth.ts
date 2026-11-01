// app/lib/adminAuth.ts — ตรวจสิทธิ์แอดมินสำหรับ API ฝั่งจัดการระบบ
// อ่าน role จากฐานข้อมูลทุกครั้ง ไม่เชื่อ role ใน JWT (อาจค้างได้ถึงอายุ session หลังถูกลดสิทธิ์)
import { getServerSession } from 'next-auth';
import authOptions from '@/app/lib/configs/auth/authOptions';
import prisma from '@/app/lib/prisma';
import { isAdminRole } from '@/app/lib/roles';

// คืน { id, role } ของผู้ใช้ปัจจุบันถ้าเป็น ADMIN/SUPER_ADMIN — ไม่งั้นคืน null
export async function getAdminUser() {
  const session = await getServerSession(authOptions);
  const id = Number(session?.user?.id);
  if (!Number.isInteger(id) || id <= 0) return null;

  const user = await prisma.user.findUnique({ where: { id }, select: { id: true, role: true } });
  if (!user || !isAdminRole(user.role)) return null;
  return user;
}
