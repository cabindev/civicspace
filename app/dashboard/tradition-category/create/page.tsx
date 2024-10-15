// app/dashboard/tradition-category/create/page.tsx
'use client'

import { useState } from 'react';
import { Form, Input, Button, message } from 'antd';
import axios from 'axios';
import { useRouter } from 'next/navigation';

export default function CreateTraditionCategory() {
  const [form] = Form.useForm();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const onFinish = async (values: { name: string }) => {
    setLoading(true);
    try {
      await axios.post('/api/tradition-category', values);
      message.success('สร้างประเภทงานบุญประเพณีสำเร็จ');
      router.push('/dashboard/tradition-category');
    } catch (error) {
      console.error('Error creating tradition category:', error);
      message.error('ไม่สามารถสร้างประเภทงานบุญประเพณีได้');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-4">

      <Form form={form} layout="vertical" onFinish={onFinish}>
        <Form.Item
          name="name"
          label="ชื่อประเภทงานบุญประเพณี"
          rules={[{ required: true, message: 'กรุณากรอกชื่อประเภทงานบุญประเพณี' }]}
        >
          <Input />
        </Form.Item>
        <Form.Item>
          <Button type="primary" htmlType="submit" loading={loading}>
            สร้างประเภทงานบุญประเพณี
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
}