'use client'

import { useState, useEffect } from 'react';
import { Table, Button, Spin, message, Space, Modal } from 'antd';
import { EditOutlined, DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import Link from 'next/link';
import axios from 'axios';

interface EthnicCategory {
  id: string;
  name: string;
}

export default function EthnicCategoryList() {
  const [categories, setCategories] = useState<EthnicCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<EthnicCategory | null>(null);
  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await axios.get('/api/ethnic-category');
      setCategories(response.data);
    } catch (error) {
      message.error('ไม่สามารถโหลดข้อมูลประเภทกลุ่มชาติพันธุ์ได้');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await axios.delete(`/api/ethnic-category/${id}`);
      message.success('ลบประเภทกลุ่มชาติพันธุ์สำเร็จ');
      fetchCategories();
    } catch (error) {
      message.error('ไม่สามารถลบประเภทกลุ่มชาติพันธุ์ได้');
    }
  };

  const showDeleteModal = (category: EthnicCategory) => {
    setSelectedCategory(category);
    setIsDeleteModalVisible(true);
  };

  const columns = [
    {
      title: 'ชื่อ',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'การจัดการ',
      key: 'action',
      render: (_: any, record: EthnicCategory) => (
        <Space size="small">
          <Link href={`/dashboard/ethnic-category/edit/${record.id}`}>
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
        <h1 className="text-2xl font-bold">ประเภทกลุ่มชาติพันธุ์</h1>
        <Link href="/dashboard/ethnic-category/create">
          <Button type="primary" icon={<PlusOutlined />}>
            เพิ่มประเภทกลุ่มชาติพันธุ์
          </Button>
        </Link>
      </div>
      <Table columns={columns} dataSource={categories} rowKey="id" />
      <Modal
        title="ยืนยันการลบ"
        open={isDeleteModalVisible}
        onOk={() => {
          if (selectedCategory) handleDelete(selectedCategory.id);
          setIsDeleteModalVisible(false);
        }}
        onCancel={() => setIsDeleteModalVisible(false)}
        okText="ลบ"
        cancelText="ยกเลิก"
      >
        <p>คุณแน่ใจหรือไม่ที่จะลบประเภทกลุ่มชาติพันธุ์ "{selectedCategory?.name}"?</p>
      </Modal>
    </div>
  );
}