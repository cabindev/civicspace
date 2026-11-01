// app/farewell/font.ts — ฟอนต์ "เสาชิงช้า" ของ กทม. (--font-sao) ใช้ใน "ส่งด้วยใจ" และการ์ดบนหน้าแรก
// เงื่อนไขการใช้ฟอนต์ดู fonts/README.md (แจกฟรี ใช้เชิงพาณิชย์ได้ ห้ามแก้ไขไฟล์)
import localFont from 'next/font/local';

export const sao = localFont({
  src: [
    { path: './fonts/SaoChingcha-Light.otf', weight: '300', style: 'normal' },
    { path: './fonts/SaoChingcha-Regular.otf', weight: '400', style: 'normal' },
    { path: './fonts/SaoChingcha-Bold.otf', weight: '700', style: 'normal' },
  ],
  variable: '--font-sao',
  display: 'swap',
});
