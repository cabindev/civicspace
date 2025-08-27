// app/dashboard/components/DashboardTabs.tsx
'use client';

import { useEffect, useMemo, useState } from 'react';
import { Tabs, Select, Card, Button } from 'antd';
import { FilterOutlined, DownOutlined, UpOutlined } from '@ant-design/icons';

const { Option } = Select;

export type DataType = 'all' | 'creativeActivity' | 'tradition' | 'publicPolicy' | 'ethnicGroup';

export interface DashboardFilter {
  dataType: DataType | string;
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
  regionProvinceMap?: Record<string, string[]>; // optional mapping region -> provinces
  loading?: boolean;
  initialFilters?: DashboardFilter;
}

const DEFAULT_COUNTS = { all: 0, creativeActivities: 0, traditions: 0, publicPolicies: 0, ethnicGroups: 0 };

const DashboardTabs = ({
  onFilterChange,
  dataCounts = DEFAULT_COUNTS,
  availableRegions = [],
  availableProvinces = [],
  regionProvinceMap,
  loading = false,
  initialFilters,
}: DashboardTabsProps) => {
  const [activeTab, setActiveTab] = useState<DataType | string>(initialFilters?.dataType ?? 'all');
  const [filter, setFilter] = useState<DashboardFilter>(
    initialFilters ?? { dataType: 'all', year: 'all', region: 'all', province: 'all' }
  );
  const [isFilterExpanded, setIsFilterExpanded] = useState(false);

  // Sync props -> local state
  useEffect(() => {
    if (initialFilters) {
      setFilter(initialFilters);
      setActiveTab(initialFilters.dataType);
    }
  }, [initialFilters]);

  // Memoize year list (Buddhist Era)
  const yearOptions = useMemo(() => {
    const currentYearBE = new Date().getFullYear() + 543;
    const startBE = 2556; // 2013 BE
    const years = [{ value: 'all', label: 'ทุกปี' }];
    for (let y = currentYearBE; y >= startBE; y--) {
      years.push({ value: String(y), label: `พ.ศ. ${y}` });
    }
    return years;
  }, []);

  // Tab definitions (memoized)
  const tabItems = useMemo(
    () => [
      { key: 'all', label: getTabLabel('all', 'ภาพรวมทั้งหมด', dataCounts.all) },
      { key: 'creativeActivity', label: getTabLabel('creativeActivity', 'กิจกรรมสร้างสรรค์', dataCounts.creativeActivities) },
      { key: 'tradition', label: getTabLabel('tradition', 'ประเพณี', dataCounts.traditions) },
      { key: 'publicPolicy', label: getTabLabel('publicPolicy', 'นโยบายสาธารณะ', dataCounts.publicPolicies) },
      { key: 'ethnicGroup', label: getTabLabel('ethnicGroup', 'กลุ่มชาติพันธุ์', dataCounts.ethnicGroups) },
    ],
    [dataCounts, activeTab]
  );

  // Filter provinces by selected region when a mapping is provided
  const filteredProvinces = useMemo(() => {
    if (!regionProvinceMap || filter.region === 'all') return availableProvinces;
    return regionProvinceMap[filter.region] ?? [];
  }, [availableProvinces, regionProvinceMap, filter.region]);

  const hasActiveFilters = useMemo(
    () => filter.year !== 'all' || filter.region !== 'all' || filter.province !== 'all' || filter.dataType !== 'all',
    [filter]
  );

  function getTabLabel(key: string, text: string, count: number) {
    const isActive = activeTab === key;
    return (
      <div className={`flex items-center gap-2 transition-colors duration-200 ${
        isActive ? 'text-green-600' : 'text-gray-600 hover:text-green-500'
      }`}>
        <span className="font-normal">{text}</span>
        <span className={`px-2 py-1 text-xs rounded-full font-medium min-w-[2rem] text-center ${
          isActive 
            ? 'bg-green-100 text-green-700' 
            : 'bg-gray-100 text-gray-600'
        }`}>
          {count.toLocaleString()}
        </span>
      </div>
    );
  }

  const handleTabChange = (key: string) => {
    setActiveTab(key);
    const newFilter = { ...filter, dataType: key };
    setFilter(newFilter);
    onFilterChange(newFilter);
  };

  const handleFilterChange = (key: keyof DashboardFilter, value: string) => {
    const resetProvince = key === 'region' && value !== 'all' ? { province: 'all' } : {};
    const newFilter = { ...filter, [key]: value, ...resetProvince };
    setFilter(newFilter);
    onFilterChange(newFilter);
  };

  const resetFilters = () => {
    const base: DashboardFilter = { dataType: filter.dataType ?? 'all', year: 'all', region: 'all', province: 'all' };
    setFilter(base);
    onFilterChange(base);
  };

  return (
    <Card className="mb-8 bg-white shadow-sm border-0 rounded-2xl overflow-hidden" data-testid="dashboard-tabs">
      <div className="space-y-6">

        {/* Professional Tabs */}
        <Tabs
          activeKey={String(activeTab)}
          onChange={handleTabChange}
          items={tabItems.map((t) => ({ key: t.key, label: t.label }))}
          size="large"
          className="dashboard-tabs-professional"
          tabBarStyle={{
            marginBottom: 0,
            borderBottom: '2px solid #f0f0f0',
            paddingLeft: '4px'
          }}
          aria-label="Dashboard data type tabs"
        />

        {/* Professional Filter Section */}
        <div className="border-t border-gray-100 pt-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-medium text-gray-900 flex items-center gap-2">
                <FilterOutlined className="text-green-600" />
                ตัวกรองข้อมูล
              </h3>
              <p className="text-sm text-gray-600 font-light mt-1">
                กรองข้อมูลตามปี ภูมิภาค และจังหวัด
              </p>
            </div>
            <Button
              type={isFilterExpanded ? "primary" : "default"}
              icon={isFilterExpanded ? <UpOutlined /> : <DownOutlined />}
              onClick={() => setIsFilterExpanded((s) => !s)}
              className={`shadow-sm ${hasActiveFilters ? 'border-green-500 text-green-600' : ''}`}
              aria-expanded={isFilterExpanded}
              aria-controls="dashboard-filters"
            >
              {isFilterExpanded ? 'ย่อตัวกรอง' : 'ขยายตัวกรอง'}
            </Button>
          </div>

          {isFilterExpanded && (
            <div id="dashboard-filters" className="bg-gradient-to-r from-gray-50 to-green-50 p-6 rounded-xl border border-gray-200" role="region" aria-label="Filters">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Year Filter */}
                <div className="space-y-3">
                  <label className="block text-sm font-medium text-gray-700">
                    ปี
                    {filter.year !== 'all' && (
                      <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        {yearOptions.find(y => y.value === filter.year)?.label}
                      </span>
                    )}
                  </label>
                  <Select
                    value={filter.year}
                    onChange={(v) => handleFilterChange('year', v)}
                    style={{ width: '100%', height: '40px' }}
                    loading={loading}
                    placeholder="เลือกปีงบประมาณ"
                    aria-label="เลือกปี"
                    className="rounded-lg"
                    showSearch
                    optionFilterProp="children"
                  >
                    {yearOptions.map((y) => (
                      <Option key={y.value} value={y.value}>
                        {y.label}
                      </Option>
                    ))}
                  </Select>
                </div>

                {/* Region Filter */}
                <div className="space-y-3">
                  <label className="block text-sm font-medium text-gray-700">
                     ภูมิภาค
                    {filter.region !== 'all' && (
                      <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {filter.region}
                      </span>
                    )}
                  </label>
                  <Select
                    value={filter.region}
                    onChange={(v) => handleFilterChange('region', v)}
                    style={{ width: '100%', height: '40px' }}
                    loading={loading}
                    placeholder="เลือกภูมิภาค"
                    showSearch
                    optionFilterProp="children"
                    aria-label="เลือกภูมิภาค"
                    className="rounded-lg"
                  >
                    <Option value="all">ทุกภูมิภาค</Option>
                    {availableRegions.map((r) => (
                      <Option key={r} value={r}>
                        {r}
                      </Option>
                    ))}
                  </Select>
                </div>

                {/* Province Filter */}
                <div className="space-y-3">
                  <label className="block text-sm font-medium text-gray-700">
                    จังหวัด
                    {filter.province !== 'all' && (
                      <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                        {filter.province}
                      </span>
                    )}
                  </label>
                  <Select
                    value={filter.province}
                    onChange={(v) => handleFilterChange('province', v)}
                    style={{ width: '100%', height: '40px' }}
                    loading={loading}
                    placeholder={filter.region === 'all' ? 'เลือกภูมิภาคก่อน' : 'เลือกจังหวัด'}
                    disabled={filter.region === 'all' && !!regionProvinceMap}
                    showSearch
                    optionFilterProp="children"
                    aria-label="เลือกจังหวัด"
                    className="rounded-lg"
                  >
                    <Option value="all">ทุกจังหวัด</Option>
                    {filteredProvinces.map((p) => (
                      <Option key={p} value={p}>
                        {p}
                      </Option>
                    ))}
                  </Select>
                </div>
              </div>

              {/* Professional Active Filter Summary */}
              {hasActiveFilters && (
                <div className="mt-6 p-4 bg-white rounded-xl border-l-4 border-green-500 shadow-sm">
                  <div className="flex items-start gap-3">
                    <FilterOutlined className="text-green-600 mt-1" />
                    <div className="flex-1">
                      <h4 className="text-sm font-medium text-gray-900 mb-2">ตัวกรองที่ใช้งาน</h4>
                      <div className="flex flex-wrap gap-2 mb-3">
                        {filter.dataType !== 'all' && (
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            📊 ประเภท: {tabItems.find((t) => t.key === filter.dataType)?.key}
                          </span>
                        )}
                        {filter.year !== 'all' && (
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            📅 {yearOptions.find((y) => y.value === filter.year)?.label}
                          </span>
                        )}
                        {filter.region !== 'all' && (
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                            🌏 {filter.region}
                          </span>
                        )}
                        {filter.province !== 'all' && (
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                            🏢 {filter.province}
                          </span>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <Button size="small" onClick={resetFilters} className="text-xs">
                          🔄 รีเซ็ตตัวกรอง
                        </Button>
                        <Button size="small" type="primary" onClick={() => setIsFilterExpanded(false)} className="text-xs">
                          ✨ ปิดตัวกรอง
                        </Button>
                      </div>
                    </div>
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
