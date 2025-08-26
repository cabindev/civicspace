//app/dashboard/data-tables/creative-activities/page.tsx
'use client';

import { useEffect, useState, useTransition } from 'react';
import { Space, Button } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { FilePdfOutlined, EyeOutlined } from '@ant-design/icons';
import DataTableCreativeActivities from '@/app/components/shared/DataTable-creative-activities';

// Server Actions
import { getCreativeActivities } from '@/app/lib/actions/creative-activity/get';

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

export default function CreativeActivitiesPage() {
  const [data, setData] = useState<CreativeActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    startTransition(async () => {
      try {
        const result = await getCreativeActivities();
        if (result.success) {
          setData(result.data);
        } else {
          console.error('Error fetching data:', result.error);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    });
  };

  const handleOpenFile = (url: string | null | undefined): void => {
    if (url) window.open(url, '_blank');
  };

  const handleOpenVideo = (url: string | null | undefined): void => {
    if (url) window.open(url, '_blank');
  };

  const columns: ColumnsType<CreativeActivity> = [
    {
      title: 'หมวดหมู่',
      dataIndex: ['category', 'name'],
      key: 'category',
      width: 120,
    },
    {
      title: 'หมวดหมู่ย่อย',
      dataIndex: ['subCategory', 'name'],
      key: 'subCategory',
      width: 120,
    },
    {
      title: 'ชื่อกิจกรรม',
      dataIndex: 'name',
      key: 'name',
      fixed: 'left',
      width: 150,
    },
    {
      title: 'ภาค',
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
      title: 'ผู้ประสานงาน',
      key: 'coordinator',
      width: 150,
      render: (_, record) => (
        <div>
          {record.coordinatorName}
          {record.phone && <div className="text-sm text-gray-500">{record.phone}</div>}
        </div>
      ),
    },
    {
      title: 'รายละเอียด',
      dataIndex: 'description',
      key: 'description',
      width: 200,
      ellipsis: true,
    },
    {
      title: 'สรุป',
      dataIndex: 'summary',
      key: 'summary',
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
          {record.reportFileUrl && (
            <Button 
              type="link" 
              size="small"
              icon={<FilePdfOutlined />} 
              onClick={() => handleOpenFile(record.reportFileUrl)}
              className="text-green-600 hover:text-green-700 text-xs font-light"
            >
              ดูรายงาน
            </Button>
          )}
          {record.videoLink && (
            <Button 
              type="link" 
              size="small"
              icon={<EyeOutlined />} 
              onClick={() => handleOpenVideo(record.videoLink)}
              className="text-green-600 hover:text-green-700 text-xs font-light"
            >
              วิดีโอ
            </Button>
          )}
        </Space>
      ),
    },
  ];

  return (
    <DataTableCreativeActivities
      title="กิจกรรมสร้างสรรค์"
      data={data}
      columns={columns}
      loading={loading}
      onOpenFile={handleOpenFile}
      onOpenVideo={handleOpenVideo}
    />
  );
}