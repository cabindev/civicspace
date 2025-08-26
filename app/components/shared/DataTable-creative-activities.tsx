//components/shared/DataTable-creative-activities.tsx
'use client';

import { useState } from 'react';
import { Table, Select, Button, Space, Input, Typography, Card } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { DownloadOutlined, SearchOutlined, FilePdfOutlined, EyeOutlined } from '@ant-design/icons';
import * as XLSX from 'xlsx';
import { useMediaQuery } from 'react-responsive';

const { Title } = Typography;

// Interfaces
interface CreativeActivity {
  id: string;
  categoryId: string;
  category: {
    name: string;
  };
  subCategoryId: string;
  subCategory: {
    name: string;
  };
  userId: number;
  name: string;
  district: string;
  amphoe: string;
  province: string;
  zipcode: number | null;
  district_code: number | null;
  amphoe_code: number | null;
  province_code: number | null;
  type: string;
  village: string | null;
  coordinatorName: string | null;
  phone: string | null;
  description: string;
  summary: string;
  results: string | null;
  startYear: number;
  images: { id: string; url: string }[];
  videoLink: string | null;
  reportFileUrl: string | null;
  viewCount: number;
  createdAt: string;
  updatedAt: string;
}

interface DataTableProps {
  title: string;
  data: CreativeActivity[];
  columns: ColumnsType<CreativeActivity>;
  loading?: boolean;
  onOpenFile: (url: string | null | undefined) => void;
  onOpenVideo: (url: string | null | undefined) => void;
}

export default function DataTableCreativeActivities({
  title,
  data,
  columns,
  loading = false,
  onOpenFile,
  onOpenVideo,
}: DataTableProps) {
  const isMobile = useMediaQuery({ maxWidth: 768 });
  const [searchText, setSearchText] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>();
  const [selectedSubCategory, setSelectedSubCategory] = useState<string>();
  const [selectedType, setSelectedType] = useState<string>();
  const [selectedProvince, setSelectedProvince] = useState<string>();
  const [selectedDistrict, setSelectedDistrict] = useState<string>();

  // Get unique values for filters
  const categories = Array.from(new Set(data.map(item => item.category.name)));
  const subCategories = Array.from(new Set(data.map(item => item.subCategory.name)));
  const types = Array.from(new Set(data.map(item => item.type)));
  const provinces = Array.from(new Set(data.map(item => item.province)));
  const districts = Array.from(new Set(data.map(item => item.amphoe)));

  // Filter data
  const filteredData = data.filter(item => {
    const matchesSearch = Object.values(item).some(
      value => value?.toString().toLowerCase().includes(searchText.toLowerCase())
    );
    const matchesCategory = !selectedCategory || item.category.name === selectedCategory;
    const matchesSubCategory = !selectedSubCategory || item.subCategory.name === selectedSubCategory;
    const matchesType = !selectedType || item.type === selectedType;
    const matchesProvince = !selectedProvince || item.province === selectedProvince;
    const matchesDistrict = !selectedDistrict || item.amphoe === selectedDistrict;

    return matchesSearch && matchesCategory && matchesSubCategory && 
           matchesType && matchesProvince && matchesDistrict;
  });

  const exportToExcel = () => {
    const exportData = filteredData.map(item => ({
      'หมวดหมู่': item.category.name,
      'หมวดหมู่ย่อย': item.subCategory.name,
      'ชื่อกิจกรรม': item.name,
      'ประเภท': item.type,
      'ผู้ประสานงาน': item.coordinatorName,
      'เบอร์โทรศัพท์': item.phone,
      'รายละเอียด': item.description,
      'สรุป': item.summary,
      'ผลที่เกิดขึ้น': item.results,
      'ปีที่เริ่มดำเนินการ': item.startYear,
      'จังหวัด': item.province,
      'อำเภอ': item.amphoe,
      'ตำบล': item.district,
      'หมู่บ้าน': item.village,
      'จำนวนการเข้าชม': item.viewCount,
    }));

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Data');
    XLSX.writeFile(wb, `${title}.xlsx`);
  };

  const exportToCSV = () => {
    const exportData = filteredData.map(item => ({
      'หมวดหมู่': item.category.name,
      'หมวดหมู่ย่อย': item.subCategory.name,
      'ชื่อกิจกรรม': item.name,
      'ประเภท': item.type,
      'ผู้ประสานงาน': item.coordinatorName,
      'เบอร์โทรศัพท์': item.phone,
      'รายละเอียด': item.description,
      'สรุป': item.summary,
      'ผลที่เกิดขึ้น': item.results,
      'ปีที่เริ่มดำเนินการ': item.startYear,
      'จังหวัด': item.province,
      'อำเภอ': item.amphoe,
      'ตำบล': item.district,
      'หมู่บ้าน': item.village,
      'จำนวนการเข้าชม': item.viewCount,
    }));

    const ws = XLSX.utils.json_to_sheet(exportData);
    const csv = XLSX.utils.sheet_to_csv(ws);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${title}.csv`;
    link.click();
  };

  const renderMobileCard = (item: CreativeActivity) => (
    <Card 
      hoverable 
      className="mb-4 shadow-sm"
      key={item.id}
    >
      <div className="border-b pb-3 mb-3">
        <h3 className="text-sm font-light text-green-800">{item.name}</h3>
        <div className="text-xs font-light text-gray-500">
          {item.category.name} - {item.subCategory.name}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 mb-3">
        <div>
          <div className="text-gray-500 text-xs font-light">ประเภท</div>
          <div className="text-xs font-light">{item.type}</div>
        </div>
        <div>
          <div className="text-gray-500 text-xs font-light">ปีที่เริ่ม</div>
          <div className="text-xs font-light">{item.startYear}</div>
        </div>
        <div>
          <div className="text-gray-500 text-xs font-light">จังหวัด</div>
          <div className="text-xs font-light">{item.province}</div>
        </div>
        <div>
          <div className="text-gray-500 text-xs font-light">อำเภอ</div>
          <div className="text-xs font-light">{item.amphoe}</div>
        </div>
        <div>
          <div className="text-gray-500 text-xs font-light">ตำบล</div>
          <div className="text-xs font-light">{item.district}</div>
        </div>
        {item.village && (
          <div>
            <div className="text-gray-500 text-xs font-light">หมู่บ้าน</div>
            <div className="text-xs font-light">{item.village}</div>
          </div>
        )}
      </div>

      {item.coordinatorName && (
        <div className="mb-3">
          <div className="text-gray-500 text-xs font-light">ผู้ประสานงาน</div>
          <div className="text-xs font-light">{item.coordinatorName}</div>
          {item.phone && <div className="text-xs font-light">{item.phone}</div>}
        </div>
      )}

      <div className="mb-3">
        <div className="text-gray-500 text-xs font-light">รายละเอียด</div>
        <div className="text-xs font-light whitespace-pre-wrap">{item.description}</div>
      </div>

      <div className="mb-3">
        <div className="text-gray-500 text-xs font-light">สรุป</div>
        <div className="text-xs font-light whitespace-pre-wrap">{item.summary}</div>
      </div>

      {item.results && (
        <div className="mb-3">
          <div className="text-gray-500 text-xs font-light">ผลที่เกิดขึ้น</div>
          <div className="text-xs font-light whitespace-pre-wrap">{item.results}</div>
        </div>
      )}

      <div className="flex justify-between items-center">
        <div className="text-xs font-light text-gray-500">
          จำนวนการเข้าชม: {item.viewCount}
        </div>
        <Space>
          {item.reportFileUrl && (
            <Button 
              type="link" 
              icon={<FilePdfOutlined />} 
              onClick={() => onOpenFile(item.reportFileUrl)}
            >
              ดูรายงาน
            </Button>
          )}
          {item.videoLink && (
            <Button 
              type="link" 
              icon={<EyeOutlined />} 
              onClick={() => onOpenVideo(item.videoLink)}
            >
              วิดีโอ
            </Button>
          )}
        </Space>
      </div>
    </Card>
  );

  return (
    <div className="space-y-4 p-4">
      <Title level={2} className="text-green-800 text-sm font-light">{title}</Title>
      
      <div className="flex flex-col space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-6 gap-4">
          <Input
            placeholder="ค้นหา..."
            value={searchText}
            onChange={e => setSearchText(e.target.value)}
            prefix={<SearchOutlined />}
            className="w-full"
          />
          <Select
            allowClear
            placeholder="หมวดหมู่"
            value={selectedCategory}
            onChange={setSelectedCategory}
            options={categories.map(category => ({ label: category, value: category }))}
            className="w-full"
          />
          <Select
            allowClear
            placeholder="หมวดหมู่ย่อย"
            value={selectedSubCategory}
            onChange={setSelectedSubCategory}
            options={subCategories.map(subCategory => ({ label: subCategory, value: subCategory }))}
            className="w-full"
          />
          <Select
            allowClear
            placeholder="ประเภท"
            value={selectedType}
            onChange={setSelectedType}
            options={types.map(type => ({ label: type, value: type }))}
            className="w-full"
          />
          <Select
            allowClear
            placeholder="เลือกจังหวัด"
            value={selectedProvince}
            onChange={setSelectedProvince}
            options={provinces.map(province => ({ label: province, value: province }))}
            className="w-full"
          />
          <Select
            allowClear
            placeholder="เลือกอำเภอ"
            value={selectedDistrict}
            onChange={setSelectedDistrict}
            options={districts.map(district => ({ label: district, value: district }))}
            className="w-full"
          />
        </div>

        <Space className="justify-end">
          <Button 
            icon={<DownloadOutlined />} 
            size="small"
            onClick={exportToExcel}
            className="bg-green-500 text-white hover:bg-green-600 text-xs font-light"
          >
            Export Excel
          </Button>
          <Button 
            icon={<DownloadOutlined />} 
            size="small"
            onClick={exportToCSV}
            className="bg-green-600 text-white hover:bg-green-700 text-xs font-light"
          >
            Export CSV
          </Button>
        </Space>
      </div>

      {isMobile ? (
        <div className="space-y-4">
          {filteredData.map(renderMobileCard)}
        </div>
      ) : (
        <Table
          columns={columns}
          dataSource={filteredData}
          rowKey="id"
          loading={loading}
          scroll={{ x: 'max-content' }}
          pagination={{
            total: filteredData.length,
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total) => `ทั้งหมด ${total} รายการ`,
          }}
        />
      )}
    </div>
  );
}