'use client';
// app/dashboard/works/[id]/page.tsx — แก้ผลงาน + จัดการไฟล์แนบ
import { useParams } from 'next/navigation';
import WorkEditor from '../WorkEditor';

export default function EditWorkPage() {
  const { id } = useParams<{ id: string }>();
  const n = Number(id);
  if (!Number.isInteger(n) || n <= 0) return <p className="p-6 text-sm text-gray-500">ไม่พบงาน</p>;
  // key: เปลี่ยนงานแล้วให้ฟอร์มเริ่มใหม่ ไม่ค้างค่าจากงานก่อน
  return <WorkEditor key={n} id={n} />;
}
