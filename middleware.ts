//niddleware.ts
import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function middleware(request: NextRequest) {
  const user = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  });

  const { pathname } = request.nextUrl;

  // ถ้าผู้ใช้พยายามเข้าถึงหน้า dashboard
  if (pathname.startsWith('/dashboard')) {
    // ถ้าไม่มีผู้ใช้ (ไม่ได้ล็อกอิน) ให้ redirect ไปหน้า signin
    if (!user) {
      return NextResponse.redirect(new URL('/auth/signin', request.url));
    }
    
    // ถ้าผู้ใช้เป็น ADMIN หรือ SUPER_ADMIN ให้เข้าถึง dashboard ได้
    if (user.role === 'ADMIN' || user.role === 'SUPER_ADMIN') {
      return NextResponse.next();
    }
    
    // ถ้าผู้ใช้ไม่ใช่ ADMIN ให้ redirect ไปหน้าแรก
    return NextResponse.redirect(new URL('/', request.url));
  }

  // สำหรับเส้นทางอื่นๆ ให้ผ่านไปได้ตามปกติ
  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*'],
};