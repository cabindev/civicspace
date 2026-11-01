// app/lib/configs/auth/authOptions.ts
import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import GoogleProvider from 'next-auth/providers/google';
import { User as PrismaUser } from '@prisma/client';
import bcrypt from "bcryptjs";
import prisma from '@/app/lib/prisma';
import { notifyAdminsOfSignup } from '@/app/lib/mailer';

interface Credentials {
  email: string;
  password: string;
}

declare module 'next-auth' {
  interface Session {
    user: {
      id: number;
      firstName: string;
      lastName: string;
      email: string;
      role: string;
      image?: string;
    };
  }

  interface User {
    id: number;
    role: string;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: number;
    firstName: string;
    lastName: string;
    role: string;
    picture?: string;
  }
}
const authOptions: NextAuthOptions = {
  // ไม่ใช้ PrismaAdapter — schema ไม่มีตาราง Account/Session/VerificationToken
  // ถ้าใส่ adapter คู่กับ Google provider การล็อกอินจะพัง จึง find-or-create User เองใน callbacks.signIn
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email', placeholder: 'john@doe.com' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials: Credentials | undefined) {
        if (!credentials) return null;

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });

        if (!user) {
          throw new Error('No user found with this email');
        }

        if (!user.password) {
          throw new Error('Invalid password');
        }

        const isValidPassword = await bcrypt.compare(credentials.password, user.password);

        if (!isValidPassword) {
          throw new Error('Invalid password');
        }

        return {
          id: user.id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          role: user.role,
          image: user.image,
        };
      },
    }),
  ],
  session: {
    strategy: 'jwt',
    // อายุ session 1 วัน (เดิมใช้ค่า default ของ NextAuth คือ 30 วัน)
    // สั้นลงเพื่อจำกัดเวลาที่สิทธิ์เก่าค้างอยู่ใน JWT หลังถูกถอด role หรือถูกลบบัญชี
    maxAge: 24 * 60 * 60,
  },
  // error ของ OAuth (เช่น AccessDenied เมื่ออีเมล Google ยังไม่ยืนยัน) กลับมาหน้านี้พร้อม ?error=
  // ต้องตั้ง error ด้วย ไม่งั้น AccessDenied ไปหน้า error ภาษาอังกฤษของ NextAuth
  pages: {
    signIn: '/auth/signin',
    error: '/auth/signin',
  },
  callbacks: {
    // ล็อกอินด้วย Google:
    // - อีเมลตรงกับบัญชีเดิม (สมัครด้วยรหัสผ่านหรือ Google มาก่อน) = เข้าบัญชีเดิม ไม่แตะรหัสผ่าน/role/ชื่อ
    // - อีเมลใหม่ = สร้างบัญชี role PENDING รอแอดมินอนุมัติ — ไม่มีอีเมลไหนได้สิทธิ์อัตโนมัติ
    signIn: async ({ user, account, profile }) => {
      if (account?.provider !== 'google') return true;

      const g = profile as
        | { email?: string; email_verified?: boolean; given_name?: string; family_name?: string }
        | undefined;
      const email = (g?.email ?? user.email)?.trim().toLowerCase();
      // Google ยืนยันอีเมลแล้วเท่านั้น — ไม่งั้นใครก็ผูกอีเมลคนอื่นเข้าบัญชีเดิมได้
      if (!email || g?.email_verified !== true) return false;

      const [first, ...rest] = (user.name ?? email.split('@')[0]).trim().split(/\s+/);
      const existing = await prisma.user.findUnique({ where: { email } });
      const dbUser = existing
        ? await prisma.user.update({
            where: { id: existing.id },
            // เติมเฉพาะที่ยังว่าง — ไม่ทับรูปที่ผู้ใช้ตั้งเองในหน้าแก้ไขโปรไฟล์
            data: {
              emailVerified: existing.emailVerified ?? new Date(),
              ...(!existing.image && user.image ? { image: user.image } : {}),
            },
          })
        : await prisma.user.create({
            data: {
              email,
              firstName: g?.given_name || first,
              lastName: g?.family_name || rest.join(' '),
              image: user.image ?? null,
              role: 'PENDING',
              emailVerified: new Date(),
            },
          });

      // บัญชีใหม่ → แจ้งแอดมินให้อนุมัติ (ไม่ await — ไม่ให้การล็อกอินช้า, ส่งพลาดก็ไม่ล้ม)
      if (!existing) {
        void notifyAdminsOfSignup({ firstName: dbUser.firstName, lastName: dbUser.lastName, email, via: 'google' });
      }

      // ส่งค่าจาก DB ต่อให้ jwt callback — id ของ Google เป็น string ต้องแทนด้วย id ของเรา
      // (ไม่มี adapter: NextAuth ส่ง object เดียวกันนี้เป็น `user` ของ jwt callback)
      Object.assign(user, {
        id: dbUser.id,
        firstName: dbUser.firstName,
        lastName: dbUser.lastName,
        role: dbUser.role,
        image: dbUser.image,
      });
      return true;
    },
    jwt: async ({ token, user, trigger }) => {
      if (user) {
        token.id = (user as PrismaUser).id;
        token.firstName = (user as PrismaUser).firstName;
        token.lastName = (user as PrismaUser).lastName;
        token.role = (user as PrismaUser).role;
        token.picture = user.image ?? undefined;
      }
      // รออนุมัติอยู่ หรือผู้ใช้กดรีเฟรช session (update()) → อ่าน role ล่าสุดจาก DB
      // แอดมินอนุมัติแล้วใช้ได้ทันทีโดยไม่ต้องออกจากระบบ · ผู้ใช้ปกติไม่ต้อง query เพิ่ม
      if ((token.role === 'PENDING' || trigger === 'update') && token.id) {
        const fresh = await prisma.user.findUnique({ where: { id: Number(token.id) }, select: { role: true } });
        if (fresh) token.role = fresh.role;
      }
      return token;
    },
    session: async ({ session, token }) => {
      if (session.user) {
        session.user.id = token.id;
        session.user.firstName = token.firstName;
        session.user.lastName = token.lastName;
        session.user.role = token.role;
        session.user.image = token.picture;
      }
      return session;
    },
    // ปล่อยให้ relative path และ URL ที่อยู่โดเมนเดียวกันผ่านได้
    // ส่วน URL ภายนอกให้ตกกลับมาที่ baseUrl เพื่อกัน open redirect
    // (พฤติกรรมเดียวกับ default ของ NextAuth — จำเป็นต่อ callbackUrl ของ signIn/signOut)
    async redirect({ url, baseUrl }) {
      if (url.startsWith('/')) return `${baseUrl}${url}`;
      if (new URL(url).origin === baseUrl) return url;
      return baseUrl;
    },
  },
};

export default authOptions;
