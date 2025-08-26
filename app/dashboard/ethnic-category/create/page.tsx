// app/dashboard/ethnic-category/create/page.tsx

import { createEthnicCategoryAction } from '@/app/lib/actions/ethnic-category/post';
import EthnicCategoryForm from '../components/EthnicCategoryForm';

export default function CreateEthnicCategory() {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4 text-green-700">สร้างประเภทกลุ่มชาติพันธุ์ใหม่</h1>
      <EthnicCategoryForm action={createEthnicCategoryAction} />
    </div>
  );
}