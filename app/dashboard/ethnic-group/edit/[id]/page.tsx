// app/dashboard/ethnic-group/edit/[id]/page.tsx
import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import { Card } from 'antd';
import EditEthnicGroupClient from './components/EditEthnicGroupClient';
import { getEthnicGroupById } from '@/app/lib/actions/ethnic-group/get';
import { getEthnicCategories } from '@/app/lib/actions/ethnic-category/get';

interface PageProps {
  params: {
    id: string;
  };
}

export default async function EditEthnicGroupPage({ params }: PageProps) {
  // Fetch data on server
  const [ethnicGroupResult, categoriesResult] = await Promise.all([
    getEthnicGroupById(params.id),
    getEthnicCategories()
  ]);

  if (!ethnicGroupResult.success || !ethnicGroupResult.data) {
    notFound();
  }

  const initialCategories = categoriesResult.success ? categoriesResult.data : [];

  return (
    <div className="container mx-auto p-4">
      <Suspense 
        fallback={
          <Card loading={true} title="กำลังโหลดฟอร์มแก้ไขกลุ่มชาติพันธุ์...">
            <div className="h-96" />
          </Card>
        }
      >
        <EditEthnicGroupClient 
          ethnicGroup={ethnicGroupResult.data} 
          initialCategories={initialCategories} 
        />
      </Suspense>
    </div>
  );
}