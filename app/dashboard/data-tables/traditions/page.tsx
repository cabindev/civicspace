// app/dashboard/data-tables/traditions/page.tsx
'use client';

import { useEffect, useState, useTransition } from 'react';
import { Space, Tag, Button } from 'antd';
import { FilePdfOutlined, EyeOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import DataTable from '@/app/components/shared/DataTable-Tradition';

// Server Actions
import { getTraditions } from '@/app/lib/actions/tradition/get';

interface Tradition {
  id: string;
  name: string;
  province: string;
  type: string;
  district: string;
  amphoe: string;
  startYear: number;
  category: { name: string };
  coordinatorName: string;
  phone: string;
  history: string;
  alcoholFreeApproach: string;
  results: string;
  hasPolicy: boolean;
  hasAnnouncement: boolean;
  hasInspector: boolean;
  hasMonitoring: boolean;
  hasCampaign: boolean;
  hasAlcoholPromote: boolean;
  village: string;
  policyFileUrl: string;
  videoLink: string;
  images: { id: string; url: string }[];
}

export default function TraditionsPage() {
  const [data, setData] = useState<Tradition[]>([]);
  const [loading, setLoading] = useState(true);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    startTransition(async () => {
      try {
        const result = await getTraditions();
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

  const openPolicyFile = (url: string) => {
    window.open(url, '_blank');
  };

  const columns: ColumnsType<Tradition> = [
    {
      title: 'ชื่อ',
      dataIndex: 'name',
      key: 'name',
      fixed: 'left',
      width: 200,
    },
    {
      title: 'หมวดหมู่',
      dataIndex: ['category', 'name'],
      key: 'category',
      width: 150,
    },
    {
      title: 'ภาค',
      dataIndex: 'type',
      key: 'type',
      width: 100,
    },
    {
      title: 'จังหวัด',
      dataIndex: 'province',
      key: 'province',
      width: 100,
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
      title: 'ปีที่เริ่ม',
      dataIndex: 'startYear',
      key: 'startYear',
      width: 100,
    },
    {
      title: 'ผู้ประสานงาน',
      dataIndex: 'coordinatorName',
      key: 'coordinatorName',
      width: 150,
    },
    {
      title: 'เบอร์โทร',
      dataIndex: 'phone',
      key: 'phone',
      width: 120,
    },

    {
      title: 'ผลลัพธ์',
      dataIndex: 'results',
      key: 'results',
      width: 200,
      ellipsis: true,
    },
    {
        title: 'สถานะการดำเนินงาน',
        key: 'status',
        width: 250,
        render: (_, record) => (
          <div className="space-y-1">
            <div>
              <Tag color={record.hasPolicy ? "green" : "red"}>
                {record.hasPolicy ? "✓ มีนโยบาย" : "✗ ไม่มีนโยบาย"}
              </Tag>
            </div>
            <div>
              <Tag color={record.hasAnnouncement ? "blue" : "red"}>
                {record.hasAnnouncement ? "✓ มีประกาศ" : "✗ ไม่มีประกาศ"}
              </Tag>
            </div>
            <div>
              <Tag color={record.hasInspector ? "purple" : "red"}>
                {record.hasInspector ? "✓ มีผู้ตรวจการ" : "✗ ไม่มีผู้ตรวจการ"}
              </Tag>
            </div>
            <div>
              <Tag color={record.hasMonitoring ? "orange" : "red"}>
                {record.hasMonitoring ? "✓ มีการติดตาม" : "✗ ไม่มีการติดตาม"}
              </Tag>
            </div>
            <div>
              <Tag color={record.hasCampaign ? "magenta" : "red"}>
                {record.hasCampaign ? "✓ มีการรณรงค์" : "✗ ไม่มีการรณรงค์"}
              </Tag>
            </div>
            <div>
              <Tag color={record.hasAlcoholPromote ? "cyan" : "red"}>
                {record.hasAlcoholPromote ? "✓ มีการจัดการเครื่องดื่มแอลกอฮอล์" : "✗ ไม่มีการจัดการเครื่องดื่มแอลกอฮอล์"}
              </Tag>
            </div>
          </div>
        ),
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
              size="small"
              icon={<FilePdfOutlined />} 
              onClick={() => openPolicyFile(record.policyFileUrl)}
              className="text-green-600 hover:text-green-700 text-xs font-light"
            >
              ดูไฟล์
            </Button>
          )}
          {record.videoLink && (
            <Button 
              type="link" 
              size="small"
              icon={<EyeOutlined />} 
              onClick={() => window.open(record.videoLink, '_blank')}
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
    <DataTable
      title="งานบุญประเพณี"
      data={data}
      columns={columns}
      loading={loading}
    />
  );
}