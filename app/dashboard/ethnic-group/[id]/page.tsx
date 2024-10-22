'use client'

import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import axios from 'axios';
import { FaCalendar, FaEye, FaVideo, FaFilePdf, FaMapMarkerAlt, FaEdit, FaHome } from 'react-icons/fa';
import { Spin, message, Modal } from 'antd';

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

export default function EthnicGroupDetail() {
  const { id } = useParams();
  const [ethnicGroup, setEthnicGroup] = useState<EthnicGroup | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const router = useRouter();

  const fetchEthnicGroup = useCallback(async () => {
    try {
      const response = await axios.get(`/api/ethnic-group/${id}`);
      setEthnicGroup(response.data);
      await axios.put(`/api/ethnic-group/${id}`, { action: 'incrementViewCount' }, {
        headers: { 'Content-Type': 'application/json' }
      });
    } catch (error) {
      console.error('Error fetching ethnic group:', error);
      message.error('ไม่สามารถโหลดข้อมูลกลุ่มชาติพันธุ์ได้');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchEthnicGroup();
  }, [fetchEthnicGroup]);

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

  const handleImageClick = (url: string) => {
    setSelectedImage(url);
  };

  return (
    <div className="bg-gray-50 min-h-screen pt-24">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link href="/dashboard/ethnic-group" className="inline-block mb-8">
          <div className="text-green-600 hover:text-green-700 transition-colors duration-300">
            <FaHome className="inline mr-2" />
            กลับสู่หน้ารวมกลุ่มชาติพันธุ์
          </div>
        </Link>
        
        {/* Hero Section */}
        <div className="relative aspect-video mb-12 rounded-lg overflow-hidden shadow-xl">
          {ethnicGroup.images && ethnicGroup.images.length > 0 ? (
            <img
              src={ethnicGroup.images[0].url}
              alt={ethnicGroup.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gray-200 flex items-center justify-center">
              <p className="text-gray-500">ไม่มีรูปภาพ</p>
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent flex items-end">
            <h1 className="text-4xl md:text-5xl font-bold text-white p-8">{ethnicGroup.name}</h1>
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
                  <span className="font-extralight ml-2">{ethnicGroup.category.name}</span>
                </p>
                <p className="mb-4 text-gray-700">
                  <span className="font-medium">ชื่อกิจกรรม:</span> 
                  <span className="font-extralight ml-2">{ethnicGroup.activityName}</span>
                </p>
                <p className="mb-4 flex items-start">
                  <FaMapMarkerAlt className="mr-2 text-green-500 mt-1 flex-shrink-0" />
                  <span>
                    <span className="font-medium">พื้นที่:</span> 
                    <span className="font-extralight ml-2">{ethnicGroup.village ? `${ethnicGroup.village}, ` : ''}{ethnicGroup.district}, {ethnicGroup.amphoe}, {ethnicGroup.province}</span>
                  </span>
                </p>
              </div>
              <div>
                <p className="mb-4 flex items-center">
                  <FaCalendar className="mr-2 text-green-500" />
                  <span className="font-medium">ปีที่เริ่มดำเนินการ:</span> 
                  <span className="font-extralight ml-2">{ethnicGroup.startYear}</span>
                </p>
              </div>
            </div>

            <h2 className="text-3xl font-medium my-6 text-green-600 border-b pb-2">รายละเอียดและประวัติ</h2>
            <div className="mb-8">
              <h3 className="text-xl font-medium mb-4 text-gray-700">ประวัติ</h3>
              <p className="text-gray-600 leading-relaxed font-extralight">{ethnicGroup.history}</p>
            </div>
            <div className="mb-8">
              <h3 className="text-xl font-medium mb-4 text-gray-700">ที่มาของกิจกรรม</h3>
              <p className="text-gray-600 leading-relaxed font-extralight">{ethnicGroup.activityOrigin}</p>
            </div>
            <div className="mb-8">
              <h3 className="text-xl font-medium mb-4 text-gray-700">รายละเอียดกิจกรรม</h3>
              <p className="text-gray-600 leading-relaxed font-extralight">{ethnicGroup.activityDetails}</p>
            </div>
            <div className="mb-8">
              <h3 className="text-xl font-medium mb-4 text-gray-700">แนวทางการจัดงานแบบปลอดเหล้า</h3>
              <p className="text-gray-600 leading-relaxed font-extralight">{ethnicGroup.alcoholFreeApproach}</p>
            </div>
            {ethnicGroup.results && (
              <div className="mb-8">
                <h3 className="text-xl font-medium mb-4 text-gray-700">ผลลัพธ์</h3>
                <p className="text-gray-600 leading-relaxed font-extralight">{ethnicGroup.results}</p>
              </div>
            )}
          </div>
          
          {ethnicGroup.images && ethnicGroup.images.length > 1 && (
            <div className="p-8 bg-gray-50">
              <h2 className="text-3xl font-medium mb-6 text-green-600 border-b pb-2">รูปภาพประกอบเพิ่มเติม</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {ethnicGroup.images.slice(1).map((img) => (
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
          
          {(ethnicGroup.videoLink || ethnicGroup.fileUrl) && (
            <div className="p-8">
              <h2 className="text-3xl font-medium mb-6 text-green-600 border-b pb-2">ไฟล์และลิงก์ที่เกี่ยวข้อง</h2>
              <div className="flex flex-col sm:flex-row sm:space-x-4">
                {ethnicGroup.videoLink && (
                  <a href={ethnicGroup.videoLink} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center bg-green-100 text-green-700 px-6 py-3 rounded-full hover:bg-green-200 transition duration-300 mb-4 sm:mb-0 font-medium">
                    <FaVideo className="mr-2" />
                    ดูวิดีโอประกอบ
                  </a>
                )}
                {ethnicGroup.fileUrl && (
                  <a href={ethnicGroup.fileUrl} download className="flex items-center justify-center bg-blue-100 text-blue-700 px-6 py-3 rounded-full hover:bg-blue-200 transition duration-300 font-medium">
                    <FaFilePdf className="mr-2" />
                    ดาวน์โหลดไฟล์
                  </a>
                )}
              </div>
            </div>
          )}
        </div>
        <div className="mt-8 flex justify-between items-center text-gray-600">
          <Link href={`/dashboard/ethnic-group/edit/${ethnicGroup.id}`} className="flex items-center bg-blue-500 text-white px-6 py-3 rounded-full hover:bg-blue-600 transition duration-300">
            <FaEdit className="mr-2" />
            แก้ไขข้อมูล
          </Link>
          <div className="flex items-center">
            <FaEye className="mr-2" />
            <p className="font-extralight">เข้าชมทั้งหมด {ethnicGroup.viewCount} ครั้ง</p>
          </div>
        </div>
      </div>

      {/* Image Modal */}
     
      <Modal
        open={!!selectedImage}
        footer={null}
        onCancel={() => setSelectedImage(null)}
        width="60%"
        styles={{
          body: { padding: 0 }
        }}
      >
        {selectedImage && (
          <img src={selectedImage} alt="รูปภาพขยาย" className="w-full h-auto" />
        )}
      </Modal>
    </div>
  );
}