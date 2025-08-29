'use client'

import { useState, useEffect, useTransition } from 'react';
import { Table, Button, Spin, message, Modal, Space, Typography, Card, Avatar } from 'antd';
import { EyeOutlined, EditOutlined, DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import Link from 'next/link';
import { useMediaQuery } from 'react-responsive';

// Server Actions
import { getTraditions } from '@/app/lib/actions/tradition/get';
import { deleteTradition } from '@/app/lib/actions/tradition/delete';

const { Title, Text } = Typography;

interface Tradition {
  id: string;
  name: string;
  province: string;
  type: string;
  startYear: number;
  images?: { id: string; url: string }[];
  category: { name: string };
  coordinatorName: string;
  phone: string;
  createdAt: string; // เพิ่มฟิลด์นี้เพื่อเรียงลำดับตามวันที่สร้าง
}

export default function TraditionList() {
  const [traditions, setTraditions] = useState<Tradition[]>([]);
  const [loading, setLoading] = useState(true);
  const [isPending, startTransition] = useTransition();
  const [selectedTradition, setSelectedTradition] = useState<Tradition | null>(null);
  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
  const [imageErrors, setImageErrors] = useState<Set<string>>(new Set());
  const isMobile = useMediaQuery({ maxWidth: 768 });

  useEffect(() => {
    fetchTraditions();
  }, []);

  const fetchTraditions = async () => {
    startTransition(async () => {
      try {
        const result = await getTraditions();
        if (result.success) {
          // เรียงลำดับข้อมูลตาม createdAt จากใหม่ไปเก่า
          const sortedTraditions = result.data.sort((a: Tradition, b: Tradition) => 
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
          setTraditions(sortedTraditions);
        } else {
          message.error(result.error || 'ไม่สามารถโหลดข้อมูลงานบุญประเพณีได้');
        }
      } catch (error) {
        console.error('Error fetching traditions:', error);
        message.error('ไม่สามารถโหลดข้อมูลงานบุญประเพณีได้');
      } finally {
        setLoading(false);
      }
    });
  };

  const handleDelete = async (id: string) => {
    startTransition(async () => {
      try {
        const result = await deleteTradition(id);
        if (result.success) {
          message.success('ลบข้อมูลงานบุญประเพณีสำเร็จ');
          await fetchTraditions();
        } else {
          message.error(result.error || 'ไม่สามารถลบข้อมูลงานบุญประเพณีได้');
        }
      } catch (error) {
        console.error('Error deleting tradition:', error);
        message.error('ไม่สามารถลบข้อมูลงานบุญประเพณีได้');
      }
    });
  };

  const showDeleteModal = (tradition: Tradition) => {
    setSelectedTradition(tradition);
    setIsDeleteModalVisible(true);
  };

  const handleImageError = (url: string) => {
    setImageErrors(prev => new Set(Array.from(prev).concat(url)));
    console.warn('Failed to load image:', url);
  };

  const columns = [
    {
      title: 'ลำดับ',
      key: 'index',
      render: (_: any, __: any, index: number) => index + 1,
    },
    {
      title: 'ชื่อ',
      dataIndex: 'name',
      key: 'name',
      render: (text: string, record: Tradition, index: number) => (
        <span>
          {text}
          {index === 0 && <span className="ml-2 text-xs text-green-600 font-bold">ล่าสุด</span>}
        </span>
      ),
    },
    {
      title: 'หมวดหมู่',
      dataIndex: ['category', 'name'],
      key: 'category',
    },
    {
      title: 'จังหวัด',
      dataIndex: 'province',
      key: 'province',
    },
    {
      title: 'ภาค',
      dataIndex: 'type',
      key: 'type',
    },
    {
      title: 'ผู้ประสานงาน',
      dataIndex: 'coordinatorName',
      key: 'coordinatorName',
    },
    {
      title: 'เบอร์โทร',
      dataIndex: 'phone',
      key: 'phone',
    },
    {
      title: 'ปีที่เริ่ม',
      dataIndex: 'startYear',
      key: 'startYear',
    },
    {
      title: 'การจัดการ',
      key: 'action',
      render: (_: any, record: Tradition) => (
        <Space size="small">
          <Link href={`/dashboard/tradition/${record.id}`}>
            <Button icon={<EyeOutlined />} type="primary" size="small" />
          </Link>
          <Link href={`/dashboard/tradition/edit/${record.id}`}>
            <Button icon={<EditOutlined />} type="default" size="small" />
          </Link>
          <Button
            icon={<DeleteOutlined />}
            type="primary"
            danger
            size="small"
            onClick={() => showDeleteModal(record)}
          />
        </Space>
      )
    },
  ];

  const MobileCard = ({ tradition, index }: { tradition: Tradition; index: number }) => (
    <div className="card bg-base-100 shadow-xl mb-4 border border-green-100">
      <figure className="h-48">
        {tradition.images && tradition.images.length > 0 && !imageErrors.has(tradition.images[0].url) ? (
          <img
            src={tradition.images[0].url}
            alt={tradition.name}
            className="w-full h-full object-cover"
            onError={() => handleImageError(tradition.images?.[0]?.url || '')}
          />
        ) : (
          <div className="w-full h-full bg-green-50 flex items-center justify-center text-green-600">
            No Image Available
          </div>
        )}
      </figure>
      <div className="card-body">
        <h2 className="card-title text-green-700">
          {index + 1}. {tradition.name}
          {index === 0 && (
            <div className="badge badge-success text-white">ล่าสุด</div>
          )}
        </h2>
        
        <div className="space-y-2">
          {/* หมวดหมู่ */}
          <div className="flex flex-wrap gap-2">
            <div className="badge badge-primary text-white">{tradition.category.name}</div>
          </div>
          
          {/* ข้อมูลพื้นที่ */}
          <div className="flex flex-wrap gap-2">
            <div className="badge badge-outline text-green-600 border-green-600">{tradition.province}</div>
            <div className="badge badge-outline text-green-600 border-green-600">{tradition.type}</div>
          </div>
   
          {/* ข้อมูลผู้ประสานงาน */}
          <div className="text-sm space-y-1 text-gray-600">
            <p className="flex items-center gap-2">
              <span className="font-semibold text-green-700">ผู้ประสานงาน:</span> 
              {tradition.coordinatorName}
            </p>
            <p className="flex items-center gap-2">
              <span className="font-semibold text-green-700">เบอร์โทร:</span> 
              {tradition.phone}
            </p>
            <p className="flex items-center gap-2">
              <span className="font-semibold text-green-700">เริ่มปี:</span> 
              {tradition.startYear}
            </p>
          </div>
        </div>
   
        <div className="card-actions justify-end mt-4">
          <Link href={`/dashboard/tradition/${tradition.id}`}>
            <button className="btn btn-primary btn-sm text-white hover:bg-green-700">
              <EyeOutlined className="mr-1" />
              ดู
            </button>
          </Link>
          <Link href={`/dashboard/tradition/edit/${tradition.id}`}>
            <button className="btn bg-green-500 text-white btn-sm hover:bg-green-600">
              <EditOutlined className="mr-1" />
              แก้ไข
            </button>
          </Link>
          <button 
            className="btn btn-error btn-sm text-white"
            onClick={() => showDeleteModal(tradition)}
          >
            <DeleteOutlined className="mr-1" />
            ลบ
          </button>
        </div>
      </div>
    </div>
   );
   
   // ปรับส่วน return หลัก
   return (
    <div className="max-w-7xl mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-green-700 hidden sm:block">
          งานบุญประเพณี
        </h1>
        <Link href="/dashboard/tradition/create">
          <button className="btn btn-primary text-white hover:bg-green-700">
            <PlusOutlined className="mr-2" />
            เพิ่มงานบุญประเพณี
          </button>
        </Link>
      </div>
   
      {isMobile ? (
        <div className="grid gap-4">
          {traditions.map((tradition, index) => (
            <MobileCard key={tradition.id} tradition={tradition} index={index} />
          ))}
        </div>
      ) : (
        <div className="bg-base-100 rounded-lg shadow">
          <Table
            columns={columns}
            dataSource={traditions}
            rowKey="id"
            pagination={{
              total: traditions.length,
              pageSize: 10,
              showSizeChanger: false,
              showQuickJumper: true,
            }}
          />
        </div>
      )}
   
      <Modal
        title={<span className="text-green-700">ยืนยันการลบ</span>}
        open={isDeleteModalVisible}
        onOk={() => {
          if (selectedTradition) handleDelete(selectedTradition.id);
          setIsDeleteModalVisible(false);
        }}
        onCancel={() => setIsDeleteModalVisible(false)}
        okText="ลบ"
        cancelText="ยกเลิก"
        okButtonProps={{ className: 'bg-red-500 hover:bg-red-600' }}
        cancelButtonProps={{ className: 'border-green-500 text-green-500 hover:border-green-600 hover:text-green-600' }}
      >
        <p>คุณแน่ใจหรือไม่ที่จะลบงานบุญประเพณี "{selectedTradition?.name}"?</p>
      </Modal>
    </div>
   );
}