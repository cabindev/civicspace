// app/dashboard/tradition/[id]/page.tsx
import { notFound } from 'next/navigation';
import TraditionDetailClient from '../components/TraditionDetailClient';
import { getTraditionById } from '@/app/lib/actions/tradition/get';
import { incrementTraditionViewCount } from '@/app/lib/actions/tradition/put';

interface PageProps {
  params: {
    id: string;
  };
}

export default async function TraditionDetailPage({ params }: PageProps) {
  // Fetch tradition data on server
  const result = await getTraditionById(params.id);
  
  if (!result.success || !result.data) {
    notFound();
  }

  // Increment view count (fire and forget)
  try {
    await incrementTraditionViewCount(params.id);
  } catch (error) {
    console.error('Failed to increment view count:', error);
  }

  return <TraditionDetailClient tradition={result.data} />;
}