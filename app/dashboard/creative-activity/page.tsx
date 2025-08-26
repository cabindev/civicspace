// app/dashboard/creative-activity/page.tsx
import { Suspense } from 'react';
import { Card } from 'antd';
import CreativeActivityClient from './components/CreativeActivityClient';
import { getCreativeActivities } from '@/app/lib/actions/creative-activity/get';

export default async function CreativeActivityPage() {
  // Fetch initial data on server
  const result = await getCreativeActivities();
  const initialActivities = result.success ? result.data : [];

  return (
    <div className="container mx-auto p-4">
      <Suspense 
        fallback={
          <Card loading={true} title="กำลังโหลดข้อมูลกิจกรรมสร้างสรรค์...">
            <div className="h-64" />
          </Card>
        }
      >
        <CreativeActivityClient initialActivities={initialActivities} />
      </Suspense>
    </div>
  );
}