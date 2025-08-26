// app/dashboard/creative-activity/create/page.tsx
import { Suspense } from 'react';
import { Card } from 'antd';
import CreateCreativeActivityClient from './components/CreateCreativeActivityClient';
import { getCreativeCategories } from '@/app/lib/actions/creative-category/get';

export default async function CreateCreativeActivityPage() {
  // Fetch categories on server
  const result = await getCreativeCategories();
  const initialCategories = result.success ? result.data : [];

  return (
    <div className="container mx-auto p-4">
      <Suspense 
        fallback={
          <Card loading={true} title="กำลังโหลดฟอร์มสร้างกิจกรรมสร้างสรรค์...">
            <div className="h-64" />
          </Card>
        }
      >
        <CreateCreativeActivityClient initialCategories={initialCategories} />
      </Suspense>
    </div>
  );
}