'use client'

import { useState, useEffect, useTransition } from 'react';
import { Form, Input, Button, message, Select } from 'antd';
import { useRouter } from 'next/navigation';

// Server Actions
import { getCreativeCategories } from '@/app/lib/actions/creative-category/get';
import { createCreativeSubCategory } from '@/app/lib/actions/creative-subcategory/post';

const { Option } = Select;

interface CreativeCategory {
  id: string;
  name: string;
}

export default function CreateCreativeSubCategory() {
  const [form] = Form.useForm();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<CreativeCategory[]>([]);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    startTransition(async () => {
      try {
        const result = await getCreativeCategories();
        if (result.success) {
          setCategories(result.data);
        } else {
          message.error('ไม่สามารถโหลดประเภทกิจกรรมสร้างสรรค์ได้');
        }
      } catch (error) {
        console.error('Error fetching creative categories:', error);
        message.error('ไม่สามารถโหลดประเภทกิจกรรมสร้างสรรค์ได้');
      }
    });
  };

  const onFinish = async (values: { name: string; categoryId: string }) => {
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('name', values.name);
      formData.append('categoryId', values.categoryId);
      
      const result = await createCreativeSubCategory(formData);
      if (result.success) {
        message.success('สร้างหมวดหมู่ย่อยกิจกรรมสร้างสรรค์สำเร็จ');
        router.push('/dashboard/creative-subcategory');
      } else {
        message.error(result.error || 'ไม่สามารถสร้างหมวดหมู่ย่อยกิจกรรมสร้างสรรค์ได้');
      }
    } catch (error) {
      console.error('Error creating creative sub-category:', error);
      message.error('ไม่สามารถสร้างหมวดหมู่ย่อยกิจกรรมสร้างสรรค์ได้');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">สร้างหมวดหมู่ย่อยกิจกรรมสร้างสรรค์ใหม่</h1>
      <Form form={form} layout="vertical" onFinish={onFinish}>
        <Form.Item
          name="categoryId"
          label="ประเภทกิจกรรมสร้างสรรค์"
          rules={[{ required: true, message: 'กรุณาเลือกประเภทกิจกรรมสร้างสรรค์' }]}
        >
          <Select placeholder="เลือกประเภทกิจกรรมสร้างสรรค์">
            {categories.map((category) => (
              <Option key={category.id} value={category.id}>{category.name}</Option>
            ))}
          </Select>
        </Form.Item>
        <Form.Item
          name="name"
          label="ชื่อหมวดหมู่ย่อย"
          rules={[{ required: true, message: 'กรุณากรอกชื่อหมวดหมู่ย่อย' }]}
        >
          <Input />
        </Form.Item>
        <Form.Item>
          <Button type="primary" htmlType="submit" loading={loading}>
            สร้างหมวดหมู่ย่อย
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
}