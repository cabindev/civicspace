//app/api/profile/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import authOptions from '@/app/lib/configs/auth/authOptions';
import prisma from '@/app/lib/prisma';
import { writeFile, unlink } from 'fs/promises';
import path from 'path';
import { mkdir } from 'fs/promises';

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const formData = await req.formData();
  const firstName = formData.get('firstName') as string;
  const lastName = formData.get('lastName') as string;
  const image = formData.get('image') as File | null;

  let imageUrl: string | undefined;

  try {
    const existingUser = await prisma.user.findUnique({
      where: { id: Number(params.id) },
    });

    if (!existingUser || existingUser.email !== session.user.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // จัดการรูปภาพ
    if (image && image.size > 0) {
      const bytes = await image.arrayBuffer();
      const buffer = Buffer.from(bytes);

      // สร้างชื่อไฟล์ใหม่
      const timestamp = Date.now();
      const fileExtension = path.extname(image.name) || '.jpg';
      const filename = `profile-${timestamp}-${existingUser.id}${fileExtension}`;
      
      // กำหนด path ใหม่ไปที่ /uploads/profiles/
      const profilesDir = path.join(process.cwd(), 'public', 'uploads', 'profiles');
      const filepath = path.join(profilesDir, filename);
      
      // สร้างโฟลเดอร์ profiles ถ้ายังไม่มี
      try {
        await mkdir(profilesDir, { recursive: true });
      } catch (error) {
        // โฟลเดอร์มีอยู่แล้ว
      }

      // บันทึกไฟล์ใหม่
      await writeFile(filepath, buffer);
      imageUrl = `/uploads/profiles/${filename}`;

      // ลบรูปเก่า (ถ้ามี)
      if (existingUser.image) {
        let oldImagePath: string;
        
        // ตรวจสอบ path เก่าและลบ
        if (existingUser.image.startsWith('/uploads/profiles/')) {
          // รูปอยู่ใน profiles folder แล้ว
          oldImagePath = path.join(process.cwd(), 'public', existingUser.image);
        } else if (existingUser.image.startsWith('/uploads/')) {
          // รูปอยู่ใน uploads folder เก่า
          oldImagePath = path.join(process.cwd(), 'public', existingUser.image);
        } else {
          // กรณี path แปลกๆ ให้ลองลบใน uploads folder เก่า
          oldImagePath = path.join(process.cwd(), 'public', 'uploads', existingUser.image);
        }

        try {
          await unlink(oldImagePath);
          console.log('Old profile image deleted successfully:', oldImagePath);
        } catch (error) {
          console.log('Could not delete old image (may not exist):', oldImagePath);
        }
      }
    }

    // อัปเดตข้อมูลในฐานข้อมูล
    const updatedUser = await prisma.user.update({
      where: { id: Number(params.id) },
      data: {
        firstName: firstName?.trim(),
        lastName: lastName?.trim(),
        ...(imageUrl && { image: imageUrl }),
      },
    });

    // ส่งข้อมูลที่จำเป็นกลับไป
    return NextResponse.json({
      id: updatedUser.id,
      firstName: updatedUser.firstName,
      lastName: updatedUser.lastName,
      email: updatedUser.email,
      image: updatedUser.image,
      role: updatedUser.role,
    });

  } catch (error) {
    console.error('Error updating user profile:', error);
    return NextResponse.json({ 
      error: 'เกิดข้อผิดพลาดในการอัปเดตโปรไฟล์' 
    }, { status: 500 });
  }
}