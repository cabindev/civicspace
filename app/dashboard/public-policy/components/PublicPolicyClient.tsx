// app/dashboard/public-policy/components/PublicPolicyClient.tsx
'use client'

import { useState, useTransition } from 'react';
import { Table, Button, message, Modal, Space } from 'antd';
import { EyeOutlined, EditOutlined, DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import Link from 'next/link';
import { useMediaQuery } from 'react-responsive';

// Server Actions
import { getPublicPolicies } from '@/app/lib/actions/public-policy/get';
import { deletePublicPolicy } from '@/app/lib/actions/public-policy/delete';

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

interface PublicPolicyClientProps {
  initialPolicies: PublicPolicy[];
}

export default function PublicPolicyClient({ initialPolicies }: PublicPolicyClientProps) {
  const [policies, setPolicies] = useState<PublicPolicy[]>(initialPolicies);
  const [selectedPolicy, setSelectedPolicy] = useState<PublicPolicy | null>(null);
  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [imageErrors, setImageErrors] = useState<Set<string>>(new Set());
  const isMobile = useMediaQuery({ maxWidth: 768 });

  const fetchPolicies = async () => {
    startTransition(async () => {
      try {
        const result = await getPublicPolicies();
        if (result.success) {
          // Sort by createdAt descending to show newest first
          const sortedPolicies = result.data.sort((a: PublicPolicy, b: PublicPolicy) => 
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
          setPolicies(sortedPolicies);
        } else {
          message.error('ไม่สามารถโหลดข้อมูลนโยบายได้');
        }
      } catch (error) {
        console.error('Error fetching policies:', error);
        message.error('ไม่สามารถโหลดข้อมูลนโยบายได้');
      }
    });
  };

  const handleDelete = async (id: string) => {
    startTransition(async () => {
      try {
        const result = await deletePublicPolicy(id);
        if (result.success) {
          message.success('ลบข้อมูลนโยบายสาธารณะสำเร็จ');
          await fetchPolicies(); // Refresh the list
        } else {
          message.error(result.error || 'ไม่สามารถลบข้อมูลนโยบายสาธารณะได้');
        }
      } catch (error) {
        console.error('Error deleting policy:', error);
        message.error('ไม่สามารถลบข้อมูลนโยบายสาธารณะได้');
      }
    });
  };

  const showDeleteModal = (policy: PublicPolicy) => {
    setSelectedPolicy(policy);
    setIsDeleteModalVisible(true);
  };

  const handleImageError = (url: string) => {
    setImageErrors(prev => new Set(Array.from(prev).concat(url)));
    console.warn('Failed to load image:', url);
  };

  const columns = [
    {
      title: 'ลำดับ',
      key: 'index',
      render: (_: any, __: any, index: number) => index + 1,
      width: '5%',
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
      width: '30%',
    },
    {
      title: 'วันที่ลงนาม',
      dataIndex: 'signingDate',
      key: 'signingDate',
      render: (date: string) => new Date(date).toLocaleDateString('th-TH'),
      width: '15%',
    },
    {
      title: 'ระดับ',
      dataIndex: 'level',
      key: 'level',
      render: (level: string) => ({
        'DISTRICT': 'ระดับอำเภอ',
        'HEALTH_REGION': 'ระดับเขตสุขภาพ',
        'NATIONAL': 'ระดับประเทศ',
        'PROVINCIAL': 'ระดับจังหวัด',
        'SUB_DISTRICT': 'ระดับตำบล',
        'VILLAGE': 'ระดับหมู่บ้าน'
      })[level] || level,
      width: '15%',
    },
    {
      title: 'พื้นที่',
      key: 'area',
      render: (_: any, record: PublicPolicy) => (
        `${record.district}, ${record.amphoe}, ${record.province}`
      ),
      width: '25%',
    },
    {
      title: 'การจัดการ',
      key: 'action',
      render: (_: any, record: PublicPolicy) => (
        <Space size="small">
          <Link href={`/dashboard/public-policy/${record.id}`}>
            <Button 
              icon={<EyeOutlined />} 
              type="primary" 
              size="small" 
              className="bg-green-600 hover:bg-green-700 border-green-600 hover:border-green-700" 
            />
          </Link>
          <Link href={`/dashboard/public-policy/edit/${record.id}`}>
            <Button 
              icon={<EditOutlined />} 
              size="small" 
              className="bg-green-600 hover:bg-green-700 text-white border-green-600 hover:border-green-700" 
            />
          </Link>
          <Button 
            icon={<DeleteOutlined />} 
            onClick={() => showDeleteModal(record)} 
            danger 
            size="small"
            loading={isPending}
          />
        </Space>
      ),
      width: '10%',
    },
  ];

  const MobileCard = ({ policy, index }: { policy: PublicPolicy; index: number }) => (
    <div className="card bg-base-100 shadow-xl mb-4 border border-green-100">
      <figure className="h-48">
        {policy.images && policy.images.length > 0 && !imageErrors.has(policy.images[0].url) ? (
          <img
            src={policy.images[0].url}
            alt={policy.name}
            className="w-full h-full object-cover"
            onError={() => handleImageError(policy.images?.[0]?.url || '')}
          />
        ) : (
          <div className="w-full h-full bg-green-50 flex items-center justify-center text-green-600">
            No Image Available
          </div>
        )}
      </figure>
      <div className="card-body p-4">
        <h2 className="card-title text-green-700 text-lg">
          {index + 1}. {policy.name}
          {index === 0 && (
            <div className="badge badge-success text-white text-xs">ล่าสุด</div>
          )}
        </h2>
        
        <div className="space-y-3 mt-2">
          {/* ระดับนโยบาย */}
          <div className="flex flex-wrap gap-2">
            <div className="badge badge-primary text-white">{policy.level}</div>
          </div>
          
          {/* ข้อมูลอื่นๆ */}
          <div className="text-sm space-y-1 text-gray-600">
            <p className="flex items-center gap-2">
              <span className="font-semibold text-green-700">พื้นที่:</span> 
              <span className="badge badge-outline text-green-600 border-green-600">
                {policy.district}, {policy.amphoe}, {policy.province}
              </span>
            </p>
            <p className="flex items-center gap-2">
              <span className="font-semibold text-green-700">วันที่ลงนาม:</span> 
              {new Date(policy.signingDate).toLocaleDateString('th-TH')}
            </p>
            {policy.content && policy.content.length > 0 && (
              <div className="mt-2">
                <span className="font-semibold text-green-700 block mb-1">เนื้อหา:</span>
                <div className="text-sm text-gray-600 line-clamp-2">
                  {policy.content[0]}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="card-actions justify-end mt-4">
          <Link href={`/dashboard/public-policy/${policy.id}`}>
            <button className="btn btn-primary btn-sm text-white hover:bg-green-700">
              <EyeOutlined className="mr-1" />
              ดู
            </button>
          </Link>
          <Link href={`/dashboard/public-policy/edit/${policy.id}`}>
            <button className="btn bg-green-500 text-white btn-sm hover:bg-green-600">
              <EditOutlined className="mr-1" />
              แก้ไข
            </button>
          </Link>
          <button 
            className="btn btn-error btn-sm text-white"
            onClick={() => showDeleteModal(policy)}
            disabled={isPending}
          >
            <DeleteOutlined className="mr-1" />
            ลบ
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-green-700 hidden sm:block">
          นโยบายสาธารณะ
        </h1>
        <Link href="/dashboard/public-policy/create">
          <button className="btn btn-primary text-white hover:bg-green-700">
            <PlusOutlined className="mr-2" />
            เพิ่มนโยบายสาธารณะ
          </button>
        </Link>
      </div>

      {isMobile ? (
        <div className="grid gap-4">
          {policies.map((policy, index) => (
            <MobileCard key={policy.id} policy={policy} index={index} />
          ))}
        </div>
      ) : (
        <div className="bg-base-100 rounded-lg shadow-lg">
          <Table 
            columns={columns} 
            dataSource={policies} 
            rowKey="id"
            loading={isPending}
            pagination={{
              total: policies.length,
              pageSize: 10,
              showSizeChanger: false,
              showQuickJumper: true,
            }}
            className="overflow-x-auto"
          />
        </div>
      )}

      <Modal
        title={<span className="text-green-700">ยืนยันการลบ</span>}
        open={isDeleteModalVisible}
        onOk={() => {
          if (selectedPolicy) handleDelete(selectedPolicy.id);
          setIsDeleteModalVisible(false);
        }}
        onCancel={() => setIsDeleteModalVisible(false)}
        okText="ลบ"
        cancelText="ยกเลิก"
        confirmLoading={isPending}
        okButtonProps={{ className: 'bg-red-500 hover:bg-red-600' }}
        cancelButtonProps={{ 
          className: 'border-green-500 text-green-500 hover:border-green-600 hover:text-green-600' 
        }}
      >
        <p>คุณแน่ใจหรือไม่ที่จะลบนโยบายสาธารณะ "{selectedPolicy?.name}"?</p>
      </Modal>
    </div>
  );
}