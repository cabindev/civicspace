'use client';

import { useState, useEffect } from 'react';
import { Select, Button } from 'antd';
import { ReloadOutlined } from '@ant-design/icons';

const { Option } = Select;

export interface FilterOptions {
  year: string;
  region: string;
}

interface DashboardFiltersProps {
  onFilterChange: (filters: FilterOptions) => void;
  loading?: boolean;
  initialFilters?: FilterOptions;
}

const DashboardFilters = ({ onFilterChange, loading = false, initialFilters }: DashboardFiltersProps) => {
  const [filters, setFilters] = useState<FilterOptions>(
    initialFilters || {
      year: 'all',
      region: 'all'
    }
  );
  const [years, setYears] = useState<{ value: string; label: string }[]>([
    { value: 'all', label: 'ทุกปี' }
  ]);
  const [regions, setRegions] = useState<{ value: string; label: string }[]>([
    { value: 'all', label: 'ทุกภูมิภาค' }
  ]);

  // Update local state when initialFilters changes
  useEffect(() => {
    if (initialFilters) {
      setFilters(initialFilters);
    }
  }, [initialFilters]);

  // Fetch available years and regions from API
  useEffect(() => {
    const fetchFilterOptions = async () => {
      try {
        // Fetch regions
        const regionsResponse = await fetch('/api/dashboard/regions');
        if (regionsResponse.ok) {
          const regionsData = await regionsResponse.json();
          const regionOptions = [
            { value: 'all', label: 'ทุกภูมิภาค' },
            ...regionsData.allTypes.map((type: string) => ({
              value: type,
              label: type
            }))
          ];
          setRegions(regionOptions);
        }

        // Generate years from 2563-2567 (can be enhanced to fetch from API)
        const currentYear = new Date().getFullYear() + 543;
        const yearOptions = [
          { value: 'all', label: 'ทุกปี' }
        ];
        for (let year = currentYear; year >= 2563; year--) {
          yearOptions.push({
            value: year.toString(),
            label: year.toString()
          });
        }
        setYears(yearOptions);

      } catch (error) {
        console.error('Error fetching filter options:', error);
        // แจ้งเตือนผู้ใช้ว่าไม่สามารถโหลดตัวเลือกได้
        alert('ไม่สามารถโหลดข้อมูลตัวกรองได้ กรุณาลองใหม่อีกครั้ง');
      }
    };

    fetchFilterOptions();
  }, []);

  const handleYearChange = (value: string) => {
    const newFilters = { ...filters, year: value };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const handleRegionChange = (value: string) => {
    const newFilters = { ...filters, region: value };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const handleReset = () => {
    const resetFilters = { year: 'all', region: 'all' };
    setFilters(resetFilters);
    onFilterChange(resetFilters);
  };

  return (
    <div className="mb-4">
      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
        <div className="flex flex-col md:flex-row gap-4 flex-1">
          <div className="flex flex-col">
            <label className="text-sm font-medium text-gray-700 mb-1">
              เลือกปี (พ.ศ.)
            </label>
            <Select
              value={filters.year}
              onChange={handleYearChange}
              style={{ width: 150 }}
              loading={loading}
            >
              {years.map(year => (
                <Option key={year.value} value={year.value}>
                  {year.label}
                </Option>
              ))}
            </Select>
          </div>

          <div className="flex flex-col">
            <label className="text-sm font-medium text-gray-700 mb-1">
              เลือกภูมิภาค
            </label>
            <Select
              value={filters.region}
              onChange={handleRegionChange}
              style={{ width: 200 }}
              loading={loading}
            >
              {regions.map(region => (
                <Option key={region.value} value={region.value}>
                  {region.label}
                </Option>
              ))}
            </Select>
          </div>
        </div>

        <div className="flex gap-2">
          <Button 
            icon={<ReloadOutlined />} 
            onClick={handleReset}
            disabled={loading}
          >
            รีเซ็ต
          </Button>
        </div>
      </div>
    </div>
  );
};

export default DashboardFilters;