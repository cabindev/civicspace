'use client'

import { useState, useEffect } from 'react';
import { Form, Input, Button, message, Select } from 'antd';
import axios from 'axios';
import { useRouter } from 'next/navigation';

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

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await axios.get<CreativeCategory[]>('/api/creative-category');
      setCategories(response.data);
    } catch (error) {
      console.error('Error fetching creative categories:', error);
      message.error('ไม่สามารถโหลดประเภทกิจกรรมสร้างสรรค์ได้');
    }
  };

  const onFinish = async (values: { name: string; categoryId: string }) => {
    setLoading(true);
    try {
      await axios.post('/api/creative-subcategory', values);
      message.success('สร้างหมวดหมู่ย่อยกิจกรรมสร้างสรรค์สำเร็จ');
      router.push('/dashboard/creative-subcategory');
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