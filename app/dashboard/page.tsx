'use client';
import { useEffect, useState } from 'react';
import { Spin } from 'antd';
import { DashboardData } from '../types/types';
import OverviewCards from './components/OverviewCards';
import RecentActivities from './components/RecentActivities';
import RecentPolicies from './components/RecentPolicies';
import TraditionChart from './components/TraditionChart';
import PublicPolicyChart from './components/PublicPolicyChart';
import CreativeActivityChart from './components/CreativeActivityChart';
import EthnicGroupChart from './components/EthnicGroupChart';
import ThailandMap from './components/ThailandMap';

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [
          overviewResponse,
          recentActivitiesResponse,
          recentPoliciesResponse,
          traditionChartResponse,
          publicPolicyChartResponse,
          creativeActivityChartResponse,
          ethnicGroupChartResponse,
          mapResponse
        ] = await Promise.all([
          fetch('/api/dashboard/overview'),
          fetch('/api/dashboard/recentActivities'),
          fetch('/api/dashboard/recentPolicies'),
          fetch('/api/dashboard/traditionChart'),
          fetch('/api/dashboard/publicPolicyChart'),
          fetch('/api/dashboard/creativeActivityChart'),
          fetch('/api/dashboard/ethnicGroupChart'),
          fetch('/api/dashboard/map')
        ]);

        const [
          overview,
          recentActivities,
          recentPolicies,
          traditionChart,
          publicPolicyChart,
          creativeActivityChart,
          ethnicGroupChart,
          map
        ] = await Promise.all([
          overviewResponse.json(),
          recentActivitiesResponse.json(),
          recentPoliciesResponse.json(),
          traditionChartResponse.json(),
          publicPolicyChartResponse.json(),
          creativeActivityChartResponse.json(),
          ethnicGroupChartResponse.json(),
          mapResponse.json()
        ]);

        setData({
          overview,
          recentActivities,
          recentPolicies,
          traditionChart,
          publicPolicyChart,
          creativeActivityChart,
          ethnicGroupChart,
          map,
          topViewed: []
        });

      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        setError('Failed to load dashboard data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return <Spin size="large" className="flex justify-center items-center h-screen" />;
  }

  if (error) {
    return <div className="text-red-500 text-center">{error}</div>;
  }

  if (!data) {
    return <div>No data available.</div>;
  }

  return (
    <div className="p-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <OverviewCards data={data.overview} />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
        <RecentActivities data={data.recentActivities} />
        <RecentPolicies data={data.recentPolicies} />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
        <TraditionChart data={data.traditionChart} />
        <PublicPolicyChart data={data.publicPolicyChart} />
        <CreativeActivityChart data={data.creativeActivityChart} />
        <EthnicGroupChart data={data.ethnicGroupChart} />
      </div>
      <div className="mt-4">
        {/* <ThailandMap data={data.map} /> */}
      </div>
    </div>
  );
}