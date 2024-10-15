//creative-activity/[id]/page.tsx:
'use client'

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import axios from 'axios';
import { FaUser, FaPhone, FaCalendar, FaEye, FaVideo, FaFilePdf } from 'react-icons/fa';
import { Spin } from 'antd';

interface CreativeActivity {
  id: string;
  categoryId: string;
  subCategoryId: string;
  name: string;
  district: string;
  amphoe: string;
  province: string;
  type: string;
  village: string | null;
  coordinatorName: string;
  phone: string | null;
  description: string;
  summary: string;
  results: string | null;
  startYear: number;
  videoLink: string | null;
  reportFileUrl: string | null;
  images: { id: string; url: string }[];
  category: { id: string; name: string };
  subCategory: { id: string; name: string };
  viewCount: number;
}

export default function CreativeActivityDetails() {
  const { id } = useParams();
  const [activity, setActivity] = useState<CreativeActivity | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchActivityDetails = async () => {
      try {
        const response = await axios.get(`/api/creative-activity/${id}`);
        setActivity(response.data);
        await axios.post(`/api/creative-activity/${id}/view`);
      } catch (error) {
        console.error('Failed to fetch creative activity details:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchActivityDetails();
  }, [id]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-100">
        <Spin tip="กำลังโหลด..." size="large" />
      </div>
    );
  }

  if (!activity) {
    return <div className="text-center text-2xl mt-10">ไม่พบข้อมูลกิจกรรมสร้างสรรค์</div>;
  }

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      {/* Hero Section */}
      <div className="relative h-64 md:h-96 mb-8">
        {activity.images && activity.images.length > 0 ? (
          <img
            src={activity.images[0].url}
            alt={activity.name}
            className="w-full h-full object-cover rounded-lg"
          />
        ) : (
          <div className="w-full h-full bg-gray-200 flex items-center justify-center rounded-lg">
            <p className="text-gray-500">ไม่มีรูปภาพ</p>
          </div>
        )}
        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center rounded-lg">
          <h1 className="text-3xl md:text-4xl font-bold text-white text-center">{activity.name}</h1>
        </div>
      </div>

      {/* Main Content */}
      <div className="bg-white shadow-lg rounded-lg overflow-hidden">
        <div className="p-6">
          <h2 className="text-2xl font-semibold mb-4 text-green-600">ข้อมูลทั่วไป</h2>
          <p className="mb-2"><span className="font-semibold">ประเภท:</span> {activity.category.name}</p>
          <p className="mb-2"><span className="font-semibold">หมวดหมู่ย่อย:</span> {activity.subCategory.name}</p>
          <p className="mb-2"><span className="font-semibold">พื้นที่:</span> {activity.village ? `${activity.village}, ` : ''}{activity.district}, {activity.amphoe}, {activity.province}</p>
          <p className="mb-2"><span className="font-semibold">ภาค:</span> {activity.type}</p>
          <div className="flex items-center mb-2">
            <FaUser className="mr-2 text-green-500" />
            <span className="font-semibold mr-2">ผู้ประสานงาน:</span> {activity.coordinatorName}
          </div>
          {activity.phone && (
            <div className="flex items-center mb-2">
              <FaPhone className="mr-2 text-green-500" />
              <span className="font-semibold mr-2">เบอร์ติดต่อ:</span> {activity.phone}
            </div>
          )}
          <div className="flex items-center mb-4">
            <FaCalendar className="mr-2 text-green-500" />
            <span className="font-semibold mr-2">ปีที่เริ่มดำเนินการ:</span> {activity.startYear}
          </div>

          <h2 className="text-2xl font-semibold mb-4 text-green-600">รายละเอียดและผลลัพธ์</h2>
          <p className="mb-4"><span className="font-semibold">รายละเอียดกิจกรรม:</span> {activity.description}</p>
          <p className="mb-4"><span className="font-semibold">สรุปเนื้อหาการดำเนินงาน:</span> {activity.summary}</p>
          {activity.results && (
            <p className="mb-4"><span className="font-semibold">ผลลัพธ์:</span> {activity.results}</p>
          )}
        </div>
        
        {activity.images && activity.images.length > 1 && (
          <div className="p-6 bg-gray-50">
            <h2 className="text-2xl font-semibold mb-4 text-green-600">รูปภาพประกอบเพิ่มเติม</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {activity.images.slice(1).map((img) => (
                <img 
                  key={img.id} 
                  src={img.url} 
                  alt="รูปภาพประกอบ" 
                  className="w-full h-48 object-cover rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300"
                />
              ))}
            </div>
          </div>
        )}
        
        {(activity.videoLink || activity.reportFileUrl) && (
          <div className="p-6">
            <h2 className="text-2xl font-semibold mb-4 text-green-600">ไฟล์และลิงก์ที่เกี่ยวข้อง</h2>
            {activity.videoLink && (
              <p className="mb-2 flex items-center">
                <FaVideo className="mr-2 text-green-500" />
                <a href={activity.videoLink} target="_blank" rel="noopener noreferrer" className="text-green-500 hover:text-green-700 transition-colors duration-300">
                  ดูวิดีโอประกอบ
                </a>
              </p>
            )}
            {activity.reportFileUrl && (
              <p className="flex items-center">
                <FaFilePdf className="mr-2 text-green-500" />
                <a href={activity.reportFileUrl} download className="text-green-500 hover:text-green-700 transition-colors duration-300">
                  ดาวน์โหลดไฟล์รายงาน
                </a>
              </p>
            )}
          </div>
        )}
      </div>
      <div className="mt-6 flex justify-end items-center text-gray-600">
        <FaEye className="mr-2" />
        <p>เข้าชมทั้งหมด {activity.viewCount} ครั้ง</p>
      </div>
    </div>
  );
}