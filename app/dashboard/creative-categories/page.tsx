// app/dashboard/creative-categories/page.tsx
'use client'

import { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Input, message, Select, Card, Tabs, Popconfirm } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import axios from 'axios';

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

export default function CreativeCategories() {
  const [categories, setCategories] = useState<CreativeCategory[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('1');
  const [form] = Form.useForm();

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const response = await axios.get<CreativeCategory[]>('/api/creative-category');
      setCategories(response.data);
    } catch (error) {
      console.error('Error fetching creative categories:', error);
      message.error('ไม่สามารถโหลดข้อมูลประเภทกิจกรรมสร้างสรรค์ได้');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (values: any) => {
    try {
      if (editMode) {
        if (activeTab === '1') {
          await axios.put(`/api/creative-category/${selectedItem.id}`, values);
          message.success('แก้ไขประเภทกิจกรรมสร้างสรรค์สำเร็จ');
        } else {
          await axios.put(`/api/creative-subcategory/${selectedItem.id}`, values);
          message.success('แก้ไขหมวดหมู่ย่อยกิจกรรมสร้างสรรค์สำเร็จ');
        }
      } else {
        if (activeTab === '1') {
          await axios.post('/api/creative-category', values);
          message.success('สร้างประเภทกิจกรรมสร้างสรรค์สำเร็จ');
        } else {
          await axios.post('/api/creative-subcategory', values);
          message.success('สร้างหมวดหมู่ย่อยกิจกรรมสร้างสรรค์สำเร็จ');
        }
      }
      setModalVisible(false);
      fetchCategories();
    } catch (error) {
      console.error('Error handling submit:', error);
      message.error('ไม่สามารถดำเนินการได้');
    }
  };

  const handleDelete = async (id: string, isCategory: boolean) => {
    try {
      if (isCategory) {
        await axios.delete(`/api/creative-category/${id}`);
        message.success('ลบประเภทกิจกรรมสร้างสรรค์สำเร็จ');
      } else {
        await axios.delete(`/api/creative-subcategory/${id}`);
        message.success('ลบหมวดหมู่ย่อยกิจกรรมสร้างสรรค์สำเร็จ');
      }
      fetchCategories();
    } catch (error) {
      console.error('Error deleting item:', error);
      message.error('ไม่สามารถลบรายการได้');
    }
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
          <Button icon={<EditOutlined />} onClick={() => showModal('edit', record)} className="mr-2" />
          <Popconfirm
            title="คุณแน่ใจหรือไม่ที่จะลบประเภทนี้?"
            onConfirm={() => handleDelete(record.id, true)}
            okText="ใช่"
            cancelText="ไม่"
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
          <Button icon={<EditOutlined />} onClick={() => showModal('edit', record)} className="mr-2" />
          <Popconfirm
            title="คุณแน่ใจหรือไม่ที่จะลบหมวดหมู่ย่อยนี้?"
            onConfirm={() => handleDelete(record.id, false)}
            okText="ใช่"
            cancelText="ไม่"
          >
            <Button icon={<DeleteOutlined />} danger />
          </Popconfirm>
        </>
      ),
    },
  ];

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">จัดการประเภทและหมวดหมู่ย่อยกิจกรรมสร้างสรรค์</h1>
      <Tabs activeKey={activeTab} onChange={setActiveTab}>
        <TabPane tab="ประเภทกิจกรรมสร้างสรรค์" key="1">
          <Card
            title="ประเภทกิจกรรมสร้างสรรค์"
            extra={<Button type="primary" icon={<PlusOutlined />} onClick={() => showModal('add')}>เพิ่มประเภท</Button>}
          >
            <Table
              dataSource={categories}
              columns={categoryColumns}
              rowKey="id"
              loading={loading}
            />
          </Card>
        </TabPane>
        <TabPane tab="หมวดหมู่ย่อย" key="2">
          <Card
            title="หมวดหมู่ย่อย"
            extra={<Button type="primary" icon={<PlusOutlined />} onClick={() => showModal('add')}>เพิ่มหมวดหมู่ย่อย</Button>}
          >
            <Table
              dataSource={categories.flatMap(category => category.subCategories)}
              columns={subCategoryColumns}
              rowKey="id"
              loading={loading}
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
            <Button type="primary" htmlType="submit">
              {editMode ? "แก้ไข" : "บันทึก"}
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}