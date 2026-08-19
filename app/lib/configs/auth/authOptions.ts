// app/lib/configs/auth/authOptions.ts
import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { User as PrismaUser } from '@prisma/client';
import bcrypt from "bcryptjs";
import { PrismaAdapter } from '@next-auth/prisma-adapter';
import prisma from '@/app/lib/prisma';

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
  providers: [
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
  adapter: PrismaAdapter(prisma),
  session: {
    strategy: 'jwt',
    // อายุ session 1 วัน (เดิมใช้ค่า default ของ NextAuth คือ 30 วัน)
    // สั้นลงเพื่อจำกัดเวลาที่สิทธิ์เก่าค้างอยู่ใน JWT หลังถูกถอด role หรือถูกลบบัญชี
    maxAge: 24 * 60 * 60,
  },
  callbacks: {
    jwt: async ({ token, user }) => {
      if (user) {
        token.id = (user as PrismaUser).id;
        token.firstName = (user as PrismaUser).firstName;
        token.lastName = (user as PrismaUser).lastName;
        token.role = (user as PrismaUser).role;
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
