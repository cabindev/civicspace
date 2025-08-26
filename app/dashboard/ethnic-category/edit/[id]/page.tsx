// app/dashboard/ethnic-category/edit/[id]/page.tsx
import { notFound } from 'next/navigation';
import { getEthnicCategoryById } from '@/app/lib/actions/ethnic-category/get';
import EditEthnicCategoryClient from './components/EditEthnicCategoryClient';

interface PageProps {
  params: {
    id: string;
  };
}

export default async function EditEthnicCategoryPage({ params }: PageProps) {
  // Fetch data on server
  const result = await getEthnicCategoryById(params.id);

  if (!result.success || !result.data) {
    notFound();
  }

  return <EditEthnicCategoryClient category={result.data} />;
}