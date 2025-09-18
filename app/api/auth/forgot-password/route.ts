import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import crypto from "crypto";
import nodemailer from "nodemailer";

const prisma = new PrismaClient();

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();

    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      return NextResponse.json(
        { error: "ไม่พบผู้ใช้งานในระบบ" },
        { status: 404 }
      );
    }

    const token = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 3600000); // 1 hour from now

    await prisma.user.update({
      where: { email },
      data: {
        resetToken: token,
        resetTokenCreatedAt: new Date(),
        resetTokenExpiresAt: expiresAt,
      },
    });

    const resetUrl = `${process.env.NEXTAUTH_URL}/auth/reset-password?token=${token}`;

          const htmlContent = `
      <!DOCTYPE html>
      <html lang="th">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>รีเซ็ตรหัสผ่าน - CivicSpace</title>
      </head>
      <body style="font-family: 'Sarabun', Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #fffbeb;">
        <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px; margin: 0 auto; padding: 20px;">
          <tr>
            <td align="center" style="padding-bottom: 20px;">
              <div style="width: 60px; height: 60px; background-color: #ffffff; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
                <span style="color: #f59e0b; font-size: 24px; font-weight: bold;">C</span>
              </div>
            </td>
          </tr>
          <tr>
            <td>
              <div style="background-color: #ffffff; padding: 30px; border-radius: 8px; border: 1px solid #fde68a; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
                <h2 style="color: #f59e0b; text-align: center; margin-bottom: 20px;">รีเซ็ตรหัสผ่านของคุณ</h2>
                <p style="color: #78350f;">เรียน คุณ${user.firstName || user.email},</p>
                <p style="color: #78350f;">เราได้รับคำขอให้รีเซ็ตรหัสผ่านสำหรับบัญชีของคุณที่ <strong>CivicSpace</strong> หากคุณไม่ได้ทำการร้องขอนี้ กรุณาเพิกเฉยต่ออีเมลนี้</p>
                <p style="color: #78350f;">คลิกที่ปุ่มด้านล่างเพื่อรีเซ็ตรหัสผ่านของคุณ:</p>
                <table border="0" cellpadding="0" cellspacing="0" width="100%">
                  <tr>
                    <td align="center" style="padding: 30px 0;">
                      <a href="${resetUrl}" style="background-color: #f59e0b; color: #ffffff; text-decoration: none; padding: 12px 24px; border-radius: 6px; display: inline-block; font-weight: 500; transition: background-color 0.2s;">รีเซ็ตรหัสผ่าน</a>
                    </td>
                  </tr>
                </table>
                <p style="color: #92400e; font-size: 14px;">หากคุณมีปัญหาในการคลิกปุ่ม ให้คัดลอกและวางลิงก์ต่อไปนี้ลงในเบราว์เซอร์ของคุณ:</p>
                <p style="color: #92400e; font-size: 12px; background-color: #fef3c7; padding: 10px; border-radius: 4px; word-break: break-all;">${resetUrl}</p>
                <p style="color: #b45309; font-size: 14px;"><strong>หมายเหตุ:</strong> ลิงก์นี้จะหมดอายุภายใน 1 ชั่วโมง เพื่อความปลอดภัยของบัญชีของคุณ</p>
                <hr style="border: none; border-top: 1px solid #fde68a; margin: 30px 0;">
                <p style="color: #78350f;">
                  <strong>CivicSpace</strong><br>
                  พื้นที่พลเมืองร่วมหาทางออกปัญหาแอลกอฮอล์
                </p>
                <p style="color: #92400e; font-size: 12px;">
                  หากคุณไม่ได้ร้องขอการรีเซ็ตรหัสผ่าน กรุณาเพิกเฉยต่ออีเมลนี้ หรือติดต่อผู้ดูแลระบบหากมีข้อสงสัย
                </p>
              </div>
            </td>
          </tr>
          <tr>
            <td style="padding-top: 20px; text-align: center;">
              <p style="color: #92400e; font-size: 12px; margin: 0;">
                © 2025 CivicSpace. พื้นที่พลเมืองร่วมหาทางออกปัญหาแอลกอฮอล์
              </p>
            </td>
          </tr>
        </table>
      </body>
      </html>
      `;

    const mailOptions = {
      from: '"CivicSpace" <noreply@civicspace.org>',
      to: email,
      subject: "รีเซ็ตรหัสผ่าน - CivicSpace",
      html: htmlContent,
    };

    await transporter.sendMail(mailOptions);

    return NextResponse.json({
      message: "ลิงก์สำหรับรีเซ็ตรหัสผ่านได้ถูกส่งไปยังอีเมลของคุณแล้ว",
    });
  } catch (error) {
    console.error("Error occurred:", error);
    return NextResponse.json(
      { error: "เกิดข้อผิดพลาดในการส่งอีเมล โปรดลองอีกครั้งในภายหลัง" },
      { status: 500 }
    );
  }
}
