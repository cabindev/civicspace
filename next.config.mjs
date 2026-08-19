/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    unoptimized: true,
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
