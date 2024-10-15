'use client'

import { useState, useEffect } from 'react';
import { Table, Button, Spin, message, Modal, Space, Typography } from 'antd';
import { EyeOutlined, EditOutlined, DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import Link from 'next/link';
import axios from 'axios';

const { Text } = Typography;

interface EthnicGroup {
  id: string;
  name: string;
  category: { name: string };
  province: string;
  startYear: number;
  createdAt: string; // เพิ่มฟิลด์นี้เพื่อใช้ในการเรียงลำดับ
}

export default function EthnicGroupList() {
  const [ethnicGroups, setEthnicGroups] = useState<EthnicGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedEthnicGroup, setSelectedEthnicGroup] = useState<EthnicGroup | null>(null);
  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);

  useEffect(() => {
    fetchEthnicGroups();
  }, []);

  const fetchEthnicGroups = async () => {
    try {
      const response = await axios.get('/api/ethnic-group');
      // เรียงลำดับข้อมูลตาม createdAt จากใหม่ไปเก่า
      const sortedEthnicGroups = response.data.sort((a: EthnicGroup, b: EthnicGroup) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      setEthnicGroups(sortedEthnicGroups);
    } catch (error) {
      message.error('ไม่สามารถโหลดข้อมูลกลุ่มชาติพันธุ์ได้');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await axios.delete(`/api/ethnic-group/${id}`);
      message.success('ลบข้อมูลกลุ่มชาติพันธุ์สำเร็จ');
      fetchEthnicGroups();
    } catch (error) {
      message.error('ไม่สามารถลบข้อมูลกลุ่มชาติพันธุ์ได้');
    }
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
    },
    {
      title: 'ชื่อ',
      dataIndex: 'name',
      key: 'name',
      render: (text: string, record: EthnicGroup, index: number) => (
        <span>
          {text}
          {index === 0 && <Text className="ml-2 text-xs text-green-600 font-bold">ล่าสุด</Text>}
        </span>
      ),
    },
    {
      title: 'ประเภท',
      dataIndex: ['category', 'name'],
      key: 'category',
    },
    {
      title: 'จังหวัด',
      dataIndex: 'province',
      key: 'province',
    },
    {
      title: 'ปีที่เริ่ม',
      dataIndex: 'startYear',
      key: 'startYear',
    },
    {
      title: 'การจัดการ',
      key: 'action',
      render: (_: any, record: EthnicGroup) => (
        <Space size="small">
          <Link href={`/dashboard/ethnic-group/${record.id}`}>
            <Button icon={<EyeOutlined />} type="primary" size="small" />
          </Link>
          <Link href={`/dashboard/ethnic-group/edit/${record.id}`}>
            <Button icon={<EditOutlined />} type="default" size="small" />
          </Link>
          <Button 
            icon={<DeleteOutlined />} 
            onClick={() => showDeleteModal(record)} 
            danger 
            size="small"
          />
        </Space>
      ),
    },
  ];

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">กลุ่มชาติพันธุ์</h1>
        <Link href="/dashboard/ethnic-group/create">
          <Button type="primary" icon={<PlusOutlined />}>
            เพิ่มกลุ่มชาติพันธุ์
          </Button>
        </Link>
      </div>
      <Table columns={columns} dataSource={ethnicGroups} rowKey="id" />
      <Modal
        title="ยืนยันการลบ"
        open={isDeleteModalVisible}
        onOk={() => {
          if (selectedEthnicGroup) handleDelete(selectedEthnicGroup.id);
          setIsDeleteModalVisible(false);
        }}
        onCancel={() => setIsDeleteModalVisible(false)}
        okText="ลบ"
        cancelText="ยกเลิก"
      >
        <p>คุณแน่ใจหรือไม่ที่จะลบกลุ่มชาติพันธุ์ "{selectedEthnicGroup?.name}"?</p>
      </Modal>
    </div>
  );
}