// app/dashboard/creative-categories/components/CreativeCategoriesClient.tsx
'use client'

import { useState, useEffect, useTransition } from 'react';
import { Table, Button, Modal, Form, Input, message, Select, Card, Tabs, Popconfirm } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';

// Server Actions
import { getCreativeCategories } from '@/app/lib/actions/creative-category/get';
import { createCreativeCategory } from '@/app/lib/actions/creative-category/post';
import { updateCreativeCategory } from '@/app/lib/actions/creative-category/put';
import { deleteCreativeCategory } from '@/app/lib/actions/creative-category/delete';
import { createCreativeSubCategory } from '@/app/lib/actions/creative-subcategory/post';
import { updateCreativeSubCategory } from '@/app/lib/actions/creative-subcategory/put';
import { deleteCreativeSubCategory } from '@/app/lib/actions/creative-subcategory/delete';

const { Option } = Select;
const { TabPane } = Tabs;

interface CreativeCategory {
  id: string;
  name: string;
  subCategories: CreativeSubCategory[];
}

interface CreativeSubCategory {
  id: string;
  name: string;
  categoryId: string;
}

interface CreativeCategoriesClientProps {
  initialCategories: CreativeCategory[];
}

export default function CreativeCategoriesClient({ initialCategories }: CreativeCategoriesClientProps) {
  const [categories, setCategories] = useState<CreativeCategory[]>(initialCategories);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('1');
  const [form] = Form.useForm();
  const [isPending, startTransition] = useTransition();

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const result = await getCreativeCategories();
      if (result.success) {
        setCategories(result.data);
      } else {
        message.error('ไม่สามารถโหลดข้อมูลประเภทกิจกรรมสร้างสรรค์ได้');
      }
    } catch (error) {
      console.error('Error fetching creative categories:', error);
      message.error('ไม่สามารถโหลดข้อมูลประเภทกิจกรรมสร้างสรรค์ได้');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (values: any) => {
    startTransition(async () => {
      try {
        let result;
        
        if (editMode) {
          if (activeTab === '1') {
            // Update category
            const formData = new FormData();
            formData.append('name', values.name);
            result = await updateCreativeCategory(selectedItem.id, formData);
            
            if (result.success) {
              message.success('แก้ไขประเภทกิจกรรมสร้างสรรค์สำเร็จ');
            } else {
              message.error(result.error || 'ไม่สามารถแก้ไขประเภทกิจกรรมสร้างสรรค์ได้');
            }
          } else {
            // Update subcategory
            const formData = new FormData();
            formData.append('name', values.name);
            formData.append('categoryId', values.categoryId);
            result = await updateCreativeSubCategory(selectedItem.id, formData);
            
            if (result.success) {
              message.success('แก้ไขหมวดหมู่ย่อยกิจกรรมสร้างสรรค์สำเร็จ');
            } else {
              message.error(result.error || 'ไม่สามารถแก้ไขหมวดหมู่ย่อยกิจกรรมสร้างสรรค์ได้');
            }
          }
        } else {
          if (activeTab === '1') {
            // Create category
            const formData = new FormData();
            formData.append('name', values.name);
            result = await createCreativeCategory(formData);
            
            if (result.success) {
              message.success('สร้างประเภทกิจกรรมสร้างสรรค์สำเร็จ');
            } else {
              message.error(result.error || 'ไม่สามารถสร้างประเภทกิจกรรมสร้างสรรค์ได้');
            }
          } else {
            // Create subcategory
            const formData = new FormData();
            formData.append('name', values.name);
            formData.append('categoryId', values.categoryId);
            result = await createCreativeSubCategory(formData);
            
            if (result.success) {
              message.success('สร้างหมวดหมู่ย่อยกิจกรรมสร้างสรรค์สำเร็จ');
            } else {
              message.error(result.error || 'ไม่สามารถสร้างหมวดหมู่ย่อยกิจกรรมสร้างสรรค์ได้');
            }
          }
        }

        if (result?.success) {
          setModalVisible(false);
          form.resetFields();
          await fetchCategories(); // Refresh data
        }
      } catch (error) {
        console.error('Error handling submit:', error);
        message.error('ไม่สามารถดำเนินการได้');
      }
    });
  };

  const handleDelete = async (id: string, isCategory: boolean) => {
    startTransition(async () => {
      try {
        let result;
        
        if (isCategory) {
          result = await deleteCreativeCategory(id);
          if (result.success) {
            message.success('ลบประเภทกิจกรรมสร้างสรรค์สำเร็จ');
          } else {
            message.error(result.error || 'ไม่สามารถลบประเภทกิจกรรมสร้างสรรค์ได้');
          }
        } else {
          result = await deleteCreativeSubCategory(id);
          if (result.success) {
            message.success('ลบหมวดหมู่ย่อยกิจกรรมสร้างสรรค์สำเร็จ');
          } else {
            message.error(result.error || 'ไม่สามารถลบหมวดหมู่ย่อยกิจกรรมสร้างสรรค์ได้');
          }
        }

        if (result?.success) {
          await fetchCategories(); // Refresh data
        }
      } catch (error) {
        console.error('Error deleting item:', error);
        message.error('ไม่สามารถลบรายการได้');
      }
    });
  };

  const showModal = (mode: 'add' | 'edit', item?: any) => {
    setEditMode(mode === 'edit');
    setSelectedItem(item);
    if (mode === 'edit') {
      form.setFieldsValue(item);
    } else {
      form.resetFields();
    }
    setModalVisible(true);
  };

  const categoryColumns = [
    { title: 'ชื่อประเภท', dataIndex: 'name', key: 'name' },
    {
      title: 'การดำเนินการ',
      key: 'action',
      render: (_: any, record: CreativeCategory) => (
        <>
          <Button 
            icon={<EditOutlined />} 
            onClick={() => showModal('edit', record)} 
            className="mr-2 bg-green-600 hover:bg-green-700 text-white border-green-600 hover:border-green-700" 
          />
          <Popconfirm
            title="คุณแน่ใจหรือไม่ที่จะลบประเภทนี้?"
            onConfirm={() => handleDelete(record.id, true)}
            okText="ใช่"
            cancelText="ไม่"
            okButtonProps={{ className: 'bg-green-600 hover:bg-green-700 border-green-600 hover:border-green-700' }}
          >
            <Button icon={<DeleteOutlined />} danger />
          </Popconfirm>
        </>
      ),
    },
  ];

  const subCategoryColumns = [
    { title: 'ชื่อหมวดหมู่ย่อย', dataIndex: 'name', key: 'name' },
    { 
      title: 'ประเภท', 
      dataIndex: 'categoryId', 
      key: 'categoryId',
      render: (categoryId: string) => {
        const category = categories.find(c => c.id === categoryId);
        return category ? category.name : 'ไม่พบประเภท';
      }
    },
    {
      title: 'การดำเนินการ',
      key: 'action',
      render: (_: any, record: CreativeSubCategory) => (
        <>
          <Button 
            icon={<EditOutlined />} 
            onClick={() => showModal('edit', record)} 
            className="mr-2 bg-green-600 hover:bg-green-700 text-white border-green-600 hover:border-green-700" 
          />
          <Popconfirm
            title="คุณแน่ใจหรือไม่ที่จะลบหมวดหมู่ย่อยนี้?"
            onConfirm={() => handleDelete(record.id, false)}
            okText="ใช่"
            cancelText="ไม่"
            okButtonProps={{ className: 'bg-green-600 hover:bg-green-700 border-green-600 hover:border-green-700' }}
          >
            <Button icon={<DeleteOutlined />} danger />
          </Popconfirm>
        </>
      ),
    },
  ];

  return (
    <>
      <Tabs activeKey={activeTab} onChange={setActiveTab}>
        <TabPane tab="ประเภทกิจกรรมสร้างสรรค์" key="1">
          <Card
            title="ประเภทกิจกรรมสร้างสรรค์"
            extra={
              <Button 
                type="primary" 
                icon={<PlusOutlined />} 
                onClick={() => showModal('add')}
                className="bg-green-600 hover:bg-green-700 border-green-600 hover:border-green-700"
              >
                เพิ่มประเภท
              </Button>
            }
          >
            <Table
              dataSource={categories}
              columns={categoryColumns}
              rowKey="id"
              loading={loading || isPending}
            />
          </Card>
        </TabPane>
        <TabPane tab="หมวดหมู่ย่อย" key="2">
          <Card
            title="หมวดหมู่ย่อย"
            extra={
              <Button 
                type="primary" 
                icon={<PlusOutlined />} 
                onClick={() => showModal('add')}
                className="bg-green-600 hover:bg-green-700 border-green-600 hover:border-green-700"
              >
                เพิ่มหมวดหมู่ย่อย
              </Button>
            }
          >
            <Table
              dataSource={categories.flatMap(category => category.subCategories)}
              columns={subCategoryColumns}
              rowKey="id"
              loading={loading || isPending}
            />
          </Card>
        </TabPane>
      </Tabs>

      <Modal
        title={editMode ? "แก้ไขข้อมูล" : "เพิ่มข้อมูลใหม่"}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={null}
      >
        <Form form={form} onFinish={handleSubmit} layout="vertical">
          {activeTab === '1' ? (
            <Form.Item
              name="name"
              label="ชื่อประเภทกิจกรรมสร้างสรรค์"
              rules={[{ required: true, message: 'กรุณากรอกชื่อประเภทกิจกรรมสร้างสรรค์' }]}
            >
              <Input />
            </Form.Item>
          ) : (
            <>
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
            </>
          )}
          <Form.Item>
            <Button 
              type="primary" 
              htmlType="submit" 
              loading={isPending}
              className="bg-green-600 hover:bg-green-700 border-green-600 hover:border-green-700"
            >
              {editMode ? "แก้ไข" : "บันทึก"}
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
}