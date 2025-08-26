// app/dashboard/tradition-category/create/page.tsx

import { createTraditionCategoryAction } from '@/app/lib/actions/tradition-category/post';
import TraditionCategoryForm from '../components/TraditionCategoryForm';

export default function CreateTraditionCategory() {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">สร้างประเภทงานบุญประเพณีใหม่</h1>
      <TraditionCategoryForm action={createTraditionCategoryAction} />
    </div>
  );
}