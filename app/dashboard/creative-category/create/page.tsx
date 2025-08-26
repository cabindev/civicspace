// app/dashboard/creative-category/create/page.tsx

import { createCreativeCategoryAction } from '@/app/lib/actions/creative-category/post';
import CreativeCategoryForm from '../components/CreativeCategoryForm';

export default function CreateCreativeCategory() {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">สร้างประเภทกิจกรรมสร้างสรรค์ใหม่</h1>
      <CreativeCategoryForm action={createCreativeCategoryAction} />
    </div>
  );
}