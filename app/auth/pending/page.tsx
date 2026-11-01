// app/auth/pending/page.tsx — แจ้งบัญชีรอผู้ดูแลระบบอนุมัติ (role PENDING)
// อ่าน role จาก DB ไม่ใช่จาก cookie — cookie อาจยังเป็น PENDING หลังอนุมัติ จึงมีปุ่มรีเฟรช session
import type { Metadata } from 'next';
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Clock, CheckCircle2, XCircle } from 'lucide-react';
import authOptions from '@/app/lib/configs/auth/authOptions';
import prisma from '@/app/lib/prisma';
import { isAdminRole, isStaffRole } from '@/app/lib/roles';
import { RefreshSessionButton, SignOutButton } from './PendingActions';

export const metadata: Metadata = {
  title: 'รออนุมัติบัญชี — CivicSpace',
  robots: { index: false, follow: false },
};

export default async function PendingPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect('/auth/signin');

  const user = await prisma.user.findUnique({
    where: { id: Number(session.user.id) },
    select: { id: true, role: true, email: true },
  });
  // หมายเหตุ: ห้าม redirect คนที่อนุมัติแล้วออกจากหน้านี้ฝั่ง server — getServerSession อ่าน role ใหม่จาก DB
  // แต่ Server Component เขียน cookie ไม่ได้ cookie จึงยังเป็น PENDING แล้ว proxy จะเด้งกลับมา (วนไม่จบ)
  // ต้องให้ผู้ใช้กด RefreshSessionButton เพื่อเรียก update() ผ่าน /api/auth/session ซึ่งเขียน cookie ใหม่ได้

  return (
    <div className="min-h-screen flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <Link href="/" className="w-16 h-16 flex items-center justify-center bg-white rounded-full shadow-sm">
            <Image src="/Civic-Spacelogo.png" alt="CivicSpace Logo" width={40} height={40} className="w-auto h-auto max-w-10 max-h-10" />
          </Link>
        </div>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow-sm sm:rounded-lg sm:px-10 border border-gray-200 text-center">
          {!user ? (
            // บัญชีถูกปฏิเสธ (ลบแล้ว) แต่ cookie ยังอยู่
            <>
              <XCircle className="w-10 h-10 text-gray-700 mx-auto" />
              <h1 className="mt-4 text-lg font-semibold text-gray-900">ไม่พบบัญชีนี้ในระบบ</h1>
              <p className="mt-2 text-sm text-gray-600 leading-relaxed">
                บัญชีอาจไม่ได้รับอนุมัติจากผู้ดูแลระบบ หากคิดว่าผิดพลาด โปรดติดต่อผู้ดูแลระบบ
              </p>
              <div className="mt-6 flex justify-center">
                <SignOutButton />
              </div>
            </>
          ) : isStaffRole(user.role) ? (
            <>
              <CheckCircle2 className="w-10 h-10 text-amber-500 mx-auto" />
              <h1 className="mt-4 text-lg font-semibold text-gray-900">บัญชีได้รับอนุมัติแล้ว</h1>
              <p className="mt-2 text-sm text-gray-600">เข้าใช้งานส่วนของเจ้าหน้าที่ได้แล้ว</p>
              <div className="mt-6 flex justify-center">
                <RefreshSessionButton to={isAdminRole(user.role) ? '/dashboard' : '/'} />
              </div>
            </>
          ) : (
            <>
              <Clock className="w-10 h-10 text-amber-500 mx-auto" />
              <h1 className="mt-4 text-lg font-semibold text-gray-900">บัญชีรอผู้ดูแลระบบอนุมัติ</h1>
              <p className="mt-2 text-sm text-gray-600 leading-relaxed">
                บัญชี <span className="font-medium text-gray-900">{user.email}</span> สมัครเรียบร้อยแล้ว
                เมื่อผู้ดูแลระบบอนุมัติ คุณจะเข้าใช้งานส่วนของเจ้าหน้าที่ได้
                ระหว่างนี้ดูโพสต์ วิดีโอ และแบบสำรวจที่เผยแพร่ได้ตามปกติ
              </p>
              <div className="mt-6 flex flex-wrap justify-center gap-2">
                <Link href="/" className="px-4 py-2 rounded-md bg-gray-900 text-white text-sm font-medium hover:bg-black">
                  ไปหน้าแรก
                </Link>
                <Link
                  href={`/auth/form_signup/edit/${user.id}`}
                  className="px-4 py-2 rounded-md border border-gray-300 text-gray-900 text-sm font-medium hover:bg-gray-50"
                >
                  แก้ไขโปรไฟล์
                </Link>
                <SignOutButton />
              </div>
              <p className="mt-4 text-xs text-gray-500">อนุมัติแล้วกลับมาหน้านี้ จะมีปุ่มเข้าใช้งานให้ทันที</p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
