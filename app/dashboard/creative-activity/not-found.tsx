// app/dashboard/creative-activity/[id]/not-found.tsx
'use client'

import NotFoundPage from '@/app/components/NotFoundPage';

export default function NotFound() {
  return (
    <NotFoundPage
      title="ไม่พบข้อมูลกิจกรรมสร้างสรรค์"
      description="กิจกรรมสร้างสรรค์ที่คุณกำลังหาไม่มีอยู่ในระบบ หรืออาจถูกลบออกไปแล้ว"
      backUrl="/dashboard/creative-activity"
      backText="กลับสู่หน้าจัดการกิจกรรมสร้างสรรค์"
      buttonColor="orange"
      isDashboard={true}
      autoRedirect={false}
    />
  );
}