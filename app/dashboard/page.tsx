'use client';
import { useEffect, useState } from 'react';
import { Spin, Alert } from 'antd';
import { useSearchParams, useRouter } from 'next/navigation';
import { DashboardData } from '../types/types';
import OverviewCards from './components/OverviewCards';
import RecentActivities from './components/RecentActivities';
import RecentPolicies from './components/RecentPolicies';
import TraditionChart from './components/TraditionChart';
import PublicPolicyChart from './components/PublicPolicyChart';
import CreativeActivityChart from './components/CreativeActivityChart';
import EthnicGroupChart from './components/EthnicGroupChart';
import DashboardTabs, { DashboardFilter } from './components/DashboardTabs';
import EmptyState from './components/EmptyState';
// import ThailandMap from './components/ThailandMap';

export default function DashboardPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const [data, setData] = useState<DashboardData | null>(null);
  const [filteredData, setFilteredData] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [locations, setLocations] = useState<{
    regions: string[];
    provinces: string[];
    regionProvinceMap: Record<string, string[]>;
  }>({ regions: [], provinces: [], regionProvinceMap: {} });
  
  // Initialize filter from URL params
  const [currentFilter, setCurrentFilter] = useState<DashboardFilter>({
    dataType: searchParams.get('dataType') || 'all',
    year: searchParams.get('year') || 'all',
    region: searchParams.get('region') || 'all',
    province: searchParams.get('province') || 'all'
  });

  // Fetch original dashboard data
  const fetchOriginalData = async () => {
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

      return {
        overview,
        recentActivities,
        recentPolicies,
        traditionChart,
        publicPolicyChart,
        creativeActivityChart,
        ethnicGroupChart,
        map,
        topViewed: []
      };
    } catch (error) {
      console.error('Error fetching original dashboard data:', error);
      throw error;
    }
  };

  // Fetch filtered data
  const fetchFilteredData = async (filter: DashboardFilter) => {
    try {
      const params = new URLSearchParams();
      if (filter.dataType !== 'all') params.append('dataType', filter.dataType);
      if (filter.year !== 'all') params.append('year', filter.year);
      if (filter.region !== 'all') params.append('region', filter.region);
      if (filter.province !== 'all') params.append('province', filter.province);

      const response = await fetch(`/api/dashboard/filtered-data?${params.toString()}`);
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to fetch filtered data');
      }

      return result;
    } catch (error) {
      console.error('Error fetching filtered data:', error);
      throw error;
    }
  };

  // Fetch locations data
  const fetchLocations = async () => {
    try {
      const response = await fetch('/api/dashboard/locations');
      const result = await response.json();
      if (response.ok) {
        setLocations(result);
      }
    } catch (error) {
      console.error('Error fetching locations:', error);
    }
  };

  // Main data fetcher
  const fetchData = async (filter: DashboardFilter) => {
    setLoading(true);
    try {
      // Always fetch original data first
      const originalData = await fetchOriginalData();
      setData(originalData);

      // Check if any filters are applied
      const hasFilters = 
        filter.dataType !== 'all' || 
        filter.year !== 'all' || 
        filter.region !== 'all' || 
        filter.province !== 'all';

      if (hasFilters) {
        const filtered = await fetchFilteredData(filter);
        setFilteredData(filtered);
      } else {
        setFilteredData(null);
      }

      setError(null);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setError('Failed to load dashboard data. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  // Handle filter changes
  const handleFilterChange = (filter: DashboardFilter) => {
    setCurrentFilter(filter);
    
    // Update URL
    const params = new URLSearchParams();
    if (filter.dataType !== 'all') params.set('dataType', filter.dataType);
    if (filter.year !== 'all') params.set('year', filter.year);
    if (filter.region !== 'all') params.set('region', filter.region);
    if (filter.province !== 'all') params.set('province', filter.province);
    
    const newUrl = params.toString() ? `/dashboard?${params.toString()}` : '/dashboard';
    router.replace(newUrl);
    
    // Fetch new data
    fetchData(filter);
  };

  // Reset filters
  const handleReset = () => {
    const resetFilter: DashboardFilter = {
      dataType: 'all',
      year: 'all',
      region: 'all',
      province: 'all'
    };
    handleFilterChange(resetFilter);
  };

  useEffect(() => {
    fetchLocations();
    fetchData(currentFilter);
  }, []);

  // Update filter when URL changes
  useEffect(() => {
    const newFilter: DashboardFilter = {
      dataType: searchParams.get('dataType') || 'all',
      year: searchParams.get('year') || 'all',
      region: searchParams.get('region') || 'all',
      province: searchParams.get('province') || 'all'
    };
    
    if (JSON.stringify(newFilter) !== JSON.stringify(currentFilter)) {
      setCurrentFilter(newFilter);
      fetchData(newFilter);
    }
  }, [searchParams]);


  if (loading) {
    return <Spin size="large" className="flex justify-center items-center h-screen" />;
  }

  if (error) {
    return (
      <Alert
        message="เกิดข้อผิดพลาด"
        description={error}
        type="error"
        showIcon
        className="m-4"
      />
    );
  }

  if (!data) {
    return <div>No data available.</div>;
  }

  // Determine which data to display
  const displayData = filteredData || data;
  const isFiltered = !!filteredData;

  // Get data counts for tabs
  const dataCounts = {
    all: data.overview.traditionCount + data.overview.publicPolicyCount + data.overview.ethnicGroupCount + data.overview.creativeActivityCount,
    creativeActivities: data.overview.creativeActivityCount,
    traditions: data.overview.traditionCount,
    publicPolicies: data.overview.publicPolicyCount,
    ethnicGroups: data.overview.ethnicGroupCount
  };

  // Check if filtered data is empty
  const isEmpty = isFiltered && displayData.overview.totalCount === 0;

  return (
    <div className="">
      {/* Navigation Tabs with Filters */}
      <DashboardTabs
        onFilterChange={handleFilterChange}
        dataCounts={dataCounts}
        availableRegions={locations.regions}
        availableProvinces={currentFilter.region !== 'all' 
          ? locations.regionProvinceMap[currentFilter.region] || []
          : locations.provinces
        }
        loading={loading}
        initialFilters={currentFilter}
      />

      {/* Empty State */}
      {isEmpty ? (
        <EmptyState
          title="ไม่พบข้อมูล"
          description={`ไม่มีข้อมูล${currentFilter.dataType !== 'all' ? 'ประเภท' + currentFilter.dataType : ''}ในเงื่อนไขการกรองที่เลือก`}
          onReset={handleReset}
        />
      ) : (
        <>
          {/* Filter Summary */}
          {isFiltered && (
            <Alert
              message={
                <div className="flex items-center justify-between">
                  <span>
                    🔍 แสดงข้อมูลที่กรองแล้ว: {displayData.overview.totalCount} รายการ
                  </span>
                  <span className="text-sm">
                    {currentFilter.dataType !== 'all' && `ประเภท: ${currentFilter.dataType}`}
                    {currentFilter.year !== 'all' && ` | ปี: ${currentFilter.year}`}
                    {currentFilter.region !== 'all' && ` | ภูมิภาค: ${currentFilter.region}`}
                    {currentFilter.province !== 'all' && ` | จังหวัด: ${currentFilter.province}`}
                  </span>
                </div>
              }
              type="info"
              className="mb-4"
              showIcon
            />
          )}

          {/* Dashboard Content */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <OverviewCards data={displayData.overview} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <RecentActivities data={displayData.recentActivities} />
            <RecentPolicies data={displayData.recentPolicies} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            {/* Show charts only if there's data and they match the current filter */}
            {(displayData.traditionChart || (currentFilter.dataType === 'all' && data.traditionChart)) && 
             (currentFilter.dataType === 'all' || currentFilter.dataType === 'tradition') && (
              <TraditionChart data={displayData.traditionChart || data.traditionChart} />
            )}
            {(displayData.publicPolicyChart || (currentFilter.dataType === 'all' && data.publicPolicyChart)) && 
             (currentFilter.dataType === 'all' || currentFilter.dataType === 'publicPolicy') && (
              <PublicPolicyChart data={displayData.publicPolicyChart || data.publicPolicyChart} />
            )}
            {(displayData.creativeActivityChart || (currentFilter.dataType === 'all' && data.creativeActivityChart)) && 
             (currentFilter.dataType === 'all' || currentFilter.dataType === 'creativeActivity') && (
              <CreativeActivityChart data={displayData.creativeActivityChart || data.creativeActivityChart} />
            )}
            {(displayData.ethnicGroupChart || (currentFilter.dataType === 'all' && data.ethnicGroupChart)) && 
             (currentFilter.dataType === 'all' || currentFilter.dataType === 'ethnicGroup') && (
              <EthnicGroupChart data={displayData.ethnicGroupChart || data.ethnicGroupChart} />
            )}
          </div>

          <div className="mt-4">
            {/* <ThailandMap data={displayData.map} /> */}
          </div>
        </>
      )}
    </div>
  );
}