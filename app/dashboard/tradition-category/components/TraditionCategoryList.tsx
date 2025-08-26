// app/dashboard/tradition-category/components/TraditionCategoryList.tsx
'use client'

import { useState } from 'react';
import { Table, Button, Modal, Space, message } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import Link from 'next/link';
import { deleteTraditionCategoryClient } from '@/app/lib/actions/tradition-category/delete';

interface TraditionCategory {
  id: string;
  name: string;
  _count: {
    traditions: number;
  };
}

interface TraditionCategoryListProps {
  categories: TraditionCategory[];
}

export default function TraditionCategoryList({ categories: initialCategories }: TraditionCategoryListProps) {
  const [categories, setCategories] = useState<TraditionCategory[]>(initialCategories);
  const [selectedCategory, setSelectedCategory] = useState<TraditionCategory | null>(null);
  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const handleDelete = async (category: TraditionCategory) => {
    setSelectedCategory(category);
    setIsDeleteModalVisible(true);
  };

  const confirmDelete = async () => {
    if (!selectedCategory) return;

    setDeleteLoading(true);
    try {
      const result = await deleteTraditionCategoryClient(selectedCategory.id);
      
      if (result.success) {
        message.success('ลบประเภทงานบุญประเพณีสำเร็จ');
        setCategories(categories.filter(cat => cat.id !== selectedCategory.id));
      } else {
        message.error(result.error || 'ไม่สามารถลบประเภทงานบุญประเพณีได้');
      }
    } catch (error) {
      console.error('Error deleting category:', error);
      message.error('เกิดข้อผิดพลาดในการลบประเภทงานบุญประเพณี');
    } finally {
      setDeleteLoading(false);
      setIsDeleteModalVisible(false);
      setSelectedCategory(null);
    }
  };

  const columns = [
    {
      title: 'ชื่อประเภทงานบุญประเพณี',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'จำนวนงานบุญประเพณี',
      dataIndex: ['_count', 'traditions'],
      key: 'traditionCount',
    },
    {
      title: 'การดำเนินการ',
      key: 'action',
      render: (_: any, record: TraditionCategory) => (
        <Space size="middle">
          <Link href={`/dashboard/tradition-category/edit/${record.id}`}>
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
        <Link href="/dashboard/tradition-category/create">
          <Button type="primary" icon={<PlusOutlined />}>
            เพิ่มประเภทงานบุญประเพณีใหม่
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
        <p>คุณแน่ใจหรือไม่ที่จะลบประเภทงานบุญประเพณี &quot;{selectedCategory?.name}&quot;?</p>
        <p className="text-red-500 text-sm mt-2">
          การดำเนินการนี้ไม่สามารถยกเลิกได้
        </p>
      </Modal>
    </>
  );
}