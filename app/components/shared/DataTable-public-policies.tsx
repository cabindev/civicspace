// components/shared/DataTable-public-policies.tsx
'use client';

import { useState } from 'react';
import { Table, Select, Button, Space, Input, Typography, Card, Tag } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { DownloadOutlined, SearchOutlined } from '@ant-design/icons';
import * as XLSX from 'xlsx';
import { useMediaQuery } from 'react-responsive';

const { Title } = Typography;

// Interfaces
interface PublicPolicy {
 id: string;
 name: string;
 signingDate: string;
 level: PolicyLevel;
 healthRegion: string | null;
 district: string;
 amphoe: string;
 province: string;
 type: string;
 village: string | null;
 content: string[];
 summary: string;
 results: string | null;
 videoLink: string | null;
 policyFileUrl: string | null;
 images: { id: string; url: string }[];
 viewCount: number;
 zipcode: number | null;
 district_code: number | null;
 amphoe_code: number | null;
 province_code: number | null;
 createdAt: string;
 updatedAt: string;
}

interface DataTableProps {
 title: string;
 data: PublicPolicy[];
 columns: ColumnsType<PublicPolicy>;
 loading?: boolean;
 onOpenPolicyFile: (url: string | null | undefined) => void;
 onOpenVideoLink: (url: string | null | undefined) => void;
}

// Enums
enum PolicyLevel {
 NATIONAL = 'NATIONAL',
 HEALTH_REGION = 'HEALTH_REGION',
 PROVINCIAL = 'PROVINCIAL',
 DISTRICT = 'DISTRICT',
 SUB_DISTRICT = 'SUB_DISTRICT',
 VILLAGE = 'VILLAGE'
}

// Constants
const policyLevelMap: Record<PolicyLevel, string> = {
 [PolicyLevel.NATIONAL]: 'ระดับประเทศ',
 [PolicyLevel.HEALTH_REGION]: 'ระดับเขตสุขภาพ',
 [PolicyLevel.PROVINCIAL]: 'ระดับจังหวัด',
 [PolicyLevel.DISTRICT]: 'ระดับอำเภอ',
 [PolicyLevel.SUB_DISTRICT]: 'ระดับตำบล',
 [PolicyLevel.VILLAGE]: 'ระดับหมู่บ้าน'
};

const policyLevelColors: Record<PolicyLevel, string> = {
 [PolicyLevel.NATIONAL]: 'red',
 [PolicyLevel.HEALTH_REGION]: 'orange',
 [PolicyLevel.PROVINCIAL]: 'green',
 [PolicyLevel.DISTRICT]: 'blue',
 [PolicyLevel.SUB_DISTRICT]: 'purple',
 [PolicyLevel.VILLAGE]: 'cyan'
};

const contentTypeMap: Record<string, string> = {
 LAW_ENFORCEMENT: 'การบังคับใช้กฎหมาย',
 ALCOHOL_FREE_TRADITION: 'งานบุญประเพณีปลอดเหล้า',
 ALCOHOL_FREE_MERIT: 'งานบุญปลอดเหล้า',
 CHILD_YOUTH_PROTECTION: 'การป้องกันเด็กและเยาวชน',
 CREATIVE_SPACE: 'พื้นที่สร้างสรรค์'
};

export default function DataTablePublicPolicy({
 title,
 data,
 columns,
 loading = false,
 onOpenPolicyFile,
 onOpenVideoLink
}: DataTableProps) {
 const isMobile = useMediaQuery({ maxWidth: 768 });
 const [searchText, setSearchText] = useState('');
 const [selectedRegion, setSelectedRegion] = useState<string>();
 const [selectedProvince, setSelectedProvince] = useState<string>();
 const [selectedDistrict, setSelectedDistrict] = useState<string>();
 const [selectedSubDistrict, setSelectedSubDistrict] = useState<string>();
 const [selectedLevel, setSelectedLevel] = useState<PolicyLevel>();

 // Get unique values for filters 
 const regions = Array.from(new Set(data.map(item => item.type)));
 const provinces = Array.from(new Set(data.map(item => item.province)));
 const districts = Array.from(new Set(data.map(item => item.amphoe)));
 const subDistricts = Array.from(new Set(data.map(item => item.district)));
 const levels = Object.values(PolicyLevel);

 // Filter data
 const filteredData = data.filter(item => {
   const matchesSearch = Object.values(item).some(
     value => value?.toString().toLowerCase().includes(searchText.toLowerCase())
   );
   const matchesRegion = !selectedRegion || item.type === selectedRegion;
   const matchesProvince = !selectedProvince || item.province === selectedProvince;
   const matchesDistrict = !selectedDistrict || item.amphoe === selectedDistrict;
   const matchesSubDistrict = !selectedSubDistrict || item.district === selectedSubDistrict;
   const matchesLevel = !selectedLevel || item.level === selectedLevel;

   return matchesSearch && matchesRegion && matchesProvince && matchesDistrict &&
          matchesSubDistrict && matchesLevel;
 });

 const exportToExcel = () => {
   const exportData = filteredData.map(item => ({
     'ชื่อนโยบาย': item.name,
     'ระดับนโยบาย': policyLevelMap[item.level],
     'เขตสุขภาพ': item.healthRegion,
     'จังหวัด': item.province,
     'อำเภอ': item.amphoe,
     'ตำบล': item.district,
     'หมู่บ้าน': item.village,
     'วันที่ลงนาม': new Date(item.signingDate).toLocaleDateString('th-TH'),
     'สรุป': item.summary,
     'ผลลัพธ์': item.results,
   }));

   const ws = XLSX.utils.json_to_sheet(exportData);
   const wb = XLSX.utils.book_new();
   XLSX.utils.book_append_sheet(wb, ws, 'Data');
   XLSX.writeFile(wb, `${title}.xlsx`);
 };

 const exportToCSV = () => {
   const exportData = filteredData.map(item => ({
     'ชื่อนโยบาย': item.name,
     'ระดับนโยบาย': policyLevelMap[item.level],
     'เขตสุขภาพ': item.healthRegion,
     'จังหวัด': item.province,
     'อำเภอ': item.amphoe,
     'ตำบล': item.district,
     'หมู่บ้าน': item.village,
     'วันที่ลงนาม': new Date(item.signingDate).toLocaleDateString('th-TH'),
     'สรุป': item.summary,
     'ผลลัพธ์': item.results,
   }));

   const ws = XLSX.utils.json_to_sheet(exportData);
   const csv = XLSX.utils.sheet_to_csv(ws);
   const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
   const link = document.createElement('a');
   link.href = URL.createObjectURL(blob);
   link.download = `${title}.csv`;
   link.click();
 };

 const renderMobileCard = (item: PublicPolicy) => (
   <Card 
     hoverable 
     className="mb-4 shadow-sm"
     key={item.id}
   >
     {/* ส่วนหัวการ์ด */}
     <div className="border-b pb-3 mb-3">
       <h3 className="text-lg font-bold text-green-800">{item.name}</h3>
       <Tag color={policyLevelColors[item.level]}>
         {policyLevelMap[item.level]}
       </Tag>
       <div className="text-sm text-gray-500">
         วันที่ลงนาม: {new Date(item.signingDate).toLocaleDateString('th-TH')}
       </div>
     </div>

     {/* รายละเอียดพื้นที่ */}
     <div className="grid grid-cols-2 gap-2 mb-3">
       {item.healthRegion && (
         <div className="col-span-2">
           <div className="text-gray-500 text-sm">เขตสุขภาพ</div>
           <div>{item.healthRegion}</div>
         </div>
       )}
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

     {/* เนื้อหานโยบาย */}
     {Array.isArray(item.content) && item.content.length > 0 && (
       <div className="mb-3">
         <div className="text-gray-500 text-sm mb-2">เนื้อหานโยบาย</div>
         <Space wrap>
           {item.content.map((content: string, index: number) => (
             <Tag key={index} color="blue">
               {Object.prototype.hasOwnProperty.call(contentTypeMap, content) 
                 ? contentTypeMap[content] 
                 : content}
             </Tag>
           ))}
         </Space>
       </div>
     )}

     {/* สรุปและผลลัพธ์ */}
     {item.summary && (
       <div className="mb-3">
         <div className="text-gray-500 text-sm">สรุป</div>
         <div className="text-sm whitespace-pre-wrap">{item.summary}</div>
       </div>
     )}
     {item.results && (
       <div className="mb-3">
         <div className="text-gray-500 text-sm">ผลลัพธ์</div>
         <div className="text-sm whitespace-pre-wrap">{item.results}</div>
       </div>
     )}
     
     {/* ไฟล์และลิงก์ */}
     <div className="flex gap-2">
       {item.policyFileUrl && (
         <Button 
           type="primary"
           size="small"
           onClick={() => onOpenPolicyFile(item.policyFileUrl)}
         >
           ดูไฟล์
         </Button>
       )}
       {item.videoLink && (
         <Button
           type="primary"
           size="small"
           onClick={() => onOpenVideoLink(item.videoLink)}
         >
           วิดีโอ
         </Button>
       )}
     </div>
   </Card>
 );

 return (
   <div className="space-y-4 p-4">
     <Title level={2} className="text-green-800">{title}</Title>
     
     <div className="flex flex-col space-y-4">
       <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
         <Input
           placeholder="ค้นหา..."
           value={searchText}
           onChange={e => setSearchText(e.target.value)}
           prefix={<SearchOutlined />}
           className="w-full"
         />
         <Select
           allowClear
           placeholder="ระดับนโยบาย"
           value={selectedLevel}
           onChange={setSelectedLevel}
           options={levels.map(level => ({ 
             label: policyLevelMap[level], 
             value: level 
           }))}
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