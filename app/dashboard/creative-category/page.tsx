// app/dashboard/creative-category/page.tsx

import { getCreativeCategories } from '@/app/lib/actions/creative-category/get';
import CreativeCategoryList from './components/CreativeCategoryList';

export default async function CreativeCategoryPage() {
  const result = await getCreativeCategories();
  
  if (!result.success) {
    return (
      <div className="container mx-auto p-4">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
          Error loading creative categories: {result.error}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">จัดการประเภทกิจกรรมสร้างสรรค์</h1>
      <CreativeCategoryList categories={result.data} />
    </div>
  );
}