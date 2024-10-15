'use client'

import { useState } from 'react';
import { Form, Input, Button, message } from 'antd';
import axios from 'axios';
import { useRouter } from 'next/navigation';

export default function CreateCreativeCategory() {
  const [form] = Form.useForm();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const onFinish = async (values: { name: string }) => {
    setLoading(true);
    try {
      await axios.post('/api/creative-category', values);
      message.success('สร้างประเภทกิจกรรมสร้างสรรค์สำเร็จ');
      router.push('/dashboard/creative-category');
    } catch (error) {
      console.error('Error creating creative category:', error);
      message.error('ไม่สามารถสร้างประเภทกิจกรรมสร้างสรรค์ได้');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">สร้างประเภทกิจกรรมสร้างสรรค์ใหม่</h1>
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
            สร้างประเภทกิจกรรมสร้างสรรค์
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
}