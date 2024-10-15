//dashboard/creative-subcategory/page.tsx
'use client'

import { useState, useEffect } from 'react';
import { Table, Button, message, Modal, Space, Typography } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import Link from 'next/link';
import axios from 'axios';

const { Title } = Typography;

interface CreativeSubcategory {
  id: string;
  name: string;
  category: {
    id: string;
    name: string;
  };
}

export default function CreativeSubcategoryList() {
  const [subcategories, setSubcategories] = useState<CreativeSubcategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSubcategory, setSelectedSubcategory] = useState<CreativeSubcategory | null>(null);
  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);

  useEffect(() => {
    fetchSubcategories();
  }, []);

  const fetchSubcategories = async () => {
    try {
      const response = await axios.get('/api/creative-subcategory');
      setSubcategories(response.data);
    } catch (error) {
      console.error('Error fetching subcategories:', error);
      message.error('ไม่สามารถโหลดข้อมูลหมวดหมู่ย่อยได้');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await axios.delete(`/api/creative-subcategory/${id}`);
      message.success('ลบหมวดหมู่ย่อยสำเร็จ');
      fetchSubcategories();
    } catch (error) {
      console.error('Error deleting subcategory:', error);
      if (axios.isAxiosError(error) && error.response) {
        if (error.response.status === 400) {
          message.error('ไม่สามารถลบหมวดหมู่ย่อยนี้ได้เนื่องจากมีกิจกรรมสร้างสรรค์ที่ใช้หมวดหมู่ย่อยนี้อยู่');
        } else {
          message.error('ไม่สามารถลบหมวดหมู่ย่อยได้');
        }
      } else {
        message.error('เกิดข้อผิดพลาดในการลบหมวดหมู่ย่อย');
      }
    } finally {
      setIsDeleteModalVisible(false);
    }
  };

  const showDeleteModal = (subcategory: CreativeSubcategory) => {
    setSelectedSubcategory(subcategory);
    setIsDeleteModalVisible(true);
  };

  const columns = [
    {
      title: 'ชื่อหมวดหมู่ย่อย',
      dataIndex: 'name',
      key: 'name'
    },
    {
      title: 'ประเภทกิจกรรม',
      dataIndex: ['category', 'name'],
      key: 'category'
    },
    {
      title: 'การดำเนินการ',
      key: 'action',
      render: (_: any, record: CreativeSubcategory) => (
        <Space size="small">
          <Link href={`/dashboard/creative-subcategory/edit/${record.id}`}>
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
        <Title level={2}>หมวดหมู่ย่อยกิจกรรมสร้างสรรค์</Title>
        <Link href="/dashboard/creative-subcategory/create">
          <Button type="primary" icon={<PlusOutlined />}>
            เพิ่มหมวดหมู่ย่อยใหม่
          </Button>
        </Link>
      </div>

      <Table
        columns={columns}
        dataSource={subcategories}
        rowKey="id"
        loading={loading}
      />

      <Modal
        title="ยืนยันการลบ"
        open={isDeleteModalVisible}
        onOk={() => {
          if (selectedSubcategory) handleDelete(selectedSubcategory.id);
        }}
        onCancel={() => setIsDeleteModalVisible(false)}
        okText="ลบ"
        cancelText="ยกเลิก"
      >
        <p>คุณแน่ใจหรือไม่ที่จะลบหมวดหมู่ย่อย "{selectedSubcategory?.name}"?</p>
      </Modal>
    </div>
  );
}