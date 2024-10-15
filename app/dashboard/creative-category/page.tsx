//dashboard/creative-category/page.tsx
'use client'

import { useState, useEffect } from 'react';
import { Table, Button, message, Modal, Space, Typography } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import Link from 'next/link';
import axios from 'axios';

const { Title } = Typography;

interface CreativeCategory {
  id: string;
  name: string;
}

export default function CreativeCategoryList() {
  const [categories, setCategories] = useState<CreativeCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<CreativeCategory | null>(null);
  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await axios.get('/api/creative-category');
      setCategories(response.data);
    } catch (error) {
      console.error('Error fetching categories:', error);
      message.error('ไม่สามารถโหลดข้อมูลประเภทกิจกรรมสร้างสรรค์ได้');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await axios.delete(`/api/creative-category/${id}`);
      message.success('ลบประเภทกิจกรรมสร้างสรรค์สำเร็จ');
      fetchCategories();
    } catch (error) {
      console.error('Error deleting category:', error);
      if (axios.isAxiosError(error) && error.response) {
        if (error.response.status === 400) {
          message.error('ไม่สามารถลบประเภทนี้ได้เนื่องจากมีกิจกรรมสร้างสรรค์ที่ใช้ประเภทนี้อยู่');
        } else {
          message.error('ไม่สามารถลบประเภทกิจกรรมสร้างสรรค์ได้');
        }
      } else {
        message.error('เกิดข้อผิดพลาดในการลบประเภทกิจกรรมสร้างสรรค์');
      }
    } finally {
      setIsDeleteModalVisible(false);
    }
  };

  const showDeleteModal = (category: CreativeCategory) => {
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
      render: (_: any, record: CreativeCategory) => (
        <Space size="small">
          <Link href={`/dashboard/creative-category/edit/${record.id}`}>
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
        <Title level={2}>ประเภทกิจกรรมสร้างสรรค์</Title>
        <Link href="/dashboard/creative-category/create">
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
        <p>คุณแน่ใจหรือไม่ที่จะลบประเภทกิจกรรมสร้างสรรค์ "{selectedCategory?.name}"?</p>
      </Modal>
    </div>
  );
}