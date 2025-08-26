// app/dashboard/ethnic-group/page.tsx
import { Suspense } from 'react';
import { Card } from 'antd';
import EthnicGroupClient from './components/EthnicGroupClient';
import { getEthnicGroups } from '@/app/lib/actions/ethnic-group/get';

export default async function EthnicGroupPage() {
  // Fetch initial data on server
  const result = await getEthnicGroups();
  const initialEthnicGroups = result.success ? result.data : [];

  return (
    <div className="container mx-auto p-4">
      <Suspense 
        fallback={
          <Card loading={true} title="กำลังโหลดข้อมูลกลุ่มชาติพันธุ์...">
            <div className="h-64" />
          </Card>
        }
      >
        <EthnicGroupClient initialEthnicGroups={initialEthnicGroups} />
      </Suspense>
    </div>
  );
}