//dashboard/creative-activity/page.ts
'use client'

import { useState, useEffect } from 'react';
import { Table, Button, Spin, message, Modal, Space, Typography, Card, Avatar } from 'antd';
import { EyeOutlined, EditOutlined, DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import Link from 'next/link';
import axios from 'axios';
import { useMediaQuery } from 'react-responsive';

const { Title, Text } = Typography;

interface CreativeActivity {
  id: string;
  name: string;
  province: string;
  type: string;
  startYear: number;
  images?: { id: string; url: string }[];
  category: { name: string };
  subCategory: { name: string };
  coordinatorName: string;
  phone: string;
  createdAt: string;
}

export default function CreativeActivityList() {
  const [activities, setActivities] = useState<CreativeActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedActivity, setSelectedActivity] = useState<CreativeActivity | null>(null);
  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
  const isMobile = useMediaQuery({ maxWidth: 768 });

  useEffect(() => {
    fetchActivities();
  }, []);

  const fetchActivities = async () => {
    try {
      const response = await axios.get('/api/creative-activity');
      const sortedActivities = response.data.sort((a: CreativeActivity, b: CreativeActivity) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      setActivities(sortedActivities);
    } catch (error) {
      message.error('ไม่สามารถโหลดข้อมูลกิจกรรมสร้างสรรค์ได้');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await axios.delete(`/api/creative-activity/${id}`);
      message.success('ลบข้อมูลกิจกรรมสร้างสรรค์สำเร็จ');
      fetchActivities();
    } catch (error) {
      message.error('ไม่สามารถลบข้อมูลกิจกรรมสร้างสรรค์ได้');
    }
  };

  const showDeleteModal = (activity: CreativeActivity) => {
    setSelectedActivity(activity);
    setIsDeleteModalVisible(true);
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
      render: (text: string, record: CreativeActivity, index: number) => (
        <span>
          {text}
          {index === 0 && <span className="ml-2 text-xs text-green-600 font-bold">ล่าสุด</span>}
        </span>
      ),
    },
    {
      title: 'ประเภท',
      dataIndex: ['category', 'name'],
      key: 'category',
    },
    {
      title: 'หมวดหมู่ย่อย',
      dataIndex: ['subCategory', 'name'],
      key: 'subCategory',
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
      render: (_: any, record: CreativeActivity) => (
        <Space size="small">
          <Link href={`/dashboard/creative-activity/${record.id}`}>
            <Button icon={<EyeOutlined />} type="primary" size="small" />
          </Link>
          <Link href={`/dashboard/creative-activity/edit/${record.id}`}>
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

  const MobileCard = ({ activity, index }: { activity: CreativeActivity; index: number }) => (
    <div className="card bg-base-100 shadow-xl mb-4 border border-green-100">
      <figure className="h-48">
        {activity.images && activity.images.length > 0 ? (
          <img
            src={activity.images[0].url}
            alt={activity.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-green-50 flex items-center justify-center text-green-600">
            No Image Available
          </div>
        )}
      </figure>
      <div className="card-body">
        <h2 className="card-title text-green-700">
          {index + 1}. {activity.name}
          {index === 0 && (
            <div className="badge badge-success text-white">ล่าสุด</div>
          )}
        </h2>
        
        <div className="space-y-2">
          {/* ประเภทและหมวดหมู่ย่อย */}
          <div className="flex flex-wrap gap-2">
            <div className="badge badge-primary text-white">{activity.category.name}</div>
            <div className="badge badge-secondary text-white">{activity.subCategory.name}</div>
          </div>
          
          {/* ข้อมูลพื้นที่ */}
          <div className="flex flex-wrap gap-2">
            <div className="badge badge-outline text-green-600 border-green-600">{activity.province}</div>
            <div className="badge badge-outline text-green-600 border-green-600">{activity.type}</div>
          </div>
  
          {/* ข้อมูลผู้ประสานงาน */}
          <div className="text-sm space-y-1 text-gray-600">
            <p className="flex items-center gap-2">
              <span className="font-semibold text-green-700">ผู้ประสานงาน:</span> 
              {activity.coordinatorName}
            </p>
            <p className="flex items-center gap-2">
              <span className="font-semibold text-green-700">เบอร์โทร:</span> 
              {activity.phone}
            </p>
            <p className="flex items-center gap-2">
              <span className="font-semibold text-green-700">เริ่มปี:</span> 
              {activity.startYear}
            </p>
          </div>
        </div>
  
        <div className="card-actions justify-end mt-4">
          <Link href={`/dashboard/creative-activity/${activity.id}`}>
            <button className="btn btn-primary btn-sm text-white hover:bg-green-700">
              <EyeOutlined className="mr-1" />
              ดู
            </button>
          </Link>
          <Link href={`/dashboard/creative-activity/edit/${activity.id}`}>
            <button className="btn bg-green-500 text-white btn-sm hover:bg-green-600">
              <EditOutlined className="mr-1" />
              แก้ไข
            </button>
          </Link>
          <button 
            className="btn btn-error btn-sm text-white"
            onClick={() => showDeleteModal(activity)}
          >
            <DeleteOutlined className="mr-1" />
            ลบ
          </button>
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-4">
    <div className="flex justify-between items-center mb-6">
      <h1 className="text-2xl font-bold text-green-700 hidden sm:block">
        กิจกรรมสร้างสรรค์
      </h1>
      <Link href="/dashboard/creative-activity/create">
        <button className="btn btn-primary text-white hover:bg-green-700">
          <PlusOutlined className="mr-2" />
          เพิ่มกิจกรรมสร้างสรรค์
        </button>
      </Link>
    </div>
  
      {isMobile ? (
        <div className="grid gap-4">
          {activities.map((activity, index) => (
            <MobileCard key={activity.id} activity={activity} index={index} />
          ))}
        </div>
      ) : (
        <div className="bg-base-100 rounded-lg shadow">
          <Table
            columns={columns}
            dataSource={activities}
            rowKey="id"
            pagination={{
              total: activities.length,
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
    if (selectedActivity) handleDelete(selectedActivity.id);
    setIsDeleteModalVisible(false);
  }}
  onCancel={() => setIsDeleteModalVisible(false)}
  okText="ลบ"
  cancelText="ยกเลิก"
  okButtonProps={{ className: 'bg-red-500 hover:bg-red-600' }}
  cancelButtonProps={{ className: 'border-green-500 text-green-500 hover:border-green-600 hover:text-green-600' }}
>
  <p>คุณแน่ใจหรือไม่ที่จะลบกิจกรรมสร้างสรรค์ "{selectedActivity?.name}"?</p>
</Modal>
    </div>
  );
}