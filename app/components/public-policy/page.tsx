// app/components/public-policy/page.tsx
import { getPublicPolicies } from '@/app/lib/actions/public-policy/get';
import PublicPolicyListClient from './components/PublicPolicyListClient';

export default async function PublicPolicyListPage() {
  const result = await getPublicPolicies();
  const initialPolicies = result.success ? result.data : [];

  return <PublicPolicyListClient initialPolicies={initialPolicies} />;
}