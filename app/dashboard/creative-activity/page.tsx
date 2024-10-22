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
    <Card
      hoverable
      className="mb-4"
      actions={[
        <Link key="view" href={`/dashboard/creative-activity/${activity.id}`}>
          <EyeOutlined />
        </Link>,
        <Link key="edit" href={`/dashboard/creative-activity/edit/${activity.id}`}>
          <EditOutlined />
        </Link>,
        <DeleteOutlined key="delete" onClick={() => showDeleteModal(activity)} />,
      ]}
    >
      <Card.Meta
        avatar={
          activity.images && activity.images.length > 0 ? (
            <Avatar src={activity.images[0].url} size={64} />
          ) : (
            <Avatar size={64}>No img</Avatar>
          )
        }
        title={
          <span>
            {index + 1}. {activity.name}
            {index === 0 && <span className="ml-2 text-xs text-green-600 font-bold">ล่าสุด</span>}
          </span>
        }
        description={
          <>
            <Text>{activity.category.name} | {activity.subCategory.name}</Text>
            <br />
            <Text>{activity.province} | {activity.type}</Text>
            <br />
            <Text>เริ่มปี {activity.startYear}</Text>
          </>
        }
      />
    </Card>
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
      <h1 className="text-2xl font-bold hidden sm:block">Creative Activity</h1>
        <Link href="/dashboard/creative-activity/create">
          <Button type="primary" icon={<PlusOutlined />}>
            เพิ่มกิจกรรมสร้างสรรค์
          </Button>
        </Link>
      </div>

      {isMobile ? (
        activities.map((activity, index) => (
          <MobileCard key={activity.id} activity={activity} index={index} />
        ))
      ) : (
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
      )}

      <Modal
        title="ยืนยันการลบ"
        open={isDeleteModalVisible}
        onOk={() => {
          if (selectedActivity) handleDelete(selectedActivity.id);
          setIsDeleteModalVisible(false);
        }}
        onCancel={() => setIsDeleteModalVisible(false)}
        okText="ลบ"
        cancelText="ยกเลิก"
      >
        <p>คุณแน่ใจหรือไม่ที่จะลบกิจกรรมสร้างสรรค์ "{selectedActivity?.name}"?</p>
      </Modal>
    </div>
  );
}