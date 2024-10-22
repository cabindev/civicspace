'use client'

import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import axios from 'axios';
import { FaUser, FaPhone, FaCalendar, FaEye, FaVideo, FaFilePdf, FaMapMarkerAlt, FaHome } from 'react-icons/fa';
import { Spin, Modal } from 'antd';
import Navbar from '../../Navbar';
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
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const fetchTraditionDetails = useCallback(async () => {
    if (!id) return;

    try {
      setLoading(true);
      const response = await axios.get(`/api/tradition/${id}`);
      setTradition(response.data);
      
      // Increment view count using PUT
      await axios.put(`/api/tradition/${id}`, { action: 'incrementViewCount' });
    } catch (error) {
      console.error('Failed to fetch tradition details:', error);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchTraditionDetails();
  }, [fetchTraditionDetails]);

  const handleImageClick = (url: string) => {
    setSelectedImage(url);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Spin size="large" />
      </div>
    );
  }

  if (!tradition) {
    return <div className="text-center text-2xl mt-10">ไม่พบข้อมูลงานบุญประเพณี</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar/>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-24">
        <Link href="/components/traditions" className="inline-block mb-8">
          <div className="text-green-600 hover:text-green-700 transition-colors duration-300">
            <FaHome className="inline mr-2" />
            กลับสู่หน้ารวมงานบุญประเพณี
          </div>
        </Link>
        
        {/* Hero Section */}
        <div className="relative aspect-video mb-12 rounded-lg overflow-hidden shadow-xl">
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
            <h1 className="text-4xl md:text-5xl font-bold text-white p-8">{tradition.name}</h1>
          </div>
        </div>

        {/* Main Content */}
        <div className="bg-white shadow-lg rounded-lg overflow-hidden">
          <div className="p-8">
            <h2 className="text-3xl font-medium mb-6 text-green-600 border-b pb-2">ข้อมูลทั่วไป</h2>
            <div className="grid md:grid-cols-2 gap-6 mb-8">
              <div>
                <p className="mb-4 text-gray-700">
                  <span className="font-medium">ประเภท:</span> 
                  <span className="font-extralight ml-2">{tradition.category.name}</span>
                </p>
                <p className="mb-4 flex items-start">
                  <FaMapMarkerAlt className="mr-2 text-green-500 mt-1 flex-shrink-0" />
                  <span>
                    <span className="font-medium">พื้นที่:</span> 
                    <span className="font-extralight ml-2">{tradition.village ? `${tradition.village}, ` : ''}{tradition.district}, {tradition.amphoe}, {tradition.province}</span>
                  </span>
                </p>
                <p className="mb-4 text-gray-700">
                  <span className="font-medium">ภาค:</span> 
                  <span className="font-extralight ml-2">{tradition.type}</span>
                </p>
              </div>
              <div>
                <p className="mb-4 flex items-center">
                  <FaUser className="mr-2 text-green-500" />
                  <span className="font-medium">ผู้ประสานงาน:</span> 
                  <span className="font-extralight ml-2">{tradition.coordinatorName}</span>
                </p>
                {tradition.phone && (
                  <p className="mb-4 flex items-center">
                    <FaPhone className="mr-2 text-green-500" />
                    <span className="font-medium">เบอร์ติดต่อ:</span> 
                    <span className="font-extralight ml-2">{tradition.phone}</span>
                  </p>
                )}
                <p className="mb-4 flex items-center">
                  <FaCalendar className="mr-2 text-green-500" />
                  <span className="font-medium">ปีที่เริ่มดำเนินการ:</span> 
                  <span className="font-extralight ml-2">{tradition.startYear}</span>
                </p>
              </div>
            </div>

            <h2 className="text-3xl font-medium my-6 text-green-600 border-b pb-2">ประวัติและแนวทาง</h2>
            <div className="mb-8">
              <h3 className="text-xl font-medium mb-4 text-gray-700">แนวทางการจัดงานแบบปลอดเหล้า</h3>
              <p className="text-gray-600 leading-relaxed font-extralight">{tradition.alcoholFreeApproach}</p>
            </div>
            {tradition.results && (
              <div className="mb-8">
                <h3 className="text-xl font-medium mb-4 text-gray-700">ผลลัพธ์</h3>
                <p className="text-gray-600 leading-relaxed font-extralight">{tradition.results}</p>
              </div>
            )}
            <div className="mb-8">
              <h3 className="text-xl font-medium mb-4 text-gray-700">ประวัติของงาน</h3>
              <p className="text-gray-600 leading-relaxed font-extralight">{tradition.history}</p>
            </div>
          </div>
          
          {tradition.images && tradition.images.length > 1 && (
            <div className="p-8 bg-gray-50">
              <h2 className="text-3xl font-medium mb-6 text-green-600 border-b pb-2">รูปภาพประกอบเพิ่มเติม</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {tradition.images.slice(1).map((img) => (
                  <img 
                    key={img.id} 
                    src={img.url} 
                    alt="รูปภาพประกอบ" 
                    className="w-full h-48 object-cover rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300 cursor-pointer"
                    onClick={() => handleImageClick(img.url)}
                  />
                ))}
              </div>
            </div>
          )}
          
          {(tradition.videoLink || tradition.policyFileUrl) && (
            <div className="p-8">
              <h2 className="text-3xl font-medium mb-6 text-green-600 border-b pb-2">ไฟล์และลิงก์ที่เกี่ยวข้อง</h2>
              <div className="flex flex-col sm:flex-row sm:space-x-4">
                {tradition.videoLink && (
                  <a href={tradition.videoLink} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center bg-green-100 text-green-700 px-6 py-3 rounded-full hover:bg-green-200 transition duration-300 mb-4 sm:mb-0 font-medium">
                    <FaVideo className="mr-2" />
                    ดูวิดีโอประกอบ
                  </a>
                )}
                {tradition.policyFileUrl && (
                  <a href={tradition.policyFileUrl} download className="flex items-center justify-center bg-blue-100 text-blue-700 px-6 py-3 rounded-full hover:bg-blue-200 transition duration-300 font-medium">
                    <FaFilePdf className="mr-2" />
                    ดาวน์โหลดไฟล์นโยบาย
                  </a>
                )}
              </div>
            </div>
          )}
        </div>
        <div className="mt-8 flex justify-end items-center text-gray-600">
          <FaEye className="mr-2" />
          <p className="font-extralight">เข้าชมทั้งหมด {tradition.viewCount} ครั้ง</p>
        </div>
      </div>

      {/* Image Modal */}
      <Modal
          open={!!selectedImage}
          footer={null}
          onCancel={() => setSelectedImage(null)}
          width="auto"
          className="max-w-[95%] md:max-w-[80%] lg:max-w-[60%] mx-auto"
          styles={{
            body: { padding: 0 },
            content: {
              borderRadius: '0.5rem',
              overflow: 'hidden'
            }
          }}
          centered
        >
          {selectedImage && (
            <div className="relative aspect-auto max-h-[90vh] overflow-hidden">
              <img 
                src={selectedImage} 
                alt="รูปภาพขยาย" 
                className="w-full h-full object-contain"
              />
            </div>
          )}
        </Modal>
    </div>
  );
}