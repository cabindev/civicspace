// app/dashboard/ethnic-group/components/EthnicGroupClient.tsx
'use client'

import { useState, useTransition } from 'react';
import { Table, Button, message, Modal, Space, Typography } from 'antd';
import { EyeOutlined, EditOutlined, DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import Link from 'next/link';
import { useMediaQuery } from 'react-responsive';

// Server Actions
import { getEthnicGroups } from '@/app/lib/actions/ethnic-group/get';
import { deleteEthnicGroup } from '@/app/lib/actions/ethnic-group/delete';

const { Text } = Typography;

interface EthnicGroup {
  id: string;
  name: string;
  category: { name: string };
  province: string;
  startYear: number;
  createdAt: string;
  images?: { id: string; url: string }[];
}

interface EthnicGroupClientProps {
  initialEthnicGroups: EthnicGroup[];
}

export default function EthnicGroupClient({ initialEthnicGroups }: EthnicGroupClientProps) {
  const [ethnicGroups, setEthnicGroups] = useState<EthnicGroup[]>(initialEthnicGroups);
  const [selectedEthnicGroup, setSelectedEthnicGroup] = useState<EthnicGroup | null>(null);
  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
  const [isPending, startTransition] = useTransition();
  const isMobile = useMediaQuery({ maxWidth: 768 });

  const fetchEthnicGroups = async () => {
    startTransition(async () => {
      try {
        const result = await getEthnicGroups();
        if (result.success) {
          // Sort by createdAt descending to show newest first
          const sortedEthnicGroups = result.data.sort((a: EthnicGroup, b: EthnicGroup) => 
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
          setEthnicGroups(sortedEthnicGroups);
        } else {
          message.error('ไม่สามารถโหลดข้อมูลกลุ่มชาติพันธุ์ได้');
        }
      } catch (error) {
        console.error('Error fetching ethnic groups:', error);
        message.error('ไม่สามารถโหลดข้อมูลกลุ่มชาติพันธุ์ได้');
      }
    });
  };

  const handleDelete = async (id: string) => {
    startTransition(async () => {
      try {
        const result = await deleteEthnicGroup(id);
        if (result.success) {
          message.success('ลบข้อมูลกลุ่มชาติพันธุ์สำเร็จ');
          await fetchEthnicGroups(); // Refresh the list
        } else {
          message.error(result.error || 'ไม่สามารถลบข้อมูลกลุ่มชาติพันธุ์ได้');
        }
      } catch (error) {
        console.error('Error deleting ethnic group:', error);
        message.error('ไม่สามารถลบข้อมูลกลุ่มชาติพันธุ์ได้');
      }
    });
  };

  const showDeleteModal = (ethnicGroup: EthnicGroup) => {
    setSelectedEthnicGroup(ethnicGroup);
    setIsDeleteModalVisible(true);
  };

  const columns = [
    {
      title: 'ลำดับ',
      key: 'index',
      render: (_: any, __: any, index: number) => index + 1,
      width: '5%',
    },
    {
      title: 'ชื่อ',
      dataIndex: 'name',
      key: 'name',
      render: (text: string, record: EthnicGroup, index: number) => (
        <span>
          {text}
          {index === 0 && <span className="ml-2 text-xs text-green-600 font-bold">ล่าสุด</span>}
        </span>
      ),
      width: '25%',
    },
    {
      title: 'กลุ่มชาติพันธุ์',
      dataIndex: ['category', 'name'],
      key: 'category',
      width: '15%',
    },
    {
      title: 'จังหวัด',
      dataIndex: 'province',
      key: 'province',
      width: '15%',
    },
    {
      title: 'ปีที่เริ่ม',
      dataIndex: 'startYear',
      key: 'startYear',
      width: '7%',
    },
    {
      title: 'การจัดการ',
      key: 'action',
      render: (_: any, record: EthnicGroup) => (
        <Space size="small">
          <Link href={`/dashboard/ethnic-group/${record.id}`}>
            <Button 
              icon={<EyeOutlined />} 
              type="primary" 
              size="small" 
              className="bg-green-600 hover:bg-green-700 border-green-600 hover:border-green-700" 
            />
          </Link>
          <Link href={`/dashboard/ethnic-group/edit/${record.id}`}>
            <Button 
              icon={<EditOutlined />} 
              size="small" 
              className="bg-green-600 hover:bg-green-700 text-white border-green-600 hover:border-green-700" 
            />
          </Link>
          <Button 
            icon={<DeleteOutlined />} 
            onClick={() => showDeleteModal(record)} 
            danger 
            size="small"
            loading={isPending}
          />
        </Space>
      ),
      width: '8%',
    },
  ];

  const MobileCard = ({ ethnicGroup, index }: { ethnicGroup: EthnicGroup; index: number }) => (
    <div className="card bg-base-100 shadow-xl mb-4 border border-green-100">
      <figure className="h-48">
        {ethnicGroup.images && ethnicGroup.images.length > 0 ? (
          <img
            src={ethnicGroup.images[0].url}
            alt={ethnicGroup.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-green-50 flex items-center justify-center text-green-600">
            No Image Available
          </div>
        )}
      </figure>
      <div className="card-body p-4">
        <h2 className="card-title text-green-700 text-lg">
          {index + 1}. {ethnicGroup.name}
          {index === 0 && (
            <div className="badge badge-success text-white text-xs">ล่าสุด</div>
          )}
        </h2>
        
        <div className="space-y-3 mt-2">
          {/* ประเภท */}
          <div className="flex flex-wrap gap-2">
            <div className="badge badge-primary text-white">{ethnicGroup.category.name}</div>
          </div>
          
          {/* ข้อมูลพื้นที่ */}
          <div className="text-sm space-y-1 text-gray-600">
            <p className="flex items-center gap-2">
              <span className="font-semibold text-green-700">จังหวัด:</span> 
              <span className="badge badge-outline text-green-600 border-green-600">
                {ethnicGroup.province}
              </span>
            </p>
            <p className="flex items-center gap-2">
              <span className="font-semibold text-green-700">เริ่มปี:</span> 
              {ethnicGroup.startYear}
            </p>
          </div>
        </div>

        <div className="card-actions justify-end mt-4">
          <Link href={`/dashboard/ethnic-group/${ethnicGroup.id}`}>
            <button className="btn btn-primary btn-sm text-white hover:bg-green-700">
              <EyeOutlined className="mr-1" />
              ดู
            </button>
          </Link>
          <Link href={`/dashboard/ethnic-group/edit/${ethnicGroup.id}`}>
            <button className="btn bg-green-500 text-white btn-sm hover:bg-green-600">
              <EditOutlined className="mr-1" />
              แก้ไข
            </button>
          </Link>
          <button 
            className="btn btn-error btn-sm text-white"
            onClick={() => showDeleteModal(ethnicGroup)}
            disabled={isPending}
          >
            <DeleteOutlined className="mr-1" />
            ลบ
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-green-700 hidden sm:block">
          กลุ่มชาติพันธุ์
        </h1>
        <Link href="/dashboard/ethnic-group/create">
          <button className="btn btn-primary text-white hover:bg-green-700">
            <PlusOutlined className="mr-2" />
            เพิ่มกลุ่มชาติพันธุ์
          </button>
        </Link>
      </div>

      {isMobile ? (
        <div className="grid gap-4">
          {ethnicGroups.map((ethnicGroup, index) => (
            <MobileCard key={ethnicGroup.id} ethnicGroup={ethnicGroup} index={index} />
          ))}
        </div>
      ) : (
        <div className="bg-base-100 rounded-lg shadow-lg">
          <Table 
            columns={columns} 
            dataSource={ethnicGroups} 
            rowKey="id"
            loading={isPending}
            pagination={{
              total: ethnicGroups.length,
              pageSize: 10,
              showSizeChanger: false,
              showQuickJumper: true,
            }}
            className="overflow-x-auto"
          />
        </div>
      )}

      <Modal
        title={<span className="text-green-700">ยืนยันการลบ</span>}
        open={isDeleteModalVisible}
        onOk={() => {
          if (selectedEthnicGroup) handleDelete(selectedEthnicGroup.id);
          setIsDeleteModalVisible(false);
        }}
        onCancel={() => setIsDeleteModalVisible(false)}
        okText="ลบ"
        cancelText="ยกเลิก"
        confirmLoading={isPending}
        okButtonProps={{ className: 'bg-red-500 hover:bg-red-600' }}
        cancelButtonProps={{ 
          className: 'border-green-500 text-green-500 hover:border-green-600 hover:text-green-600' 
        }}
      >
        <p>คุณแน่ใจหรือไม่ที่จะลบกลุ่มชาติพันธุ์ "{selectedEthnicGroup?.name}"?</p>
      </Modal>
    </div>
  );
}