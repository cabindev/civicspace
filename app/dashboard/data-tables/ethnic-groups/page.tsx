'use client';

import { useEffect, useState } from 'react';
import { Space, Button } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { FilePdfOutlined, EyeOutlined } from '@ant-design/icons';
import DataTableEthnicGroup from '@/app/components/shared/DataTable-ethnic-group';

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

export default function EthnicGroupPage() {
  const [data, setData] = useState<EthnicGroup[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const response = await fetch('/api/ethnic-group');
      const result = await response.json();
      setData(result);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenFile = (url: string | null | undefined): void => {
    if (url) window.open(url, '_blank');
  };

  const handleOpenVideo = (url: string | null | undefined): void => {
    if (url) window.open(url, '_blank');
  };

  const columns: ColumnsType<EthnicGroup> = [
    {
      title: 'หมวดหมู่',
      dataIndex: ['category', 'name'],
      key: 'category',
      width: 120,
    },
    {
      title: 'ชื่อกิจกรรม',
      dataIndex: 'activityName',
      key: 'activityName',
      fixed: 'left',
      width: 150,
    },
    {
      title: 'ชื่อกลุ่มชาติพันธุ์',
      dataIndex: 'name',
      key: 'name',
      width: 150,
    },
    {
      title: 'ประเภท',
      dataIndex: 'type',
      key: 'type',
      width: 120,
    },
    {
      title: 'ปีที่เริ่ม',
      dataIndex: 'startYear',
      key: 'startYear',
      width: 100,
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
      title: 'ประวัติความเป็นมา',
      dataIndex: 'history',
      key: 'history',
      width: 200,
      ellipsis: true,
    },
    {
      title: 'ที่มาของกิจกรรม',
      dataIndex: 'activityOrigin',
      key: 'activityOrigin',
      width: 200,
      ellipsis: true,
    },
    {
      title: 'รายละเอียดกิจกรรม',
      dataIndex: 'activityDetails',
      key: 'activityDetails',
      width: 200,
      ellipsis: true,
    },
    {
      title: 'แนวทางการจัดงานปลอดเหล้า',
      dataIndex: 'alcoholFreeApproach',
      key: 'alcoholFreeApproach',
      width: 200,
      ellipsis: true,
    },
    {
      title: 'ผลที่เกิดขึ้น',
      dataIndex: 'results',
      key: 'results',
      width: 200,
      ellipsis: true,
    },
 
    {
      title: 'ไฟล์/ลิงก์',
      key: 'actions',
      fixed: 'right',
      width: 120,
      render: (_, record) => (
        <Space>
          {record.fileUrl && (
            <Button 
              type="link" 
              icon={<FilePdfOutlined />} 
              onClick={() => handleOpenFile(record.fileUrl)}
            >
              ดูไฟล์
            </Button>
          )}
          {record.videoLink && (
            <Button 
              type="link" 
              icon={<EyeOutlined />} 
              onClick={() => handleOpenVideo(record.videoLink)}
            >
              วิดีโอ
            </Button>
          )}
        </Space>
      ),
    },
  ];

  return (
    <DataTableEthnicGroup
      title="ข้อมูลกิจกรรมกลุ่มชาติพันธุ์"
      data={data}
      columns={columns}
      loading={loading}
      onOpenFile={handleOpenFile}
      onOpenVideo={handleOpenVideo}
    />
  );
}