// proxy.ts (Next.js 16: เปลี่ยนชื่อจาก middleware.ts)
import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function proxy(request: NextRequest) {
  const user = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  });

  const { pathname } = request.nextUrl;

  // ถ้าผู้ใช้พยายามเข้าถึงหน้า dashboard
  if (pathname.startsWith('/dashboard')) {
    // ถ้าไม่มีผู้ใช้ (ไม่ได้ล็อกอิน) ให้ redirect ไปหน้า signin
    if (!user) {
      // เก็บหน้าที่ผู้ใช้ตั้งใจจะเข้าไว้ เพื่อพากลับมาหลังล็อกอินสำเร็จ
      // เก็บเป็น relative path เท่านั้น เพื่อไม่ให้ถูกใช้เป็น open redirect
      const signInUrl = new URL('/auth/signin', request.url);
      signInUrl.searchParams.set('callbackUrl', pathname + request.nextUrl.search);
      return NextResponse.redirect(signInUrl);
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