'use client';

import { useState } from 'react';
import { Table, Select, Button, Space, Input, Typography, Card } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { DownloadOutlined, SearchOutlined, FilePdfOutlined, EyeOutlined } from '@ant-design/icons';
import * as XLSX from 'xlsx';
import { useMediaQuery } from 'react-responsive';

const { Title } = Typography;

interface DataTableProps {
  title: string;
  data: any[];
  columns: ColumnsType<any>;
  loading?: boolean;
}

export default function DataTable({ title, data, columns, loading = false }: DataTableProps) {
  const isMobile = useMediaQuery({ maxWidth: 768 });
  const [searchText, setSearchText] = useState('');
  const [selectedRegion, setSelectedRegion] = useState<string>();
  const [selectedProvince, setSelectedProvince] = useState<string>();
  const [selectedDistrict, setSelectedDistrict] = useState<string>();
  const [selectedSubDistrict, setSelectedSubDistrict] = useState<string>();

  // Get unique values for filters
  const regions = Array.from(new Set(data.map(item => item.type)));
  const provinces = Array.from(new Set(data.map(item => item.province)));
  const districts = Array.from(new Set(data.map(item => item.amphoe)));
  const subDistricts = Array.from(new Set(data.map(item => item.district)));

  // Filter data based on search and selections
  const filteredData = data.filter(item => {
    const matchesSearch = Object.values(item).some(
      value => value?.toString().toLowerCase().includes(searchText.toLowerCase())
    );
    const matchesRegion = !selectedRegion || item.type === selectedRegion;
    const matchesProvince = !selectedProvince || item.province === selectedProvince;
    const matchesDistrict = !selectedDistrict || item.amphoe === selectedDistrict;
    const matchesSubDistrict = !selectedSubDistrict || item.district === selectedSubDistrict;

    return matchesSearch && matchesRegion && matchesProvince && matchesDistrict && matchesSubDistrict;
  });

  const exportToExcel = () => {
    const ws = XLSX.utils.json_to_sheet(filteredData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Data');
    XLSX.writeFile(wb, `${title}.xlsx`);
  };

  const exportToCSV = () => {
    const ws = XLSX.utils.json_to_sheet(filteredData);
    const csv = XLSX.utils.sheet_to_csv(ws);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${title}.csv`;
    link.click();
  };

  const renderMobileCard = (item: any) => (
    <Card 
      key={item.id}
      className="mb-4 shadow-sm"
      hoverable
    >
      {/* ส่วนหัวการ์ด */}
      <div className="border-b pb-3 mb-3">
        <h3 className="text-lg font-bold text-green-800">{item.name}</h3>
        {item.category?.name && <div className="text-sm text-gray-600">{item.category.name}</div>}
      </div>

      {/* ข้อมูลพื้นที่ */}
      <div className="grid grid-cols-2 gap-2 mb-3">
        <div>
          <div className="text-gray-500 text-sm">ภาค</div>
          <div>{item.type}</div>
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
          <div className="col-span-2">
            <div className="text-gray-500 text-sm">หมู่บ้าน</div>
            <div>{item.village}</div>
          </div>
        )}
      </div>

      {/* ข้อมูลผู้ประสานงาน */}
      {(item.coordinatorName || item.phone) && (
        <div className="mb-3">
          <div className="text-gray-500 text-sm mb-1">ผู้ประสานงาน</div>
          {item.coordinatorName && <div>{item.coordinatorName}</div>}
          {item.phone && (
            <a href={`tel:${item.phone}`} className="text-blue-600">
              {item.phone}
            </a>
          )}
        </div>
      )}

      {/* ผลลัพธ์ */}
      {item.results && (
        <div className="mb-3">
          <div className="text-gray-500 text-sm mb-1">ผลลัพธ์</div>
          <div className="text-sm">{item.results}</div>
        </div>
      )}

      {/* สถานะการดำเนินงาน */}
      <div className="mb-3">
        <div className="text-gray-500 text-sm mb-2">สถานะการดำเนินงาน</div>
        <Space wrap size={[0, 8]}>
          <div>
            {[
              { key: 'hasPolicy', label: 'มีนโยบาย', color: 'green' },
              { key: 'hasAnnouncement', label: 'มีประกาศ', color: 'blue' },
              { key: 'hasInspector', label: 'มีผู้ตรวจการ', color: 'purple' },
              { key: 'hasMonitoring', label: 'มีการติดตาม', color: 'orange' },
              { key: 'hasCampaign', label: 'มีการรณรงค์', color: 'magenta' },
              { key: 'hasAlcoholPromote', label: 'มีการจัดการเครื่องดื่มแอลกอฮอล์', color: 'cyan' },
            ].map(status => (
              <div key={status.key}>
                <span 
                  className={`inline-block px-2 py-1 rounded text-sm ${
                    item[status.key] 
                      ? `bg-${status.color}-100 text-${status.color}-800`
                      : 'line-through text-gray-500'
                  }`}
                >
                  {item[status.key] ? `✓ ${status.label}` : status.label}
                </span>
              </div>
            ))}
          </div>
        </Space>
      </div>

      {/* ไฟล์และลิงก์ */}
      <div className="flex gap-2">
        {item.policyFileUrl && (
          <Button 
            type="primary"
            icon={<FilePdfOutlined />}
            onClick={() => window.open(item.policyFileUrl, '_blank')}
            size="small"
          >
            ดูไฟล์
          </Button>
        )}
        {item.videoLink && (
          <Button
            type="primary"
            icon={<EyeOutlined />}
            onClick={() => window.open(item.videoLink, '_blank')}
            size="small"
          >
            วิดีโอ
          </Button>
        )}
      </div>
    </Card>
  );

  return (
    <div className="space-y-4 p-4">
      <Title level={2} className="text-green-800 text-sm font-light">{title}</Title>
      
      <div className="flex flex-col space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          <Input
            placeholder="ค้นหา..."
            value={searchText}
            onChange={e => setSearchText(e.target.value)}
            prefix={<SearchOutlined />}
            className="w-full"
          />
          <Select
            allowClear
            placeholder="เลือกภาค"
            value={selectedRegion}
            onChange={setSelectedRegion}
            options={regions.map(region => ({ label: region, value: region }))}
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
          <Select
            allowClear
            placeholder="เลือกตำบล"
            value={selectedSubDistrict}
            onChange={setSelectedSubDistrict}
            options={subDistricts.map(subDistrict => ({ label: subDistrict, value: subDistrict }))}
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