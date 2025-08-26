// app/dashboard/creative-category/components/CreativeCategoryList.tsx
'use client'

import { useState } from 'react';
import { Table, Button, Modal, Space, message } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import Link from 'next/link';
import { deleteCreativeCategoryAction } from '@/app/lib/actions/creative-category/delete';

interface CreativeCategory {
  id: string;
  name: string;
  _count: {
    subCategories: number;
    activities: number;
  };
}

interface CreativeCategoryListProps {
  categories: CreativeCategory[];
}

export default function CreativeCategoryList({ categories: initialCategories }: CreativeCategoryListProps) {
  const [categories, setCategories] = useState<CreativeCategory[]>(initialCategories);
  const [selectedCategory, setSelectedCategory] = useState<CreativeCategory | null>(null);
  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const handleDelete = async (category: CreativeCategory) => {
    setSelectedCategory(category);
    setIsDeleteModalVisible(true);
  };

  const confirmDelete = async () => {
    if (!selectedCategory) return;

    setDeleteLoading(true);
    try {
      const result = await deleteCreativeCategoryAction(selectedCategory.id);
      
      if (result.success) {
        message.success('ลบประเภทกิจกรรมสร้างสรรค์สำเร็จ');
        setCategories(categories.filter(cat => cat.id !== selectedCategory.id));
      } else {
        message.error(result.error || 'ไม่สามารถลบประเภทกิจกรรมสร้างสรรค์ได้');
      }
    } catch (error) {
      console.error('Error deleting category:', error);
      message.error('เกิดข้อผิดพลาดในการลบประเภทกิจกรรมสร้างสรรค์');
    } finally {
      setDeleteLoading(false);
      setIsDeleteModalVisible(false);
      setSelectedCategory(null);
    }
  };

  const columns = [
    {
      title: 'ชื่อประเภทกิจกรรมสร้างสรรค์',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'จำนวนหมวดหมู่ย่อย',
      dataIndex: ['_count', 'subCategories'],
      key: 'subCategoryCount',
    },
    {
      title: 'จำนวนกิจกรรม',
      dataIndex: ['_count', 'activities'],
      key: 'activityCount',
    },
    {
      title: 'การดำเนินการ',
      key: 'action',
      render: (_: any, record: CreativeCategory) => (
        <Space size="middle">
          <Link href={`/dashboard/creative-category/edit/${record.id}`}>
            <Button type="primary" icon={<EditOutlined />} size="small">
              แก้ไข
            </Button>
          </Link>
          <Button
            type="primary"
            danger
            icon={<DeleteOutlined />}
            size="small"
            onClick={() => handleDelete(record)}
          >
            ลบ
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <>
      <div className="mb-4">
        <Link href="/dashboard/creative-category/create">
          <Button type="primary" icon={<PlusOutlined />}>
            เพิ่มประเภทกิจกรรมสร้างสรรค์ใหม่
          </Button>
        </Link>
      </div>

      <Table
        columns={columns}
        dataSource={categories}
        rowKey="id"
        pagination={{
          pageSize: 10,
          showSizeChanger: true,
          showQuickJumper: true,
        }}
      />

      <Modal
        title="ยืนยันการลบ"
        open={isDeleteModalVisible}
        onOk={confirmDelete}
        onCancel={() => {
          setIsDeleteModalVisible(false);
          setSelectedCategory(null);
        }}
        confirmLoading={deleteLoading}
        okText="ลบ"
        cancelText="ยกเลิก"
        okType="danger"
      >
        <p>คุณแน่ใจหรือไม่ที่จะลบประเภทกิจกรรมสร้างสรรค์ &quot;{selectedCategory?.name}&quot;?</p>
        <p className="text-red-500 text-sm mt-2">
          การดำเนินการนี้ไม่สามารถยกเลิกได้
        </p>
      </Modal>
    </>
  );
}