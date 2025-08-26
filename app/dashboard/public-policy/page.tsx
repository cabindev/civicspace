// app/dashboard/public-policy/page.tsx
import { Suspense } from 'react';
import { Card } from 'antd';
import PublicPolicyClient from './components/PublicPolicyClient';
import { getPublicPolicies } from '@/app/lib/actions/public-policy/get';

export default async function PublicPolicyPage() {
  // Fetch initial data on server
  const result = await getPublicPolicies();
  const initialPolicies = result.success ? result.data : [];

  return (
    <div className="container mx-auto p-4">
      <Suspense 
        fallback={
          <Card loading={true} title="กำลังโหลดข้อมูลนโยบายสาธารณะ...">
            <div className="h-64" />
          </Card>
        }
      >
        <PublicPolicyClient initialPolicies={initialPolicies} />
      </Suspense>
    </div>
  );
}