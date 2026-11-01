// app/lib/mailer.ts — ส่งอีเมลผ่าน Gmail SMTP (EMAIL_USER / EMAIL_PASS) ใช้ร่วมทั้งระบบ
import nodemailer from 'nodemailer';
import prisma from '@/app/lib/prisma';

export const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const esc = (v: string) =>
  v.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c] as string);

// บัญชีทดสอบไม่มีกล่องจดหมายจริง — ไม่ส่งไป
const isTestAddress = (email: string) => email.endsWith('@qa.local');

// มีคนสมัครใหม่ (role PENDING) → แจ้งแอดมินทุกคนให้เข้าไปอนุมัติ/ปฏิเสธ
// ไม่ throw: ส่งเมลพลาดต้องไม่ทำให้การสมัครล้ม (เรียกแบบไม่ await ได้) · ไม่มี EMAIL_USER = ข้าม
export async function notifyAdminsOfSignup(user: {
  firstName: string;
  lastName: string;
  email: string;
  via: 'form' | 'google';
}) {
  try {
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) return;
    const admins = await prisma.user.findMany({
      where: { role: { in: ['ADMIN', 'SUPER_ADMIN'] } },
      select: { email: true },
    });
    const to = admins.map((a) => a.email).filter((e) => !isTestAddress(e));
    if (to.length === 0) return;

    const link = new URL('/dashboard/users', process.env.NEXTAUTH_URL || 'http://localhost:3000').toString();
    const name = `${user.firstName} ${user.lastName}`.trim();
    const via = user.via === 'google' ? ' Google' : 'แบบฟอร์ม';
    await transporter.sendMail({
      from: `"CivicSpace" <${process.env.EMAIL_USER}>`,
      to: process.env.EMAIL_USER,
      bcc: to, // ไม่เปิดเผยอีเมลแอดมินคนอื่นในหัวจดหมาย
      subject: `บัญชีใหม่รออนุมัติ: ${name}`,
      text: `${name} (${user.email}) สมัครใช้งาน CivicSpace ผ่าน${via}\nอนุมัติหรือปฏิเสธได้ที่ ${link}`,
      html: `<div style="font-family:Tahoma,sans-serif;font-size:14px;color:#78350f">
        <p><b>${esc(name)}</b> (${esc(user.email)}) สมัครใช้งาน CivicSpace ผ่าน${via}</p>
        <p>ระหว่างรออนุมัติ บัญชีนี้เห็นแค่หน้าสาธารณะ</p>
        <p><a href="${link}" style="display:inline-block;background:#f59e0b;color:#fff;padding:8px 16px;border-radius:6px;text-decoration:none">อนุมัติ / ปฏิเสธ</a></p>
      </div>`,
    });
  } catch (err) {
    console.error('notifyAdminsOfSignup failed:', err);
  }
}
