// app/dashboard/tradition-category/page.tsx

import { getTraditionCategories } from '@/app/lib/actions/tradition-category/get';
import TraditionCategoryList from './components/TraditionCategoryList';

export default async function TraditionCategoryPage() {
  const result = await getTraditionCategories();
  
  if (!result.success) {
    return (
      <div className="container mx-auto p-4">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
          Error loading tradition categories: {result.error}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">จัดการประเภทงานบุญประเพณี</h1>
      <TraditionCategoryList categories={result.data} />
    </div>
  );
}