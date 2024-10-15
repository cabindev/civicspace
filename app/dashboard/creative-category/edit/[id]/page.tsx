//dashboard/creative-category/edit/[id]/page.tsx
'use client'

import { useState, useEffect } from 'react';
import { Form, Input, Button, message } from 'antd';
import axios from 'axios';
import { useRouter } from 'next/navigation';

export default function EditCreativeCategory({ params }: { params: { id: string } }) {
  const [form] = Form.useForm();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchCategoryData();
  }, []);

  const fetchCategoryData = async () => {
    try {
      const response = await axios.get(`/api/creative-category/${params.id}`);
      form.setFieldsValue(response.data);
    } catch (error) {
      console.error('Error fetching category data:', error);
      message.error('ไม่สามารถโหลดข้อมูลประเภทกิจกรรมสร้างสรรค์ได้');
    }
  };

  const onFinish = async (values: { name: string }) => {
    setLoading(true);
    try {
      await axios.put(`/api/creative-category/${params.id}`, values);
      message.success('แก้ไขประเภทกิจกรรมสร้างสรรค์สำเร็จ');
      router.push('/dashboard/creative-category');
    } catch (error) {
      console.error('Error updating creative category:', error);
      message.error('ไม่สามารถแก้ไขประเภทกิจกรรมสร้างสรรค์ได้');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">แก้ไขประเภทกิจกรรมสร้างสรรค์</h1>
      <Form form={form} layout="vertical" onFinish={onFinish}>
        <Form.Item
          name="name"
          label="ชื่อประเภทกิจกรรมสร้างสรรค์"
          rules={[{ required: true, message: 'กรุณากรอกชื่อประเภทกิจกรรมสร้างสรรค์' }]}
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