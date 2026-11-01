import bcrypt from 'bcryptjs';
import { NextRequest, NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs/promises';
import { randomUUID } from 'crypto';
import prisma from '@/app/lib/prisma';
import { notifyAdminsOfSignup } from '@/app/lib/mailer';

// อนุญาตเฉพาะชนิดรูปที่รู้จัก และ "ตั้งนามสกุลเอง" จาก MIME type
// ห้ามใช้นามสกุลจากชื่อไฟล์ของผู้ใช้ เพราะอัปโหลด .svg/.html เข้ามาแล้วกลายเป็น stored XSS บนโดเมนตัวเองได้
const ALLOWED_IMAGE_TYPES: Record<string, string> = {
  'image/jpeg': '.jpg',
  'image/png': '.png',
  'image/webp': '.webp',
};
const MAX_IMAGE_BYTES = 2 * 1024 * 1024; // 2MB
const MIN_PASSWORD_LENGTH = 8;

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const firstName = String(formData.get('firstName') ?? '').trim();
    const lastName = String(formData.get('lastName') ?? '').trim();
    // เก็บอีเมลตัวพิมพ์เล็กเสมอ — ให้ตรงกับบัญชีที่สร้างจาก Google (signIn callback ทำแบบเดียวกัน)
    const email = String(formData.get('email') ?? '').trim().toLowerCase();
    const password = formData.get('password') as string;
    const image = formData.get('image') as File | null;

    if (!firstName || !lastName) {
      return new NextResponse(JSON.stringify({ error: 'กรุณากรอกชื่อและนามสกุล' }), { status: 400 });
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return new NextResponse(JSON.stringify({ error: 'รูปแบบอีเมลไม่ถูกต้อง' }), { status: 400 });
    }

    // Check if user with the same email already exists
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return new NextResponse(JSON.stringify({ error: 'มีอีเมลนี้แล้วในระบบ' }), { status: 400 });
    }

    // Validate password strength
    if (!password || password.length < MIN_PASSWORD_LENGTH) {
      return new NextResponse(JSON.stringify({ error: `รหัสผ่านต้องมีความยาวอย่างน้อย ${MIN_PASSWORD_LENGTH} ตัวอักษร` }), { status: 400 });
    }

    // Hash the password
    const hashedPassword = bcrypt.hashSync(password, 10);

    let imagePath = '';
    if (image && image.size > 0) {
      const fileExtension = ALLOWED_IMAGE_TYPES[image.type];
      if (!fileExtension) {
        return new NextResponse(JSON.stringify({ error: 'รองรับเฉพาะไฟล์รูป JPG, PNG หรือ WebP' }), { status: 400 });
      }
      if (image.size > MAX_IMAGE_BYTES) {
        return new NextResponse(JSON.stringify({ error: 'ไฟล์รูปต้องมีขนาดไม่เกิน 2MB' }), { status: 400 });
      }

      const bufferData = Buffer.from(await image.arrayBuffer());
      const fileName = `${Date.now()}-${randomUUID()}${fileExtension}`;
      const imageDir = path.join(process.cwd(), 'public/img');
      // public/img อยู่ใน .gitignore — เครื่องที่ clone/deploy ใหม่จะยังไม่มีโฟลเดอร์นี้
      await fs.mkdir(imageDir, { recursive: true });
      await fs.writeFile(path.join(imageDir, fileName), bufferData);
      imagePath = `/img/${fileName}`;
    }

    // สมัครใหม่ = PENDING รอแอดมินอนุมัติ (ระบุชัดแม้ DB default จะเป็น PENDING อยู่แล้ว)
    const newUser = await prisma.user.create({
      data: {
        firstName,
        lastName,
        email,
        password: hashedPassword,
        image: imagePath || null,
        role: 'PENDING',
      },
    });

    // แจ้งแอดมิน (ไม่ await — ส่งเมลพลาดต้องไม่ทำให้การสมัครล้ม)
    void notifyAdminsOfSignup({ firstName, lastName, email, via: 'form' });

    return new NextResponse(
      JSON.stringify({ message: 'สมัครสมาชิกสำเร็จ รอผู้ดูแลระบบอนุมัติ', userId: newUser.id }),
      { status: 200 },
    );
  } catch (error) {
    console.error('Error creating user:', error);
    return new NextResponse(JSON.stringify({ error: 'ไม่สามารถสร้างบัญชีผู้ใช้ได้ โปรดลองอีกครั้ง' }), { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const userCount = await prisma.user.count();
    return new NextResponse(JSON.stringify({ userCount }), { status: 200 });
  } catch (error) {
    console.error('Error fetching user count:', error);
    return new NextResponse(JSON.stringify({ error: 'ไม่สามารถดึงจำนวนผู้ใช้ได้' }), { status: 500 });
  }
}