'use client'

import { useState, useEffect } from 'react';
import { Table, Button, Spin, message, Modal, Space, Typography, Card, Avatar } from 'antd';
import { EyeOutlined, EditOutlined, DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import Link from 'next/link';
import axios from 'axios';
import { useMediaQuery } from 'react-responsive';

const { Title, Text } = Typography;

interface PublicPolicy {
  id: string;
  name: string;
  signingDate: string;
  level: string;
  district: string;
  amphoe: string;
  province: string;
  content: string[];
  images?: { id: string; url: string }[];
  createdAt: string;
}

export default function PublicPolicyList() {
  const [policies, setPolicies] = useState<PublicPolicy[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPolicy, setSelectedPolicy] = useState<PublicPolicy | null>(null);
  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
  const isMobile = useMediaQuery({ maxWidth: 768 });

  useEffect(() => {
    fetchPolicies();
  }, []);

  const fetchPolicies = async () => {
    try {
      const response = await axios.get('/api/public-policy');
      const sortedPolicies = response.data.sort((a: PublicPolicy, b: PublicPolicy) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      setPolicies(sortedPolicies);
    } catch (error) {
      console.error('Error fetching policies:', error);
      message.error('ไม่สามารถโหลดข้อมูลนโยบายได้');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await axios.delete(`/api/public-policy/${id}`);
      message.success('ลบข้อมูลนโยบายสาธารณะสำเร็จ');
      fetchPolicies();
    } catch (error) {
      message.error('ไม่สามารถลบข้อมูลนโยบายสาธารณะได้');
    }
  };

  const showDeleteModal = (policy: PublicPolicy) => {
    setSelectedPolicy(policy);
    setIsDeleteModalVisible(true);
  };

  const columns = [
    {
      title: 'ลำดับ',
      key: 'index',
      render: (_: any, __: any, index: number) => index + 1,
    },
    {
      title: 'ชื่อนโยบาย',
      dataIndex: 'name',
      key: 'name',
      render: (text: string, record: PublicPolicy, index: number) => (
        <span>
          {text}
          {index === 0 && <span className="ml-2 text-xs text-green-600 font-bold">ล่าสุด</span>}
        </span>
      ),
    },
    {
      title: 'วันที่ลงนาม',
      dataIndex: 'signingDate',
      key: 'signingDate',
      render: (date: string) => new Date(date).toLocaleDateString('th-TH'),
    },
    {
      title: 'ระดับ',
      dataIndex: 'level',
      key: 'level',
    },
    {
      title: 'พื้นที่',
      key: 'area',
      render: (_: any, record: PublicPolicy) => `${record.district}, ${record.amphoe}, ${record.province}`,
    },
    {
      title: 'การจัดการ',
      key: 'action',
      render: (_: any, record: PublicPolicy) => (
        <Space size="small">
          <Link href={`/dashboard/public-policy/${record.id}`}>
            <Button icon={<EyeOutlined />} type="primary" size="small" />
          </Link>
          <Link href={`/dashboard/public-policy/edit/${record.id}`}>
            <Button icon={<EditOutlined />} type="default" size="small" />
          </Link>
          <Button
            icon={<DeleteOutlined />}
            type="primary"
            danger
            size="small"
            onClick={() => showDeleteModal(record)}
          />
        </Space>
      )
    },
  ];

  const MobileCard = ({ policy, index }: { policy: PublicPolicy; index: number }) => (
    <Card
      hoverable
      className="mb-4"
      actions={[
        <Link key="view" href={`/dashboard/public-policy/${policy.id}`}>
          <EyeOutlined />
        </Link>,
        <Link key="edit" href={`/dashboard/public-policy/edit/${policy.id}`}>
          <EditOutlined />
        </Link>,
        <DeleteOutlined key="delete" onClick={() => showDeleteModal(policy)} />,
      ]}
    >
      <Card.Meta
        avatar={
          policy.images && policy.images.length > 0 ? (
            <Avatar src={policy.images[0].url} size={64} />
          ) : (
            <Avatar size={64}>No img</Avatar>
          )
        }
        title={
          <span>
            {index + 1}. {policy.name}
            {index === 0 && <span className="ml-2 text-xs text-green-600 font-bold">ล่าสุด</span>}
          </span>
        }
        description={
          <>
            <Text>{policy.district}, {policy.amphoe}, {policy.province}</Text>
            <br />
            <Text>ระดับ: {policy.level}</Text>
            <br />
            <Text>วันที่ลงนาม: {new Date(policy.signingDate).toLocaleDateString('th-TH')}</Text>
          </>
        }
      />
    </Card>
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <Title level={2}>นโยบายสาธารณะ</Title>
        <Link href="/dashboard/public-policy/create">
          <Button type="primary" icon={<PlusOutlined />}>
            เพิ่มนโยบายสาธารณะ
          </Button>
        </Link>
      </div>

      {isMobile ? (
        policies.map((policy, index) => (
          <MobileCard key={policy.id} policy={policy} index={index} />
        ))
      ) : (
        <Table
          columns={columns}
          dataSource={policies}
          rowKey="id"
          pagination={{
            total: policies.length,
            pageSize: 10,
            showSizeChanger: false,
            showQuickJumper: true,
          }}
        />
      )}

      <Modal
        title="ยืนยันการลบ"
        open={isDeleteModalVisible}
        onOk={() => {
          if (selectedPolicy) handleDelete(selectedPolicy.id);
          setIsDeleteModalVisible(false);
        }}
        onCancel={() => setIsDeleteModalVisible(false)}
        okText="ลบ"
        cancelText="ยกเลิก"
      >
        <p>คุณแน่ใจหรือไม่ที่จะลบนโยบายสาธารณะ "{selectedPolicy?.name}"?</p>
      </Modal>
    </div>
  );
}