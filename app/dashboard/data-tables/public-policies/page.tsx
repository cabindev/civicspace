// app/dashboard/data-tables/public-policies/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { Space, Tag, Button } from 'antd';
import { FilePdfOutlined, EyeOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import DataTablePublicPolicy from '@/app/components/shared/DataTable-public-policies';

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

export default function PublicPoliciesPage() {
  const [data, setData] = useState<PublicPolicy[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const response = await fetch('/api/public-policy');
      const result = await response.json();
      setData(result);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenPolicyFile = (url: string | null | undefined): void => {
    if (url) window.open(url, '_blank');
  };

  const handleOpenVideoLink = (url: string | null | undefined): void => {
    if (url) window.open(url, '_blank');
  };

  const columns: ColumnsType<PublicPolicy> = [
    {
      title: 'ชื่อนโยบาย',
      dataIndex: 'name',
      key: 'name',
      fixed: 'left',
      width: 200,
    },
    {
      title: 'วันที่ลงนาม',
      dataIndex: 'signingDate',
      key: 'signingDate',
      width: 120,
      render: (date: string) => new Date(date).toLocaleDateString('th-TH'),
    },
    {
      title: 'ระดับนโยบาย',
      dataIndex: 'level',
      key: 'level',
      width: 120,
      render: (level: PolicyLevel) => (
        <Tag color={policyLevelColors[level]}>
          {policyLevelMap[level]}
        </Tag>
      ),
    },
    {
      title: 'เขตสุขภาพ',
      dataIndex: 'healthRegion',
      key: 'healthRegion',
      width: 120,
    },
    {
      title: 'ประเภท',
      dataIndex: 'type',
      key: 'type',
      width: 120,
    },
    {
      title: 'จังหวัด',
      dataIndex: 'province',
      key: 'province',
      width: 120,
    },
    {
      title: 'อำเภอ',
      dataIndex: 'amphoe',
      key: 'amphoe',
      width: 120,
    },
    {
      title: 'ตำบล',
      dataIndex: 'district',
      key: 'district',
      width: 120,
    },
    {
      title: 'หมู่บ้าน',
      dataIndex: 'village',
      key: 'village',
      width: 120,
    },
    {
      title: 'เนื้อหา',
      key: 'content',
      width: 200,
      render: (_, record) => (
        <Space wrap>
          {record.content.map((item: string, index: number) => (
            <Tag key={index} color="blue">
              {contentTypeMap[item] || item}
            </Tag>
          ))}
        </Space>
      ),
    },
    {
      title: 'สรุป',
      dataIndex: 'summary',
      key: 'summary',
      width: 200,
      ellipsis: true,
    },
    {
      title: 'ผลลัพธ์',
      dataIndex: 'results',
      key: 'results',
      width: 200,
      ellipsis: true,
    },
    {
      title: 'จำนวนการเข้าชม',
      dataIndex: 'viewCount',
      key: 'viewCount',
      width: 120,
    },
    {
      title: 'ไฟล์/ลิงก์',
      key: 'files',
      width: 120,
      render: (_, record) => (
        <Space>
          {record.policyFileUrl && (
            <Button 
              type="link" 
              icon={<FilePdfOutlined />} 
              onClick={() => handleOpenPolicyFile(record.policyFileUrl)}
            >
              ดูไฟล์
            </Button>
          )}
          {record.videoLink && (
            <Button 
              type="link" 
              icon={<EyeOutlined />} 
              onClick={() => handleOpenVideoLink(record.videoLink)}
            >
              วิดีโอ
            </Button>
          )}
        </Space>
      ),
    },
  ];

  return (
    <DataTablePublicPolicy
      title="นโยบายสาธารณะ"
      data={data}
      columns={columns}
      loading={loading}
      onOpenPolicyFile={handleOpenPolicyFile}
      onOpenVideoLink={handleOpenVideoLink}
    />
  );
}