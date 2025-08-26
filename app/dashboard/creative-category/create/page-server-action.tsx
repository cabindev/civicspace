// app/dashboard/creative-category/create/page-server-action.tsx
// Example of how the create page would look with Server Actions

import { redirect } from 'next/navigation';
import { createCreativeCategoryAction } from '@/app/lib/actions/creative-category/post';
import CreativeCategoryForm from '../components/CreativeCategoryForm';

export default function CreateCreativeCategory() {
  async function handleSubmit(prevState: any, formData: FormData) {
    'use server'
    
    const result = await createCreativeCategoryAction(prevState, formData);
    
    if (result.success) {
      redirect('/dashboard/creative-category');
    }
    
    // Error handling would be done in the form component
    return result;
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">สร้างประเภทกิจกรรมสร้างสรรค์ใหม่</h1>
      <CreativeCategoryForm action={handleSubmit} />
    </div>
  );
}