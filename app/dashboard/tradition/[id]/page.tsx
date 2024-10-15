'use client'

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import axios from 'axios';
import { FaUser, FaPhone, FaCalendar, FaEye, FaVideo, FaFilePdf } from 'react-icons/fa';
import { Spin } from 'antd';

interface Tradition {
  id: string;
  categoryId: string;
  name: string;
  district: string;
  amphoe: string;
  province: string;
  type: string;
  village: string | null;
  coordinatorName: string;
  phone: string | null;
  history: string;
  alcoholFreeApproach: string;
  results: string | null;
  startYear: number;
  videoLink: string | null;
  policyFileUrl: string | null;
  images: { id: string; url: string }[];
  category: { id: string; name: string };
  viewCount: number;
}

export default function TraditionDetails() {
  const { id } = useParams();
  const [tradition, setTradition] = useState<Tradition | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTraditionDetails = async () => {
      try {
        const response = await axios.get(`/api/tradition/${id}`);
        setTradition(response.data);
        await axios.post(`/api/tradition/${id}/view`);
      } catch (error) {
        console.error('Failed to fetch tradition details:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchTraditionDetails();
  }, [id]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-100">
        <Spin tip="กำลังโหลด..." size="large" />
      </div>
    );
  }

  if (!tradition) {
    return <div className="text-center text-2xl mt-10">ไม่พบข้อมูลงานบุญประเพณี</div>;
  }
  if (!tradition) {
    return <div className="text-center text-2xl mt-10">ไม่พบข้อมูลงานบุญประเพณี</div>;
  }

  if (!tradition) {
    return <div className="text-center text-2xl mt-10">ไม่พบข้อมูลงานบุญประเพณี</div>;
  }

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      {/* Hero Section */}
      <div className="relative h-64 md:h-96 mb-8">
        {tradition.images && tradition.images.length > 0 ? (
          <img
            src={tradition.images[0].url}
            alt={tradition.name}
            className="w-full h-full object-cover rounded-lg"
          />
        ) : (
          <div className="w-full h-full bg-gray-200 flex items-center justify-center rounded-lg">
            <p className="text-gray-500">ไม่มีรูปภาพ</p>
          </div>
        )}
        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center rounded-lg">
          <h1 className="text-3xl md:text-4xl font-bold text-white text-center">{tradition.name}</h1>
        </div>
      </div>

      {/* Main Content */}
      <div className="bg-white shadow-lg rounded-lg overflow-hidden">
        <div className="p-6">
          <h2 className="text-2xl font-semibold mb-4 text-green-600">ข้อมูลทั่วไป</h2>
          <p className="mb-2"><span className="font-semibold">ประเภท:</span> {tradition.category.name}</p>
          <p className="mb-2"><span className="font-semibold">พื้นที่:</span> {tradition.village ? `${tradition.village}, ` : ''}{tradition.district}, {tradition.amphoe}, {tradition.province}</p>
          <p className="mb-2"><span className="font-semibold">ภาค:</span> {tradition.type}</p>
          <div className="flex items-center mb-2">
            <FaUser className="mr-2 text-green-500" />
            <span className="font-semibold mr-2">ผู้ประสานงาน:</span> {tradition.coordinatorName}
          </div>
          {tradition.phone && (
            <div className="flex items-center mb-2">
              <FaPhone className="mr-2 text-green-500" />
              <span className="font-semibold mr-2">เบอร์ติดต่อ:</span> {tradition.phone}
            </div>
          )}
          <div className="flex items-center mb-4">
            <FaCalendar className="mr-2 text-green-500" />
            <span className="font-semibold mr-2">ปีที่เริ่มดำเนินการ:</span> {tradition.startYear}
          </div>

          <h2 className="text-2xl font-semibold mb-4 text-green-600">ประวัติและแนวทาง</h2>
          <p className="mb-4"><span className="font-semibold">ประวัติของงาน:</span> {tradition.history}</p>
          <p className="mb-4"><span className="font-semibold">แนวทางการจัดงานแบบปลอดเหล้า:</span> {tradition.alcoholFreeApproach}</p>
          {tradition.results && (
            <p className="mb-4"><span className="font-semibold">ผลลัพธ์:</span> {tradition.results}</p>
          )}
        </div>
        
        {tradition.images && tradition.images.length > 1 && (
          <div className="p-6 bg-gray-50">
            <h2 className="text-2xl font-semibold mb-4 text-green-600">รูปภาพประกอบเพิ่มเติม</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {tradition.images.slice(1).map((img) => (
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
        
        {(tradition.videoLink || tradition.policyFileUrl) && (
          <div className="p-6">
            <h2 className="text-2xl font-semibold mb-4 text-green-600">ไฟล์และลิงก์ที่เกี่ยวข้อง</h2>
            {tradition.videoLink && (
              <p className="mb-2 flex items-center">
                <FaVideo className="mr-2 text-green-500" />
                <a href={tradition.videoLink} target="_blank" rel="noopener noreferrer" className="text-green-500 hover:text-green-700 transition-colors duration-300">
                  ดูวิดีโอประกอบ
                </a>
              </p>
            )}
            {tradition.policyFileUrl && (
              <p className="flex items-center">
                <FaFilePdf className="mr-2 text-green-500" />
                <a href={tradition.policyFileUrl} download className="text-green-500 hover:text-green-700 transition-colors duration-300">
                  ดาวน์โหลดไฟล์นโยบาย
                </a>
              </p>
            )}
          </div>
        )}
      </div>
      <div className="mt-6 flex justify-end items-center text-gray-600">
        <FaEye className="mr-2" />
        <p>เข้าชมทั้งหมด {tradition.viewCount} ครั้ง</p>
      </div>
    </div>
  );
}