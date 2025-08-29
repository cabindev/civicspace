// app/dashboard/ethnic-group/[id]/page.tsx
import { notFound } from 'next/navigation';
import EthnicGroupDetailClient from '../components/EthnicGroupDetailClient';
import { getEthnicGroupById, incrementEthnicGroupViewCount } from '@/app/lib/actions/ethnic-group/get';

interface PageProps {
  params: {
    id: string;
  };
}

export default async function EthnicGroupDetailPage({ params }: PageProps) {
  // Fetch ethnic group data on server
  const result = await getEthnicGroupById(params.id);
  
  if (!result.success || !result.data) {
    notFound();
  }

  // Increment view count (fire and forget)
  try {
    await incrementEthnicGroupViewCount(params.id);
  } catch (error) {
    console.error('Failed to increment view count:', error);
  }

  return <EthnicGroupDetailClient ethnicGroup={result.data} />;
}