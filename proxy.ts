// proxy.ts (Next.js 16: เปลี่ยนชื่อจาก middleware.ts)
import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { isAdminRole } from '@/app/lib/roles';

// ล็อกอินแล้วไม่ต้องเห็นหน้าเข้าสู่ระบบ / สมัครสมาชิกอีก → พาไปหน้าแรก
const GUEST_ONLY = ['/auth/signin', '/auth/form_signup'];

// หน้าภายในที่ต้องเป็นบัญชีที่อนุมัติแล้ว (PENDING เข้าไม่ได้)
const STAFF_ONLY_PREFIXES = ['/datatable'];

function redirectToSignIn(request: NextRequest) {
  // เก็บหน้าที่ผู้ใช้ตั้งใจจะเข้าไว้ เพื่อพากลับมาหลังล็อกอินสำเร็จ
  // เก็บเป็น relative path เท่านั้น เพื่อไม่ให้ถูกใช้เป็น open redirect
  const signInUrl = new URL('/auth/signin', request.url);
  signInUrl.searchParams.set('callbackUrl', request.nextUrl.pathname + request.nextUrl.search);
  return NextResponse.redirect(signInUrl);
}

export async function proxy(request: NextRequest) {
  const user = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  });

  const { pathname } = request.nextUrl;

  if (user && GUEST_ONLY.includes(pathname)) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  const isDashboard = pathname === '/dashboard' || pathname.startsWith('/dashboard/');
  const isStaffOnly = STAFF_ONLY_PREFIXES.some((p) => pathname === p || pathname.startsWith(`${p}/`));

  if (isDashboard || isStaffOnly) {
    if (!user) return redirectToSignIn(request);

    // บัญชีรออนุมัติ → หน้าแจ้งรออนุมัติ
    // (role ใน cookie อาจค้าง PENDING ชั่วครู่หลังอนุมัติ — หน้า /auth/pending เช็คจาก DB แล้วมีปุ่มรีเฟรช session)
    if (user.role === 'PENDING') {
      return NextResponse.redirect(new URL('/auth/pending', request.url));
    }

    // แดชบอร์ดเฉพาะ ADMIN / SUPER_ADMIN — MEMBER กลับหน้าแรก
    if (isDashboard && !isAdminRole(user.role)) {
      return NextResponse.redirect(new URL('/', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/auth/signin', '/auth/form_signup', '/dashboard/:path*', '/datatable/:path*'],
};
