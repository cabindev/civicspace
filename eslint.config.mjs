import nextCoreWebVitals from 'eslint-config-next/core-web-vitals';

// Next.js 16 ถอดคำสั่ง `next lint` ออก จึงใช้ ESLint CLI ตรงๆ ผ่าน flat config นี้แทน
const config = [
  {
    ignores: ['.next/**', 'node_modules/**', 'prisma/migrations/**', 'next-env.d.ts'],
  },
  ...nextCoreWebVitals,
];

export default config;
