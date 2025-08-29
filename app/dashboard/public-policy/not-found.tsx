// app/dashboard/public-policy/[id]/not-found.tsx
'use client'

import NotFoundPage from '@/app/components/NotFoundPage';

export default function NotFound() {
  return (
    <NotFoundPage
      title="ไม่พบข้อมูลนโยบายสาธารณะ"
      description="นโยบายสาธารณะที่คุณกำลังหาไม่มีอยู่ในระบบ หรืออาจถูกลบออกไปแล้ว"
      backUrl="/dashboard/public-policy"
      backText="กลับสู่หน้าจัดการนโยบายสาธารณะ"
      buttonColor="blue"
      isDashboard={true}
      autoRedirect={false}
    />
  );
}