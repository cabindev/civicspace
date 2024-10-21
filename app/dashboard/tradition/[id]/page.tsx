// app/dashboard/tradition/[id]/page.tsx
'use client'

import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import axios from 'axios';
import { FaUser, FaPhone, FaCalendar, FaEye, FaVideo, FaFilePdf, FaMapMarkerAlt, FaEdit } from 'react-icons/fa';
import { Spin, message } from 'antd';

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
  const router = useRouter();

  const fetchTraditionDetails = useCallback(async () => {
    try {
      const response = await axios.get(`/api/tradition/${id}`);
      setTradition(response.data);
      // Increment view count
      await axios.put(`/api/tradition/${id}`, { action: 'incrementViewCount' }, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
    } catch (error) {
      console.error('Failed to fetch tradition details:', error);
      message.error('ไม่สามารถโหลดข้อมูลงานบุญประเพณีได้');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchTraditionDetails();
  }, [fetchTraditionDetails]);

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

  return (
    <div className="bg-gray-100 min-h-screen pt-24">
      <div className="container mx-auto p-4 max-w-4xl">
        {/* Hero Section */}
        <div className="relative h-64 md:h-96 mb-8 rounded-lg overflow-hidden shadow-xl">
          {tradition.images && tradition.images.length > 0 ? (
            <img
              src={tradition.images[0].url}
              alt={tradition.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gray-200 flex items-center justify-center">
              <p className="text-gray-500">ไม่มีรูปภาพ</p>
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent flex items-end">
            <h1 className="text-3xl md:text-4xl font-bold text-white p-6">{tradition.name}</h1>
          </div>
        </div>

        {/* Main Content */}
        <div className="bg-white shadow-lg rounded-lg overflow-hidden">
          <div className="p-6">
            <h2 className="text-2xl font-semibold mb-4 text-green-600 border-b pb-2">ข้อมูลทั่วไป</h2>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <p className="mb-2"><span className="font-semibold">ประเภท:</span> {tradition.category.name}</p>
                <p className="mb-2 flex items-center">
                  <FaMapMarkerAlt className="mr-2 text-green-500" />
                  <span className="font-semibold">พื้นที่:</span> {tradition.village ? `${tradition.village}, ` : ''}{tradition.district}, {tradition.amphoe}, {tradition.province}
                </p>
                <p className="mb-2"><span className="font-semibold">ภาค:</span> {tradition.type}</p>
              </div>
              <div>
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
              </div>
            </div>

            <h2 className="text-2xl font-semibold my-4 text-green-600 border-b pb-2">ประวัติและแนวทาง</h2>
            <div className="mb-4">
              <h3 className="font-semibold mb-2">ประวัติของงาน:</h3>
              <p className="text-gray-700">{tradition.history}</p>
            </div>
            <div className="mb-4">
              <h3 className="font-semibold mb-2">แนวทางการจัดงานแบบปลอดเหล้า:</h3>
              <p className="text-gray-700">{tradition.alcoholFreeApproach}</p>
            </div>
            {tradition.results && (
              <div className="mb-4">
                <h3 className="font-semibold mb-2">ผลลัพธ์:</h3>
                <p className="text-gray-700">{tradition.results}</p>
              </div>
            )}
          </div>
          
          {tradition.images && tradition.images.length > 1 && (
            <div className="p-6 bg-gray-50">
              <h2 className="text-2xl font-semibold mb-4 text-green-600 border-b pb-2">รูปภาพประกอบเพิ่มเติม</h2>
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
              <h2 className="text-2xl font-semibold mb-4 text-green-600 border-b pb-2">ไฟล์และลิงก์ที่เกี่ยวข้อง</h2>
              <div className="flex flex-col md:flex-row md:space-x-4">
                {tradition.videoLink && (
                  <a href={tradition.videoLink} target="_blank" rel="noopener noreferrer" className="flex items-center bg-green-100 text-green-700 px-4 py-2 rounded-full hover:bg-green-200 transition duration-300 mb-2 md:mb-0">
                    <FaVideo className="mr-2" />
                    ดูวิดีโอประกอบ
                  </a>
                )}
                {tradition.policyFileUrl && (
                  <a href={tradition.policyFileUrl} download className="flex items-center bg-green-100 text-green-700 px-4 py-2 rounded-full hover:bg-green-200 transition duration-300">
                    <FaFilePdf className="mr-2" />
                    ดาวน์โหลดไฟล์นโยบาย
                  </a>
                )}
              </div>
            </div>
          )}
        </div>
        <div className="mt-6 flex justify-between items-center text-gray-600">
          <Link href={`/dashboard/tradition/edit/${tradition.id}`} className="flex items-center bg-blue-500 text-white px-4 py-2 rounded-full hover:bg-blue-600 transition duration-300">
            <FaEdit className="mr-2" />
            แก้ไขข้อมูล
          </Link>
          <div className="flex items-center">
            <FaEye className="mr-2" />
            <p>เข้าชมทั้งหมด {tradition.viewCount} ครั้ง</p>
          </div>
        </div>
      </div>
    </div>
  );
}