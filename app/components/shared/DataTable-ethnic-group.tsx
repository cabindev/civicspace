'use client';

import { useState } from 'react';
import { Table, Select, Button, Space, Input, Typography, Card, Tag } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { DownloadOutlined, SearchOutlined, FilePdfOutlined, EyeOutlined } from '@ant-design/icons';
import * as XLSX from 'xlsx';
import { useMediaQuery } from 'react-responsive';

const { Title } = Typography;

// Interfaces
interface EthnicGroup {
  id: string;
  userId: number;
  categoryId: string;
  category: {
    name: string;
  };
  name: string;
  history: string;
  activityName: string;
  activityOrigin: string;
  province: string;
  amphoe: string;
  district: string;
  village: string | null;
  zipcode: number | null;
  district_code: number | null;
  amphoe_code: number | null;
  province_code: number | null;
  type: string;
  activityDetails: string;
  alcoholFreeApproach: string;
  startYear: number;
  results: string | null;
  images: { id: string; url: string }[];
  videoLink: string | null;
  fileUrl: string | null;
  viewCount: number;
  createdAt: string;
  updatedAt: string;
}

interface DataTableProps {
  title: string;
  data: EthnicGroup[];
  columns: ColumnsType<EthnicGroup>;
  loading?: boolean;
  onOpenFile: (url: string | null | undefined) => void;
  onOpenVideo: (url: string | null | undefined) => void;
}

export default function DataTableEthnicGroup({
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
  const [selectedType, setSelectedType] = useState<string>();
  const [selectedProvince, setSelectedProvince] = useState<string>();
  const [selectedDistrict, setSelectedDistrict] = useState<string>();

  // Get unique values for filters
  const categories = Array.from(new Set(data.map(item => item.category.name)));
  const types = Array.from(new Set(data.map(item => item.type)));
  const provinces = Array.from(new Set(data.map(item => item.province)));
  const districts = Array.from(new Set(data.map(item => item.amphoe)));

  // Filter data
  const filteredData = data.filter(item => {
    const matchesSearch = Object.values(item).some(
      value => value?.toString().toLowerCase().includes(searchText.toLowerCase())
    );
    const matchesCategory = !selectedCategory || item.category.name === selectedCategory;
    const matchesType = !selectedType || item.type === selectedType;
    const matchesProvince = !selectedProvince || item.province === selectedProvince;
    const matchesDistrict = !selectedDistrict || item.amphoe === selectedDistrict;

    return matchesSearch && matchesCategory && matchesType && matchesProvince && matchesDistrict;
  });

  const exportToExcel = () => {
    const exportData = filteredData.map(item => ({
      'หมวดหมู่': item.category.name,
      'ชื่อกิจกรรม': item.activityName,
      'ชื่อกลุ่มชาติพันธุ์': item.name,
      'ประเภท': item.type,
      'ประวัติความเป็นมา': item.history,
      'ที่มาของกิจกรรม': item.activityOrigin,
      'รายละเอียดกิจกรรม': item.activityDetails,
      'แนวทางการจัดงานปลอดเหล้า': item.alcoholFreeApproach,
      'ปีที่เริ่มดำเนินการ': item.startYear,
      'ผลที่เกิดขึ้น': item.results,
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
      'ชื่อกิจกรรม': item.activityName,
      'ชื่อกลุ่มชาติพันธุ์': item.name,
      'ประเภท': item.type,
      'ประวัติความเป็นมา': item.history,
      'ที่มาของกิจกรรม': item.activityOrigin,
      'รายละเอียดกิจกรรม': item.activityDetails,
      'แนวทางการจัดงานปลอดเหล้า': item.alcoholFreeApproach,
      'ปีที่เริ่มดำเนินการ': item.startYear,
      'ผลที่เกิดขึ้น': item.results,
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

  const renderMobileCard = (item: EthnicGroup) => (
    <Card 
      hoverable 
      className="mb-4 shadow-sm"
      key={item.id}
    >
      <div className="border-b pb-3 mb-3">
        <h3 className="text-lg font-bold text-green-800">{item.activityName}</h3>
        <div className="text-sm text-gray-500">
          {item.category.name} - {item.type}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 mb-3">
        <div>
          <div className="text-gray-500 text-sm">ชื่อกลุ่มชาติพันธุ์</div>
          <div>{item.name}</div>
        </div>
        <div>
          <div className="text-gray-500 text-sm">ปีที่เริ่ม</div>
          <div>{item.startYear}</div>
        </div>
        <div>
          <div className="text-gray-500 text-sm">จังหวัด</div>
          <div>{item.province}</div>
        </div>
        <div>
          <div className="text-gray-500 text-sm">อำเภอ</div>
          <div>{item.amphoe}</div>
        </div>
        <div>
          <div className="text-gray-500 text-sm">ตำบล</div>
          <div>{item.district}</div>
        </div>
        {item.village && (
          <div>
            <div className="text-gray-500 text-sm">หมู่บ้าน</div>
            <div>{item.village}</div>
          </div>
        )}
      </div>

      <div className="mb-3">
        <div className="text-gray-500 text-sm">ประวัติความเป็นมา</div>
        <div className="text-sm whitespace-pre-wrap">{item.history}</div>
      </div>

      <div className="mb-3">
        <div className="text-gray-500 text-sm">รายละเอียดกิจกรรม</div>
        <div className="text-sm whitespace-pre-wrap">{item.activityDetails}</div>
      </div>

      {item.results && (
        <div className="mb-3">
          <div className="text-gray-500 text-sm">ผลที่เกิดขึ้น</div>
          <div className="text-sm whitespace-pre-wrap">{item.results}</div>
        </div>
      )}

      <div className="flex justify-between items-center">
        <div className="text-sm text-gray-500">
          จำนวนการเข้าชม: {item.viewCount}
        </div>
        <Space>
          {item.fileUrl && (
            <Button 
              type="link" 
              icon={<FilePdfOutlined />} 
              onClick={() => onOpenFile(item.fileUrl)}
            >
              ดูไฟล์
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
      <Title level={2} className="text-green-800">{title}</Title>
      
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
            onClick={exportToExcel}
            className="bg-green-500 text-white hover:bg-green-600"
          >
            Export Excel
          </Button>
          <Button 
            icon={<DownloadOutlined />} 
            onClick={exportToCSV}
            className="bg-blue-500 text-white hover:bg-blue-600"
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