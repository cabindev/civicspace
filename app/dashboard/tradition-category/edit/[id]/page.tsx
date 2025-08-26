// app/dashboard/tradition-category/edit/[id]/page.tsx

import { getTraditionCategoryById } from '@/app/lib/actions/tradition-category/get';
import { updateTraditionCategoryAction } from '@/app/lib/actions/tradition-category/put';
import TraditionCategoryForm from '../../components/TraditionCategoryForm';
import { notFound } from 'next/navigation';

interface EditTraditionCategoryProps {
  params: { id: string };
}

export default async function EditTraditionCategory({ params }: EditTraditionCategoryProps) {
  const result = await getTraditionCategoryById(params.id);
  
  if (!result.success) {
    notFound();
  }

  const category = result.data;
  const boundAction = updateTraditionCategoryAction.bind(null, params.id);

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">แก้ไขประเภทงานบุญประเพณี</h1>
      <TraditionCategoryForm 
        action={boundAction}
        initialData={{
          name: category.name
        }}
        mode="edit"
      />
    </div>
  );
}