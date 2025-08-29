// app/dashboard/tradition/[id]/not-found.tsx
'use client'

import NotFoundPage from '@/app/components/NotFoundPage';

export default function NotFound() {
  return (
    <NotFoundPage
      title="ไม่พบข้อมูลงานบุญประเพณี"
      description="งานบุญประเพณีที่คุณกำลังหาไม่มีอยู่ในระบบ หรืออาจถูกลบออกไปแล้ว"
      backUrl="/dashboard/tradition"
      backText="กลับสู่หน้าจัดการงานบุญประเพณี"
      buttonColor="green"
      isDashboard={true}
      autoRedirect={false}
    />
  );
}