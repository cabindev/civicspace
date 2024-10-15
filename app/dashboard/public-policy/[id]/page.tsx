'use client'

import { useState, useEffect } from 'react';
import { Card, Row, Col, Image, Button, message } from 'antd';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface PublicPolicy {
  id: string;
  name: string;
  signingDate: string;
  level: string;
  district: string;
  amphoe: string;
  province: string;
  type: string;
  village?: string;
  content: string[];
  summary: string;
  results?: string;
  images: { id: string; url: string }[];
  videoLink?: string;
  policyFileUrl?: string;
}

export default function PublicPolicyDetail({ params }: { params: { id: string } }) {
  const [policy, setPolicy] = useState<PublicPolicy | null>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchPolicy = async () => {
      try {
        const response = await axios.get(`/api/public-policy/${params.id}`);
        setPolicy(response.data);
      } catch (error) {
        console.error('Error fetching policy:', error);
        message.error('ไม่สามารถโหลดข้อมูลนโยบายได้');
      }
    };

    fetchPolicy();
  }, [params.id]);

  const handleDelete = async () => {
    try {
      await axios.delete(`/api/public-policy/${params.id}`);
      message.success('ลบนโยบายสาธารณะสำเร็จ');
      router.push('/dashboard/public-policy');
    } catch (error) {
      console.error('Error deleting policy:', error);
      message.error('ไม่สามารถลบนโยบายสาธารณะได้');
    }
  };

  if (!policy) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">{policy.name}</h1>
      <Card>
        <Row gutter={[16, 16]}>
          <Col span={12}>
            <p><strong>วันที่ลงนาม:</strong> {new Date(policy.signingDate).toLocaleDateString()}</p>
            <p><strong>ระดับ:</strong> {policy.level}</p>
            <p><strong>พื้นที่:</strong> {policy.village ? `${policy.village}, ` : ''}{policy.district}, {policy.amphoe}, {policy.province}</p>
            <p><strong>ประเภท:</strong> {policy.type}</p>
            <p><strong>เนื้อหา:</strong> {policy.content.join(', ')}</p>
            <p><strong>สรุป:</strong> {policy.summary}</p>
            {policy.results && <p><strong>ผลลัพธ์:</strong> {policy.results}</p>}
          </Col>
          <Col span={12}>
            {policy.images.length > 0 && (
              <Image.PreviewGroup>
                {policy.images.map((image) => (
                  <Image key={image.id} width={200} src={image.url} />
                ))}
              </Image.PreviewGroup>
            )}
            {policy.videoLink && (
              <p><strong>วิดีโอ:</strong> <a href={policy.videoLink} target="_blank" rel="noopener noreferrer">ดูวิดีโอ</a></p>
            )}
            {policy.policyFileUrl && (
              <p><strong>ไฟล์นโยบาย:</strong> <a href={policy.policyFileUrl} target="_blank" rel="noopener noreferrer">ดาวน์โหลด</a></p>
            )}
          </Col>
        </Row>
      </Card>
      <div className="mt-4">
        <Link href={`/dashboard/public-policy/edit/${policy.id}`}>
          <Button type="primary" className="mr-2">แก้ไข</Button>
        </Link>
        <Button danger onClick={handleDelete}>ลบ</Button>
      </div>
    </div>
  );
}