// app/dashboard/ethnic-category/components/EthnicCategoryListClient.tsx
'use client'

import { useState, useTransition } from 'react';
import { Table, Button, message, Space, Modal } from 'antd';
import { EditOutlined, DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import Link from 'next/link';

// Server Action
import { deleteEthnicCategory } from '@/app/lib/actions/ethnic-category/delete';
import { getEthnicCategories } from '@/app/lib/actions/ethnic-category/get';

interface EthnicCategory {
  id: string;
  name: string;
  _count?: {
    ethnicGroups: number;
  };
}

interface EthnicCategoryListClientProps {
  initialCategories: EthnicCategory[];
}

export default function EthnicCategoryListClient({ initialCategories }: EthnicCategoryListClientProps) {
  const [categories, setCategories] = useState<EthnicCategory[]>(initialCategories);
  const [selectedCategory, setSelectedCategory] = useState<EthnicCategory | null>(null);
  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
  const [isPending, startTransition] = useTransition();

  const fetchCategories = async () => {
    startTransition(async () => {
      try {
        const result = await getEthnicCategories();
        if (result.success) {
          setCategories(result.data);
        }
      } catch (error) {
        console.error('Error fetching categories:', error);
        message.error('ไม่สามารถโหลดข้อมูลได้');
      }
    });
  };

  const handleDelete = async (id: string) => {
    startTransition(async () => {
      try {
        const result = await deleteEthnicCategory(id);
        
        if (result.success) {
          message.success('ลบประเภทกลุ่มชาติพันธุ์สำเร็จ');
          await fetchCategories();
        } else {
          message.error(result.error || 'ไม่สามารถลบประเภทกลุ่มชาติพันธุ์ได้');
        }
      } catch (error) {
        console.error('Error deleting category:', error);
        message.error('ไม่สามารถลบประเภทกลุ่มชาติพันธุ์ได้');
      }
    });
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
      title: 'จำนวนกลุ่มชาติพันธุ์',
      key: 'count',
      render: (_: any, record: EthnicCategory) => (
        <span>{record._count?.ethnicGroups || 0} รายการ</span>
      ),
    },
    {
      title: 'การจัดการ',
      key: 'action',
      render: (_: any, record: EthnicCategory) => (
        <Space size="small">
          <Link href={`/dashboard/ethnic-category/edit/${record.id}`}>
            <Button 
              icon={<EditOutlined />} 
              type="default" 
              size="small"
              className="border-green-500 text-green-600 hover:border-green-600 hover:text-green-700"
            />
          </Link>
          <Button
            icon={<DeleteOutlined />}
            type="primary"
            danger
            size="small"
            onClick={() => showDeleteModal(record)}
            loading={isPending}
          />
        </Space>
      ),
    },
  ];

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold text-green-700">ประเภทกลุ่มชาติพันธุ์</h1>
        <Link href="/dashboard/ethnic-category/create">
          <Button 
            type="primary" 
            icon={<PlusOutlined />}
            className="bg-green-600 hover:bg-green-700 border-green-600 hover:border-green-700"
          >
            เพิ่มประเภทกลุ่มชาติพันธุ์
          </Button>
        </Link>
      </div>
      <Table 
        columns={columns} 
        dataSource={categories} 
        rowKey="id"
        className="border border-green-100"
        loading={isPending}
        pagination={{
          pageSize: 10,
          showSizeChanger: false,
          showQuickJumper: true,
          showTotal: (total, range) => `${range[0]}-${range[1]} จาก ${total} รายการ`
        }}
      />
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
        confirmLoading={isPending}
      >
        <p>คุณแน่ใจหรือไม่ที่จะลบประเภทกลุ่มชาติพันธุ์ "{selectedCategory?.name}"?</p>
        {selectedCategory?._count?.ethnicGroups ? (
          <p className="text-amber-600 mt-2">
            ⚠️ ประเภทนี้มีกลุ่มชาติพันธุ์ {selectedCategory._count.ethnicGroups} รายการ การลบจะส่งผลต่อข้อมูลเหล่านั้น
          </p>
        ) : null}
      </Modal>
    </div>
  );
}