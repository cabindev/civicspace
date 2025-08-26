// app/dashboard/ethnic-category/edit/[id]/components/EditEthnicCategoryClient.tsx
'use client'

import React, { useTransition } from 'react';
import { Form, Input, Button, message } from 'antd';
import { useRouter } from 'next/navigation';

// Server Action
import { updateEthnicCategoryDirect } from '@/app/lib/actions/ethnic-category/put';

interface EthnicCategory {
  id: string;
  name: string;
}

interface EditEthnicCategoryClientProps {
  category: EthnicCategory;
}

export default function EditEthnicCategoryClient({ category }: EditEthnicCategoryClientProps) {
  const [form] = Form.useForm();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  // Set initial values
  React.useEffect(() => {
    form.setFieldsValue({
      name: category.name
    });
  }, [form, category]);

  const handleSubmit = async (values: { name: string }) => {
    startTransition(async () => {
      try {
        const formData = new FormData();
        formData.append('name', values.name);

        const result = await updateEthnicCategoryDirect(category.id, formData);

        if (result.success) {
          message.success('แก้ไขประเภทกลุ่มชาติพันธุ์สำเร็จ');
          router.push('/dashboard/ethnic-category');
        } else {
          message.error(result.error || 'ไม่สามารถแก้ไขประเภทกลุ่มชาติพันธุ์ได้');
        }
      } catch (error) {
        console.error('Error updating category:', error);
        message.error('ไม่สามารถแก้ไขประเภทกลุ่มชาติพันธุ์ได้');
      }
    });
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4 text-green-700">แก้ไขประเภทกลุ่มชาติพันธุ์</h1>
      <Form 
        form={form} 
        layout="vertical" 
        onFinish={handleSubmit}
        onFinishFailed={(errorInfo) => {
          console.log('Form validation failed:', errorInfo);
        }}
      >
        <Form.Item
          name="name"
          label="ชื่อประเภทกลุ่มชาติพันธุ์"
          rules={[{ required: true, message: 'กรุณากรอกชื่อประเภทกลุ่มชาติพันธุ์' }]}
        >
          <Input className="focus:border-green-500 focus:ring-green-500" />
        </Form.Item>
        <Form.Item>
          <Button 
            type="primary" 
            loading={isPending}
            onClick={() => form.submit()}
            className="bg-green-600 hover:bg-green-700 border-green-600 hover:border-green-700"
          >
            แก้ไขประเภทกลุ่มชาติพันธุ์
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
}