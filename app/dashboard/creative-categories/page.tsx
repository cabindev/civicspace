// app/dashboard/creative-categories/page.tsx
import { Suspense } from 'react';
import CreativeCategoriesClient from './components/CreativeCategoriesClient';
import { getCreativeCategories } from '@/app/lib/actions/creative-category/get';
import { Card } from 'antd';

export default async function CreativeCategoriesPage() {
  // Fetch initial data on server
  const result = await getCreativeCategories();
  const initialCategories = result.success ? result.data : [];

  return (
    <div className="container mx-auto p-4">
      <Suspense 
        fallback={
          <Card loading={true} title="กำลังโหลดข้อมูล...">
            <div className="h-64" />
          </Card>
        }
      >
        <CreativeCategoriesClient initialCategories={initialCategories} />
      </Suspense>
    </div>
  );
}