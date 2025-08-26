// app/dashboard/public-policy/[id]/page.tsx
import { notFound } from 'next/navigation';
import PublicPolicyDetailClient from './components/PublicPolicyDetailClient';
import { getPublicPolicyById, incrementViewCount } from '@/app/lib/actions/public-policy/get';

interface PageProps {
  params: {
    id: string;
  };
}

export default async function PublicPolicyDetailPage({ params }: PageProps) {
  // Fetch data on server
  const result = await getPublicPolicyById(params.id);

  if (!result.success || !result.data) {
    notFound();
  }

  // Increment view count
  await incrementViewCount(params.id);

  return <PublicPolicyDetailClient policy={result.data} />;
}