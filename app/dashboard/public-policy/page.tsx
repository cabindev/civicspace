'use client'

import { useState, useEffect } from 'react';
import { Table, Button, Spin, message, Modal, Space, Typography } from 'antd';
import { EyeOutlined, EditOutlined, DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import Link from 'next/link';
import axios from 'axios';
import { useMediaQuery } from 'react-responsive';

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
           <Button icon={<EyeOutlined />} type="primary" size="small" className="bg-green-500 hover:bg-green-600" />
         </Link>
         <Link href={`/dashboard/public-policy/edit/${record.id}`}>
           <Button icon={<EditOutlined />} type="default" size="small" />
         </Link>
         <Button 
           icon={<DeleteOutlined />} 
           onClick={() => showDeleteModal(record)} 
           danger 
           size="small"
         />
       </Space>
     ),
     width: '10%',
   },
 ];

 const MobileCard = ({ policy, index }: { policy: PublicPolicy; index: number }) => (
   <div className="card bg-base-100 shadow-xl mb-4 border border-green-100">
     <figure className="h-48">
       {policy.images && policy.images.length > 0 ? (
         <img
           src={policy.images[0].url}
           alt={policy.name}
           className="w-full h-full object-cover"
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
         >
           <DeleteOutlined className="mr-1" />
           ลบ
         </button>
       </div>
     </div>
   </div>
 );

 if (loading) {
   return (
     <div className="flex justify-center items-center h-screen">
       <Spin size="large" />
     </div>
   );
 }

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