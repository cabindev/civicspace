// app/dashboard/creative-activity/[id]/page.tsx
import { notFound } from 'next/navigation';
import CreativeActivityDetailClient from './components/CreativeActivityDetailClient';
import { getCreativeActivityById, incrementCreativeActivityViewCount } from '@/app/lib/actions/creative-activity/get';

interface PageProps {
  params: {
    id: string;
  };
}

export default async function CreativeActivityDetailPage({ params }: PageProps) {
  // Fetch activity data on server
  const result = await getCreativeActivityById(params.id);
  
  if (!result.success || !result.data) {
    notFound();
  }

  // Increment view count (fire and forget)
  try {
    await incrementCreativeActivityViewCount(params.id);
  } catch (error) {
    console.error('Failed to increment view count:', error);
  }

  return <CreativeActivityDetailClient activity={result.data} />;
}