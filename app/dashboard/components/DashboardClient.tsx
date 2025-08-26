// app/dashboard/components/DashboardClient.tsx
'use client';

import { useEffect, useState, useTransition } from 'react';
import { Spin, Alert } from 'antd';
import { useSearchParams, useRouter } from 'next/navigation';
import { DashboardData } from '../../types/types';
import OverviewCards from './OverviewCards';
import RecentActivities from './RecentActivities';
import RecentPolicies from './RecentPolicies';
import TraditionChart from './TraditionChart';
import PublicPolicyChart from './PublicPolicyChart';
import CreativeActivityChart from './CreativeActivityChart';
import EthnicGroupChart from './EthnicGroupChart';
import DashboardTabs, { DashboardFilter } from './DashboardTabs';
import EmptyState from './EmptyState';

// Server Actions
import { getDashboardFilteredData } from '@/app/lib/actions/dashboard/dashboard';

interface DashboardClientProps {
  initialData: DashboardData;
  initialLocations: {
    regions: string[];
    provinces: string[];
    regionProvinceMap: Record<string, string[]>;
  };
}

export default function DashboardClient({ initialData, initialLocations }: DashboardClientProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const [data, setData] = useState<DashboardData>(initialData);
  const [filteredData, setFilteredData] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [locations] = useState(initialLocations);
  const [isPending, startTransition] = useTransition();
  
  // Initialize filter from URL params
  const [currentFilter, setCurrentFilter] = useState<DashboardFilter>({
    dataType: searchParams.get('dataType') || 'all',
    year: searchParams.get('year') || 'all',
    region: searchParams.get('region') || 'all',
    province: searchParams.get('province') || 'all'
  });

  // Fetch filtered data
  const fetchFilteredData = async (filter: DashboardFilter) => {
    startTransition(async () => {
      try {
        const result = await getDashboardFilteredData(
          filter.dataType === 'all' ? undefined : filter.dataType,
          filter.year === 'all' ? undefined : filter.year,
          filter.region === 'all' ? undefined : filter.region,
          filter.province === 'all' ? undefined : filter.province
        );
        
        if (result.success) {
          setFilteredData(result.data);
          setError(null);
        } else {
          throw new Error(result.error || 'Failed to fetch filtered data');
        }
      } catch (error) {
        console.error('Error fetching filtered data:', error);
        setError('Failed to load filtered data. Please try again later.');
        setFilteredData(null);
      }
    });
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
    
    // Check if any filters are applied
    const hasFilters = 
      filter.dataType !== 'all' || 
      filter.year !== 'all' || 
      filter.region !== 'all' || 
      filter.province !== 'all';

    if (hasFilters) {
      fetchFilteredData(filter);
    } else {
      setFilteredData(null);
    }
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
      
      // Check if any filters are applied
      const hasFilters = 
        newFilter.dataType !== 'all' || 
        newFilter.year !== 'all' || 
        newFilter.region !== 'all' || 
        newFilter.province !== 'all';

      if (hasFilters) {
        fetchFilteredData(newFilter);
      } else {
        setFilteredData(null);
      }
    }
  }, [searchParams]);

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

  if (!data.overview) {
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
        loading={isPending}
        initialFilters={currentFilter}
      />

      {/* Loading State */}
      {isPending && (
        <div className="flex justify-center items-center py-8">
          <Spin size="large" />
        </div>
      )}

      {/* Empty State */}
      {isEmpty && !isPending ? (
        <EmptyState
          title="ไม่พบข้อมูล"
          description={`ไม่มีข้อมูล${currentFilter.dataType !== 'all' ? 'ประเภท' + currentFilter.dataType : ''}ในเงื่อนไขการกรองที่เลือก`}
          onReset={handleReset}
        />
      ) : (
        !isPending && (
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
        )
      )}
    </div>
  );
}