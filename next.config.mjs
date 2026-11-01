/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    // เปิด image optimization ของ Next (มี sharp ติดตั้งอยู่แล้ว)
    // รูปจาก Azure blob เป็นไฟล์เต็มความละเอียด หน้าแรกเดิมโหลดรวมกัน ~4.3 MB
    // เมื่อผ่านตัว optimizer จะถูกย่อตาม sizes และแปลงเป็น AVIF/WebP
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 2592000, // 30 วัน — รูปจาก API ใช้ชื่อไฟล์ UUID ไม่ถูกเขียนทับ
    // Next.js 16: `images.domains` ถูกยกเลิก ใช้ `remotePatterns` แทน
    // รายการด้านล่างครอบคลุมโฮสต์ชุดเดิมที่ `domains` เคยอนุญาต (ทุก path) จึงไม่เปลี่ยนพฤติกรรมเดิม
    remotePatterns: [
      { protocol: 'http', hostname: 'localhost' },
      { protocol: 'https', hostname: 'civicspace.sdnthailand.com' },
      { protocol: 'https', hostname: 'civicblogs12.blob.core.windows.net' },
    ],
  },
};

export default nextConfig;
