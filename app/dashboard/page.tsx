// app/dashboard/page.tsx
import { Suspense } from 'react';
import { Card } from 'antd';
import DashboardClient from './components/DashboardClient';
import { getDashboardOverview, getDashboardRecentActivities, getDashboardRecentPolicies, getDashboardTraditionChart, getDashboardPublicPolicyChart, getDashboardCreativeActivityChart, getDashboardEthnicGroupChart, getDashboardMap, getDashboardLocations } from '@/app/lib/actions/dashboard/dashboard';

export default async function DashboardPage() {
  // Fetch initial data on server
  const [
    overviewResult,
    recentActivitiesResult,
    recentPoliciesResult,
    traditionChartResult,
    publicPolicyChartResult,
    creativeActivityChartResult,
    ethnicGroupChartResult,
    mapResult,
    locationsResult
  ] = await Promise.all([
    getDashboardOverview(),
    getDashboardRecentActivities(),
    getDashboardRecentPolicies(),
    getDashboardTraditionChart(),
    getDashboardPublicPolicyChart(),
    getDashboardCreativeActivityChart(),
    getDashboardEthnicGroupChart(),
    getDashboardMap(),
    getDashboardLocations()
  ]);

  const initialData = {
    overview: overviewResult.success ? overviewResult.data : null,
    recentActivities: recentActivitiesResult.success ? recentActivitiesResult.data : [],
    recentPolicies: recentPoliciesResult.success ? recentPoliciesResult.data : [],
    traditionChart: traditionChartResult.success ? traditionChartResult.data : null,
    publicPolicyChart: publicPolicyChartResult.success ? publicPolicyChartResult.data : null,
    creativeActivityChart: creativeActivityChartResult.success ? creativeActivityChartResult.data : null,
    ethnicGroupChart: ethnicGroupChartResult.success ? ethnicGroupChartResult.data : null,
    map: mapResult.success ? mapResult.data : null,
    topViewed: []
  };

  const initialLocations = locationsResult.success ? locationsResult.data : {
    regions: [],
    provinces: [],
    regionProvinceMap: {}
  };

  return (
    <div className="">
      <Suspense 
        fallback={
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <Card key={i} loading={true}>
                <div className="h-20" />
              </Card>
            ))}
          </div>
        }
      >
        <DashboardClient 
          initialData={initialData} 
          initialLocations={initialLocations} 
        />
      </Suspense>
    </div>
  );
}