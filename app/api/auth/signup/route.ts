import bcrypt from 'bcryptjs';
import { NextRequest, NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs/promises';
import { randomUUID } from 'crypto';
import prisma from '@/app/lib/prisma';

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
    const firstName = formData.get('firstName') as string;
    const lastName = formData.get('lastName') as string;
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    const image = formData.get('image') as File | null;

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
      const imageSavePath = path.join(process.cwd(), 'public/img', fileName);

      await fs.writeFile(imageSavePath, bufferData);
      imagePath = `/img/${fileName}`;
    }

    // Create the new user
    const newUser = await prisma.user.create({
      data: {
        firstName,
        lastName,
        email,
        password: hashedPassword,
        image: imagePath || null,
      },
    });

    // Return success response
    return new NextResponse(JSON.stringify({ message: 'ลงทะเบียนสำเร็จ', userId: newUser.id }), { status: 200 });
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