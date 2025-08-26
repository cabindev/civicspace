//dashboard/creative-subcategory/edit/[id]/page.tsx
'use client'

import { useState, useEffect, useTransition } from 'react';
import { Form, Input, Select, Button, message } from 'antd';
import { useRouter } from 'next/navigation';

// Server Actions
import { getCreativeCategories } from '@/app/lib/actions/creative-category/get';
import { getCreativeSubCategoryById } from '@/app/lib/actions/creative-subcategory/get';
import { updateCreativeSubCategory } from '@/app/lib/actions/creative-subcategory/put';

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
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    fetchCategories();
    fetchSubcategoryData();
  }, []);

  const fetchCategories = async () => {
    startTransition(async () => {
      try {
        const result = await getCreativeCategories();
        if (result.success) {
          setCategories(result.data);
        } else {
          message.error('ไม่สามารถโหลดข้อมูลประเภทกิจกรรมสร้างสรรค์ได้');
        }
      } catch (error) {
        console.error('Error fetching categories:', error);
        message.error('ไม่สามารถโหลดข้อมูลประเภทกิจกรรมสร้างสรรค์ได้');
      }
    });
  };

  const fetchSubcategoryData = async () => {
    try {
      const result = await getCreativeSubCategoryById(params.id);
      if (result.success) {
        form.setFieldsValue(result.data);
      } else {
        message.error('ไม่สามารถโหลดข้อมูลหมวดหมู่ย่อยได้');
      }
    } catch (error) {
      console.error('Error fetching subcategory data:', error);
      message.error('ไม่สามารถโหลดข้อมูลหมวดหมู่ย่อยได้');
    }
  };

  const onFinish = async (values: { name: string; categoryId: string }) => {
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('name', values.name);
      formData.append('categoryId', values.categoryId);
      
      const result = await updateCreativeSubCategory(params.id, formData);
      if (result.success) {
        message.success('แก้ไขหมวดหมู่ย่อยสำเร็จ');
        router.push('/dashboard/creative-subcategory');
      } else {
        message.error(result.error || 'ไม่สามารถแก้ไขหมวดหมู่ย่อยได้');
      }
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