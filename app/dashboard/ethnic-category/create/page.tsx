// app/dashboard/ethnic-category/create/page.tsx
'use client'

import { useState } from 'react';
import { Form, Input, Button, message } from 'antd';
import axios from 'axios';
import { useRouter } from 'next/navigation';

export default function CreateEthnicCategory() {
  const [form] = Form.useForm();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const onFinish = async (values: { name: string }) => {
    setLoading(true);
    try {
      await axios.post('/api/ethnic-category', values);
      message.success('สร้างประเภทกลุ่มชาติพันธุ์สำเร็จ');
      router.push('/dashboard/ethnic-category');
    } catch (error) {
      console.error('Error creating ethnic category:', error);
      message.error('ไม่สามารถสร้างประเภทกลุ่มชาติพันธุ์ได้');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-4">

      <Form form={form} layout="vertical" onFinish={onFinish}>
        <Form.Item
          name="name"
          label="ชื่อประเภทกลุ่มชาติพันธุ์"
          rules={[{ required: true, message: 'กรุณากรอกชื่อประเภทกลุ่มชาติพันธุ์' }]}
        >
          <Input />
        </Form.Item>
        <Form.Item>
          <Button type="primary" htmlType="submit" loading={loading}>
            สร้างประเภทกลุ่มชาติพันธุ์
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
}