//app/dashboard/components/DashboardTabs.tsx
'use client';

import { useState, useEffect } from 'react';
import { Tabs, Select, Card, Button, Badge } from 'antd';
import { FilterOutlined, DownOutlined, UpOutlined } from '@ant-design/icons';

const { TabPane } = Tabs;
const { Option } = Select;

export interface DashboardFilter {
  dataType: string;
  year: string;
  region: string;
  province: string;
}

interface DashboardTabsProps {
  onFilterChange: (filter: DashboardFilter) => void;
  dataCounts?: {
    all: number;
    creativeActivities: number;
    traditions: number;
    publicPolicies: number;
    ethnicGroups: number;
  };
  availableRegions?: string[];
  availableProvinces?: string[];
  loading?: boolean;
  initialFilters?: DashboardFilter;
}

const DashboardTabs = ({ 
  onFilterChange, 
  dataCounts = { all: 0, creativeActivities: 0, traditions: 0, publicPolicies: 0, ethnicGroups: 0 },
  availableRegions = [],
  availableProvinces = [],
  loading = false,
  initialFilters
}: DashboardTabsProps) => {
  const [activeTab, setActiveTab] = useState(initialFilters?.dataType || 'all');
  const [filter, setFilter] = useState<DashboardFilter>(
    initialFilters || {
      dataType: 'all',
      year: 'all',
      region: 'all',
      province: 'all'
    }
  );
  const [isFilterExpanded, setIsFilterExpanded] = useState(false);

  const getTabLabel = (key: string, text: string, count: number) => (
    <span className={`flex items-center ${activeTab === key ? 'font-semibold text-green-600' : ''}`}>
      {text}
      <span className="ml-2 px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full min-w-0">
        {count.toLocaleString()}
      </span>
      {activeTab === key && (
        <span className="ml-1 w-2 h-2 bg-green-500 rounded-full"></span>
      )}
    </span>
  );

  const tabItems = [
    {
      key: 'all',
      label: getTabLabel('all', 'ภาพรวมทั้งหมด', dataCounts.all),
      icon: '📊'
    },
    {
      key: 'creativeActivity',
      label: getTabLabel('creativeActivity', 'กิจกรรมสร้างสรรค์', dataCounts.creativeActivities),
      icon: '🎨'
    },
    {
      key: 'tradition',
      label: getTabLabel('tradition', 'ประเพณี', dataCounts.traditions),
      icon: '🎭'
    },
    {
      key: 'publicPolicy',
      label: getTabLabel('publicPolicy', 'นโยบายสาธารณะ', dataCounts.publicPolicies),
      icon: '📋'
    },
    {
      key: 'ethnicGroup',
      label: getTabLabel('ethnicGroup', 'กลุ่มชาติพันธุ์', dataCounts.ethnicGroups),
      icon: '👥'
    }
  ];

  const handleTabChange = (key: string) => {
    setActiveTab(key);
    const newFilter = { ...filter, dataType: key };
    setFilter(newFilter);
    onFilterChange(newFilter);
  };

  // Update local filter state when initialFilters prop changes
  useEffect(() => {
    if (initialFilters) {
      setFilter(initialFilters);
      setActiveTab(initialFilters.dataType);
    }
  }, [initialFilters]);

  const handleFilterChange = (filterKey: keyof DashboardFilter, value: string) => {
    // Reset province if region changes
    const newFilter = { 
      ...filter, 
      [filterKey]: value,
      ...(filterKey === 'region' && value !== 'all' ? { province: 'all' } : {})
    };
    setFilter(newFilter);
    onFilterChange(newFilter);
  };

  // Generate years from current year back to 2013 (in Buddhist Era)
  const generateYearOptions = () => {
    const currentYear = new Date().getFullYear() + 543; // Convert to Buddhist Era
    const years = [{ value: 'all', label: 'ทุกปี' }];
    
    for (let year = currentYear; year >= 2556; year--) { // Start from 2013 BE (2556)
      years.push({
        value: year.toString(),
        label: `พ.ศ. ${year}`
      });
    }
    return years;
  };

  const yearOptions = generateYearOptions();
  
  // Filter provinces based on selected region
  const filteredProvinces = filter.region === 'all' 
    ? availableProvinces 
    : availableProvinces; // TODO: Add region-province mapping

  // Check if any filters are active
  const hasActiveFilters = filter.year !== 'all' || filter.region !== 'all' || filter.province !== 'all';

  return (
    <Card className="mb-6 bg-white shadow-lg border border-green-100 rounded-xl">
      <div className="space-y-4">
        
        {/* Main Navigation Tabs */}
        <Tabs 
          activeKey={activeTab} 
          onChange={handleTabChange}
          type="card"
          size="large"
          className="dashboard-tabs"
        >
          {tabItems.map(item => (
            <TabPane
              tab={item.label}
              key={item.key}
            />
          ))}
        </Tabs>

        {/* Filter Toggle Button */}
        <div className="border-t pt-4">
          <Button
            type={hasActiveFilters ? "primary" : "default"}
            icon={<FilterOutlined />}
            onClick={() => setIsFilterExpanded(!isFilterExpanded)}
            className={`mb-4 ${hasActiveFilters ? 'bg-green-500 border-green-500' : ''}`}
          >
            ตัวกรองข้อมูล
            {isFilterExpanded ? <UpOutlined className="ml-2" /> : <DownOutlined className="ml-2" />}
          </Button>

          {/* Collapsible Filter Controls */}
          {isFilterExpanded && (
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            
            {/* Year Filter */}
            <div>
              <label className="block text-xs font-light text-gray-600 mb-2">
                เลือกปี
                {filter.year !== 'all' && (
                  <span className="ml-2 px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                    {yearOptions.find(y => y.value === filter.year)?.label}
                  </span>
                )}
              </label>
              <Select
                value={filter.year}
                onChange={(value) => handleFilterChange('year', value)}
                style={{ width: '100%' }}
                loading={loading}
                placeholder="เลือกปี"
                className={filter.year !== 'all' ? 'border-green-400' : ''}
              >
                {yearOptions.map(year => (
                  <Option key={year.value} value={year.value}>
                    {year.label}
                  </Option>
                ))}
              </Select>
            </div>

            {/* Region Filter */}
            <div>
              <label className="block text-xs font-light text-gray-600 mb-2">
                เลือกภูมิภาค
                {filter.region !== 'all' && (
                  <span className="ml-2 px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                    {filter.region}
                  </span>
                )}
              </label>
              <Select
                value={filter.region}
                onChange={(value) => handleFilterChange('region', value)}
                style={{ width: '100%' }}
                loading={loading}
                placeholder="เลือกภูมิภาค"
                showSearch
                optionFilterProp="children"
                className={filter.region !== 'all' ? 'border-green-400' : ''}
              >
                <Option value="all">ทุกภูมิภาค</Option>
                {availableRegions.map(region => (
                  <Option key={region} value={region}>
                    {region}
                  </Option>
                ))}
              </Select>
            </div>

            {/* Province Filter */}
            <div>
              <label className="block text-xs font-light text-gray-600 mb-2">
                เลือกจังหวัด
                {filter.province !== 'all' && (
                  <span className="ml-2 px-2 py-1 bg-orange-100 text-orange-800 text-xs rounded-full">
                    {filter.province}
                  </span>
                )}
              </label>
              <Select
                value={filter.province}
                onChange={(value) => handleFilterChange('province', value)}
                style={{ width: '100%' }}
                loading={loading}
                placeholder="เลือกจังหวัด"
                disabled={filter.region === 'all'}
                showSearch
                optionFilterProp="children"
                className={filter.province !== 'all' ? 'border-orange-400' : ''}
              >
                <Option value="all">ทุกจังหวัด</Option>
                {filteredProvinces.map(province => (
                  <Option key={province} value={province}>
                    {province}
                  </Option>
                ))}
              </Select>
            </div>
              </div>

              {/* Active Filter Summary */}
              {(filter.year !== 'all' || filter.region !== 'all' || filter.province !== 'all' || filter.dataType !== 'all') && (
                <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center flex-wrap gap-2">
                    <span className="text-xs font-light text-green-800">ตัวกรองที่ใช้:</span>
                    {filter.dataType !== 'all' && (
                      <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                        ประเภท: {tabItems.find(item => item.key === filter.dataType)?.label}
                      </span>
                    )}
                    {filter.year !== 'all' && (
                      <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                        {yearOptions.find(y => y.value === filter.year)?.label}
                      </span>
                    )}
                    {filter.region !== 'all' && (
                      <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                        {filter.region}
                      </span>
                    )}
                    {filter.province !== 'all' && (
                      <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                        {filter.province}
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </Card>
  );
};

export default DashboardTabs;