// app/dashboard/tradition-category/page.tsx
'use client'

import { useState, useEffect } from 'react';
import { Table, Button, message, Modal, Space, Typography } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import Link from 'next/link';
import axios from 'axios';

const { Title } = Typography;

interface TraditionCategory {
  id: string;
  name: string;
}

export default function TraditionCategoryList() {
  const [categories, setCategories] = useState<TraditionCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<TraditionCategory | null>(null);
  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await axios.get('/api/tradition-category');
      setCategories(response.data);
    } catch (error) {
      console.error('Error fetching categories:', error);
      message.error('ไม่สามารถโหลดข้อมูลประเภทงานบุญประเพณีได้');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await axios.delete(`/api/tradition-category/${id}`);
      message.success('ลบประเภทงานบุญประเพณีสำเร็จ');
      fetchCategories();
    } catch (error) {
      console.error('Error deleting category:', error);
      if (axios.isAxiosError(error) && error.response) {
        if (error.response.status === 400) {
          message.error('ไม่สามารถลบประเภทนี้ได้เนื่องจากมีงานบุญประเพณีที่ใช้ประเภทนี้อยู่');
        } else {
          message.error('ไม่สามารถลบประเภทงานบุญประเพณีได้');
        }
      } else {
        message.error('เกิดข้อผิดพลาดในการลบประเภทงานบุญประเพณี');
      }
    } finally {
      setIsDeleteModalVisible(false);
    }
  };

  const showDeleteModal = (category: TraditionCategory) => {
    setSelectedCategory(category);
    setIsDeleteModalVisible(true);
  };

  const columns = [
    {
      title: 'ชื่อประเภท',
      dataIndex: 'name',
      key: 'name'
    },
    {
      title: 'การดำเนินการ',
      key: 'action',
      render: (_: any, record: TraditionCategory) => (
        <Space size="small">
          <Link href={`/dashboard/tradition-category/edit/${record.id}`}>
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

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <Title level={2}>ประเภทงานบุญประเพณี</Title>
        <Link href="/dashboard/tradition-category/create">
          <Button type="primary" icon={<PlusOutlined />}>
            เพิ่มประเภทใหม่
          </Button>
        </Link>
      </div>

      <Table
        columns={columns}
        dataSource={categories}
        rowKey="id"
        loading={loading}
      />

      <Modal
        title="ยืนยันการลบ"
        open={isDeleteModalVisible}
        onOk={() => {
          if (selectedCategory) handleDelete(selectedCategory.id);
        }}
        onCancel={() => setIsDeleteModalVisible(false)}
        okText="ลบ"
        cancelText="ยกเลิก"
      >
        <p>คุณแน่ใจหรือไม่ที่จะลบประเภทงานบุญประเพณี "{selectedCategory?.name}"?</p>
      </Modal>
    </div>
  );
}