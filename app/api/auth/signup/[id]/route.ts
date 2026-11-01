import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { writeFile, unlink } from 'fs/promises';
import path from 'path';
import { randomUUID } from 'crypto';
import prisma from '@/app/lib/prisma';
import authOptions from '@/app/lib/configs/auth/authOptions';

// ใช้ชุดเดียวกับ /api/auth/signup — ตั้งนามสกุลจาก MIME type เอง ไม่เชื่อชื่อไฟล์ของผู้ใช้ (กัน .svg/.html เป็น stored XSS)
const ALLOWED_IMAGE_TYPES: Record<string, string> = {
  'image/jpeg': '.jpg',
  'image/png': '.png',
  'image/webp': '.webp',
};
const MAX_IMAGE_BYTES = 2 * 1024 * 1024; // 2MB

// คืนเฉพาะฟิลด์ที่หน้าแก้ไขโปรไฟล์ใช้ — ห้ามส่ง password / resetToken ออกไปเด็ดขาด
const PUBLIC_FIELDS = { id: true, firstName: true, lastName: true, email: true, image: true } as const;

// แก้ได้เฉพาะบัญชีตัวเอง หรือแอดมิน
async function authorize(id: number) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: 'กรุณาเข้าสู่ระบบ' }, { status: 401 });
  const isAdmin = session.user.role === 'ADMIN' || session.user.role === 'SUPER_ADMIN';
  if (session.user.id !== id && !isAdmin) {
    return NextResponse.json({ error: 'ไม่มีสิทธิ์เข้าถึงบัญชีนี้' }, { status: 403 });
  }
  return null;
}

function parseId(raw: string) {
  const id = Number(raw);
  return Number.isInteger(id) && id > 0 ? id : null;
}

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const id = parseId((await params).id);
  if (!id) return NextResponse.json({ error: 'ไม่พบผู้ใช้' }, { status: 404 });

  const denied = await authorize(id);
  if (denied) return denied;

  try {
    const user = await prisma.user.findUnique({ where: { id }, select: PUBLIC_FIELDS });
    if (!user) return NextResponse.json({ error: 'ไม่พบผู้ใช้' }, { status: 404 });
    return NextResponse.json(user);
  } catch (err) {
    console.error('Error fetching user:', err);
    return NextResponse.json({ error: 'ไม่สามารถดึงข้อมูลผู้ใช้ได้' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const id = parseId((await params).id);
  if (!id) return NextResponse.json({ error: 'ไม่พบผู้ใช้' }, { status: 404 });

  const denied = await authorize(id);
  if (denied) return denied;

  try {
    const formData = await req.formData();
    const firstName = String(formData.get('firstName') ?? '').trim();
    const lastName = String(formData.get('lastName') ?? '').trim();
    const image = formData.get('image');

    if (!firstName || !lastName) {
      return NextResponse.json({ error: 'กรุณากรอกชื่อและนามสกุล' }, { status: 400 });
    }

    const existingUser = await prisma.user.findUnique({ where: { id }, select: { image: true } });
    if (!existingUser) return NextResponse.json({ error: 'ไม่พบผู้ใช้' }, { status: 404 });

    let imageUrl: string | undefined;
    if (image instanceof File && image.size > 0) {
      const fileExtension = ALLOWED_IMAGE_TYPES[image.type];
      if (!fileExtension) {
        return NextResponse.json({ error: 'รองรับเฉพาะไฟล์รูป JPG, PNG หรือ WebP' }, { status: 400 });
      }
      if (image.size > MAX_IMAGE_BYTES) {
        return NextResponse.json({ error: 'ไฟล์รูปต้องมีขนาดไม่เกิน 2MB' }, { status: 400 });
      }

      const fileName = `${Date.now()}-${randomUUID()}${fileExtension}`;
      await writeFile(path.join(process.cwd(), 'public/img', fileName), Buffer.from(await image.arrayBuffer()));
      imageUrl = `/img/${fileName}`;

      // ลบรูปเก่าเฉพาะที่อยู่ใน /img/ ของเราเอง — ค่าใน DB ห้ามพาออกนอกโฟลเดอร์นี้ได้
      const old = existingUser.image;
      if (old && old.startsWith('/img/') && path.basename(old) === old.slice('/img/'.length)) {
        await unlink(path.join(process.cwd(), 'public/img', path.basename(old))).catch((err) =>
          console.error('Failed to delete old image:', err),
        );
      }
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: { firstName, lastName, ...(imageUrl && { image: imageUrl }) },
      select: PUBLIC_FIELDS,
    });

    return NextResponse.json(updatedUser);
  } catch (err) {
    console.error('Error updating user:', err);
    return NextResponse.json({ error: 'ไม่สามารถบันทึกข้อมูลได้' }, { status: 500 });
  }
}
