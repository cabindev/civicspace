'use client'

import { useState, useEffect } from 'react';
import { Form, Input, Button, message } from 'antd';
import axios from 'axios';
import { useRouter } from 'next/navigation';

export default function EditEthnicCategory({ params }: { params: { id: string } }) {
  const [form] = Form.useForm();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchCategoryData();
  }, []);

  const fetchCategoryData = async () => {
    try {
      const response = await axios.get(`/api/ethnic-category/${params.id}`);
      form.setFieldsValue(response.data);
    } catch (error) {
      message.error('ไม่สามารถโหลดข้อมูลประเภทกลุ่มชาติพันธุ์ได้');
    }
  };

  const onFinish = async (values: { name: string }) => {
    setLoading(true);
    try {
      await axios.put(`/api/ethnic-category/${params.id}`, values);
      message.success('แก้ไขประเภทกลุ่มชาติพันธุ์สำเร็จ');
      router.push('/dashboard/ethnic-category');
    } catch (error) {
      message.error('ไม่สามารถแก้ไขประเภทกลุ่มชาติพันธุ์ได้');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">แก้ไขประเภทกลุ่มชาติพันธุ์</h1>
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
            แก้ไขประเภทกลุ่มชาติพันธุ์
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
}