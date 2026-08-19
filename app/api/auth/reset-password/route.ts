import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import prisma from '@/app/lib/prisma';

const MIN_PASSWORD_LENGTH = 8;

export async function POST(req: NextRequest) {
  try {
    const { token, password } = await req.json();

    // reset token ใช้เปลี่ยนรหัสผ่านได้จริง จึงต้องไม่ถูก log ลงที่ใดทั้งสิ้น
    if (!password || password.length < MIN_PASSWORD_LENGTH) {
      return NextResponse.json(
        { error: `รหัสผ่านต้องมีความยาวอย่างน้อย ${MIN_PASSWORD_LENGTH} ตัวอักษร` },
        { status: 400 }
      );
    }

    const user = await prisma.user.findFirst({
      where: {
        resetToken: token,
        resetTokenExpiresAt: { gt: new Date() },
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'รหัสยืนยันไม่ถูกต้องหรือหมดอายุแล้ว' }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        resetToken: null,
        resetTokenCreatedAt: null,
        resetTokenExpiresAt: null,
        lastPasswordReset: new Date(),
      },
    });

    if (updatedUser) {
      return NextResponse.json({ message: 'รีเซ็ตรหัสผ่านสำเร็จ' });
    } else {
      return NextResponse.json({ error: 'ไม่สามารถอัพเดทรหัสผ่านได้' }, { status: 500 });
    }
  } catch (error) {
    console.error('Error resetting password:', error);
    return NextResponse.json({ error: 'เกิดข้อผิดพลาดในการรีเซ็ตรหัสผ่าน' }, { status: 500 });
  }
}