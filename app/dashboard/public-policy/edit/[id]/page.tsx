// app/dashboard/public-policy/edit/[id]/page.tsx
import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import { Card } from 'antd';
import EditPublicPolicyClient from './components/EditPublicPolicyClient';
import { getPublicPolicyById } from '@/app/lib/actions/public-policy/get';

interface PageProps {
  params: {
    id: string;
  };
}

export default async function EditPublicPolicyPage({ params }: PageProps) {
  // Fetch data on server
  const result = await getPublicPolicyById(params.id);

  if (!result.success || !result.data) {
    notFound();
  }

  return (
    <div className="container mx-auto p-4">
      <Suspense 
        fallback={
          <Card loading={true} title="กำลังโหลดฟอร์มแก้ไขนโยบายสาธารณะ...">
            <div className="h-96" />
          </Card>
        }
      >
        <EditPublicPolicyClient policy={result.data} />
      </Suspense>
    </div>
  );
}