// app/dashboard/ethnic-category/page.tsx
import { Suspense } from 'react';
import { Spin } from 'antd';
import { getEthnicCategories } from '@/app/lib/actions/ethnic-category/get';
import EthnicCategoryListClient from './components/EthnicCategoryListClient';

// Add caching for 30 seconds
export const revalidate = 30;

async function EthnicCategoryList() {
  const result = await getEthnicCategories();
  const initialCategories = result.success ? result.data : [];

  return <EthnicCategoryListClient initialCategories={initialCategories} />;
}

function LoadingFallback() {
  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-4">
        <div className="h-8 w-48 bg-gray-200 rounded animate-pulse"></div>
        <div className="h-10 w-40 bg-gray-200 rounded animate-pulse"></div>
      </div>
      <div className="flex justify-center items-center h-64">
        <Spin size="large" />
      </div>
    </div>
  );
}

export default function EthnicCategoryListPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <EthnicCategoryList />
    </Suspense>
  );
}