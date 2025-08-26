// app/dashboard/ethnic-group/create/page.tsx
import { Suspense } from 'react';
import { Card } from 'antd';
import CreateEthnicGroupClient from './components/CreateEthnicGroupClient';
import { getEthnicCategories } from '@/app/lib/actions/ethnic-category/get';

export default async function CreateEthnicGroupPage() {
  // Fetch initial data on server
  const categoriesResult = await getEthnicCategories();
  const initialCategories = categoriesResult.success ? categoriesResult.data : [];

  return (
    <div className="container mx-auto p-4">
      <Suspense 
        fallback={
          <Card loading={true} title="กำลังโหลดฟอร์มสร้างกลุ่มชาติพันธุ์ใหม่...">
            <div className="h-96" />
          </Card>
        }
      >
        <CreateEthnicGroupClient initialCategories={initialCategories} />
      </Suspense>
    </div>
  );
}