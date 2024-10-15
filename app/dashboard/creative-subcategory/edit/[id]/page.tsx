//dashboard/creative-subcategory/edit/[id]/page.tsx
'use client'

import { useState, useEffect } from 'react';
import { Form, Input, Select, Button, message } from 'antd';
import axios from 'axios';
import { useRouter } from 'next/navigation';

const { Option } = Select;

interface CreativeCategory {
  id: string;
  name: string;
}

export default function EditCreativeSubcategory({ params }: { params: { id: string } }) {
  const [form] = Form.useForm();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<CreativeCategory[]>([]);

  useEffect(() => {
    fetchCategories();
    fetchSubcategoryData();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await axios.get<CreativeCategory[]>('/api/creative-category');
      setCategories(response.data);
    } catch (error) {
      console.error('Error fetching categories:', error);
      message.error('ไม่สามารถโหลดข้อมูลประเภทกิจกรรมสร้างสรรค์ได้');
    }
  };

  const fetchSubcategoryData = async () => {
    try {
      const response = await axios.get(`/api/creative-subcategory/${params.id}`);
      form.setFieldsValue(response.data);
    } catch (error) {
      console.error('Error fetching subcategory data:', error);
      message.error('ไม่สามารถโหลดข้อมูลหมวดหมู่ย่อยได้');
    }
  };

  const onFinish = async (values: { name: string; categoryId: string }) => {
    setLoading(true);
    try {
      await axios.put(`/api/creative-subcategory/${params.id}`, values);
      message.success('แก้ไขหมวดหมู่ย่อยสำเร็จ');
      router.push('/dashboard/creative-subcategory');
    } catch (error) {
      console.error('Error updating creative subcategory:', error);
      message.error('ไม่สามารถแก้ไขหมวดหมู่ย่อยได้');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">แก้ไขหมวดหมู่ย่อย</h1>
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
            บันทึกการแก้ไข
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
}