// app/dashboard/creative-category/edit/[id]/page.tsx

import { getCreativeCategoryById } from '@/app/lib/actions/creative-category/get';
import { updateCreativeCategoryAction } from '@/app/lib/actions/creative-category/put';
import CreativeCategoryForm from '../../components/CreativeCategoryForm';
import { notFound } from 'next/navigation';

interface EditCreativeCategoryProps {
  params: { id: string };
}

export default async function EditCreativeCategory({ params }: EditCreativeCategoryProps) {
  const result = await getCreativeCategoryById(params.id);
  
  if (!result.success) {
    notFound();
  }

  const category = result.data;
  const boundAction = updateCreativeCategoryAction.bind(null, params.id);

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">แก้ไขประเภทกิจกรรมสร้างสรรค์</h1>
      <CreativeCategoryForm 
        action={boundAction}
        initialData={{
          name: category.name
        }}
      />
    </div>
  );
}