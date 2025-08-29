// app/dashboard/ethnic-group/[id]/not-found.tsx
'use client'

import NotFoundPage from '@/app/components/NotFoundPage';

export default function NotFound() {
  return (
    <NotFoundPage
      title="ไม่พบข้อมูลกลุ่มชาติพันธุ์"
      description="กลุ่มชาติพันธุ์ที่คุณกำลังหาไม่มีอยู่ในระบบ หรืออาจถูกลบออกไปแล้ว"
      backUrl="/dashboard/ethnic-group"
      backText="กลับสู่หน้าจัดการกลุ่มชาติพันธุ์"
      buttonColor="purple"
      isDashboard={true}
      autoRedirect={false}
    />
  );
}