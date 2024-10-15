'use client'

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import axios from 'axios';
import { Card, Spin, Typography, Image } from 'antd';

const { Title, Text } = Typography;

interface EthnicGroup {
  id: string;
  name: string;
  categoryId: string;
  category: { name: string };
  history: string;
  activityName: string;
  activityOrigin: string;
  province: string;
  amphoe: string;
  district: string;
  village: string | null;
  activityDetails: string;
  alcoholFreeApproach: string;
  startYear: number;
  results: string | null;
  images: { id: string; url: string }[];
  videoLink: string | null;
  fileUrl: string | null;
  viewCount: number;
}

export default function EthnicGroupDetails() {
  const { id } = useParams();
  const [ethnicGroup, setEthnicGroup] = useState<EthnicGroup | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEthnicGroupDetails = async () => {
      try {
        const response = await axios.get(`/api/ethnic-group/${id}`);
        setEthnicGroup(response.data);
      } catch (error) {
        console.error('Failed to fetch ethnic group details:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchEthnicGroupDetails();
  }, [id]);
  
    if (loading) {
      return (
        <div className="flex justify-center items-center h-screen">
          <Spin size="large" />
        </div>
      );
    }
  
    if (!ethnicGroup) {
      return <div className="text-center text-2xl mt-10">ไม่พบข้อมูลกลุ่มชาติพันธุ์</div>;
    }
  
    return (
      <div className="container mx-auto p-4">
        <Card title={<Title level={2}>{ethnicGroup.name}</Title>}>
          <Text strong>ประเภท:</Text> {ethnicGroup.category.name}<br />
          <Text strong>ประวัติ:</Text> {ethnicGroup.history}<br />
          <Text strong>ชื่อกิจกรรม:</Text> {ethnicGroup.activityName}<br />
          <Text strong>ที่มาของกิจกรรม:</Text> {ethnicGroup.activityOrigin}<br />
          <Text strong>สถานที่:</Text> {ethnicGroup.village && `${ethnicGroup.village}, `}{ethnicGroup.district}, {ethnicGroup.amphoe}, {ethnicGroup.province}<br />
          <Text strong>รายละเอียดกิจกรรม:</Text> {ethnicGroup.activityDetails}<br />
          <Text strong>แนวทางการจัดงานแบบปลอดเหล้า:</Text> {ethnicGroup.alcoholFreeApproach}<br />
          <Text strong>ปีที่เริ่มดำเนินการ:</Text> {ethnicGroup.startYear}<br />
          {ethnicGroup.results && <><Text strong>ผลลัพธ์:</Text> {ethnicGroup.results}<br /></>}
          
          {ethnicGroup.images.length > 0 && (
            <div>
              <Text strong>รูปภาพ:</Text>
              <div className="flex flex-wrap mt-2">
                {ethnicGroup.images.map((image) => (
                  <Image
                    key={image.id}
                    src={image.url}
                    alt="Ethnic group image"
                    width={200}
                    className="m-2"
                  />
                ))}
              </div>
            </div>
          )}
          
          {ethnicGroup.videoLink && (
            <div>
              <Text strong>วิดีโอ:</Text> <a href={ethnicGroup.videoLink} target="_blank" rel="noopener noreferrer">ดูวิดีโอ</a>
            </div>
          )}
          
          {ethnicGroup.fileUrl && (
            <div>
              <Text strong>ไฟล์แนบ:</Text> <a href={ethnicGroup.fileUrl} download>ดาวน์โหลดไฟล์</a>
            </div>
          )}
          
          <Text strong>จำนวนการเข้าชม:</Text> {ethnicGroup.viewCount}
        </Card>
      </div>
    );
  }