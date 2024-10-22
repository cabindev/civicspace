'use client'

import { useState, useEffect } from 'react';
import { Table, Button, Spin, message, Modal, Space, Typography, Card, Avatar } from 'antd';
import { EyeOutlined, EditOutlined, DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import Link from 'next/link';
import axios from 'axios';
import { useMediaQuery } from 'react-responsive';

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
  const [selectedTradition, setSelectedTradition] = useState<Tradition | null>(null);
  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
  const isMobile = useMediaQuery({ maxWidth: 768 });

  useEffect(() => {
    fetchTraditions();
  }, []);

  const fetchTraditions = async () => {
    try {
      const response = await axios.get('/api/tradition');
      // เรียงลำดับข้อมูลตาม createdAt จากใหม่ไปเก่า
      const sortedTraditions = response.data.sort((a: Tradition, b: Tradition) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      setTraditions(sortedTraditions);
    } catch (error) {
      message.error('ไม่สามารถโหลดข้อมูลงานบุญประเพณีได้');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await axios.delete(`/api/tradition/${id}`);
      message.success('ลบข้อมูลงานบุญประเพณีสำเร็จ');
      fetchTraditions();
    } catch (error) {
      message.error('ไม่สามารถลบข้อมูลงานบุญประเพณีได้');
    }
  };

  const showDeleteModal = (tradition: Tradition) => {
    setSelectedTradition(tradition);
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
      title: 'ประเภท',
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
    <Card
      hoverable
      className="mb-4"
      actions={[
        <Link key="view" href={`/dashboard/tradition/${tradition.id}`}>
          <EyeOutlined />
        </Link>,
        <Link key="edit" href={`/dashboard/tradition/edit/${tradition.id}`}>
          <EditOutlined />
        </Link>,
        <DeleteOutlined key="delete" onClick={() => showDeleteModal(tradition)} />,
      ]}
    >
      <Card.Meta
        avatar={
          tradition.images && tradition.images.length > 0 ? (
            <Avatar src={tradition.images[0].url} size={64} />
          ) : (
            <Avatar size={64}>No img</Avatar>
          )
        }
        title={
          <span>
            {index + 1}. {tradition.name}
            {index === 0 && <span className="ml-2 text-xs text-green-600 font-bold">ล่าสุด</span>}
          </span>
        }
        description={
          <>
            <Text>{tradition.province} | {tradition.type}</Text>
            <br />
            <Text>เริ่มปี {tradition.startYear}</Text>
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
        <Title className="hidden sm:block" level={2}>Traditions</Title>
        <Link href="/dashboard/tradition/create">
          <Button type="primary" icon={<PlusOutlined />}>
            เพิ่มงานบุญประเพณี
          </Button>
        </Link>
      </div>

      {isMobile ? (
        traditions.map((tradition, index) => (
          <MobileCard key={tradition.id} tradition={tradition} index={index} />
        ))
      ) : (
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
      )}

      <Modal
        title="ยืนยันการลบ"
        open={isDeleteModalVisible}
        onOk={() => {
          if (selectedTradition) handleDelete(selectedTradition.id);
          setIsDeleteModalVisible(false);
        }}
        onCancel={() => setIsDeleteModalVisible(false)}
        okText="ลบ"
        cancelText="ยกเลิก"
      >
        <p>คุณแน่ใจหรือไม่ที่จะลบงานบุญประเพณี "{selectedTradition?.name}"?</p>
      </Modal>
    </div>
  );
}