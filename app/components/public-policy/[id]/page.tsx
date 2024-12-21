'use client'

import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import axios from 'axios';
import { FaCalendar, FaEye, FaVideo, FaFilePdf, FaMapMarkerAlt, FaListUl, FaHome } from 'react-icons/fa';
import { Modal, Spin } from 'antd';
import Navbar from '../../Navbar';

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
  viewCount: number;
}

const levelNameMap: Record<string, string> = {
  'NATIONAL': 'ระดับประเทศ',
  'HEALTH_REGION': 'ระดับเขตสุขภาพ',
  'PROVINCIAL': 'ระดับจังหวัด',
  'DISTRICT': 'ระดับอำเภอ',
  'SUB_DISTRICT': 'ระดับตำบล',
  'VILLAGE': 'ระดับหมู่บ้าน'
};

const contentNameMap: Record<string, string> = {
  'LAW_ENFORCEMENT': 'การบังคับใช้กฎหมาย',
  'ALCOHOL_FREE_TRADITION': 'บุญประเพณีปลอดเหล้า',
  'ALCOHOL_FREE_MERIT': 'งานบุญปลอดเหล้า',
  'CHILD_YOUTH_PROTECTION': 'การปกป้องเด็กและเยาวชน',
  'CREATIVE_SPACE': 'พื้นที่สร้างสรรค์'
};


export default function PublicPolicyDetails() {
  const { id } = useParams();
  const [policy, setPolicy] = useState<PublicPolicy | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const fetchPolicyDetails = useCallback(async () => {
    if (!id) return;

    try {
      setLoading(true);
      const response = await axios.get(`/api/public-policy/${id}`);
      setPolicy(response.data);
      
      // Increment view count
      await axios.put(`/api/public-policy/${id}`, { action: 'incrementViewCount' });
    } catch (error) {
      console.error('Failed to fetch public policy details:', error);
    } finally {
      setLoading(false);
    }
  }, [id]);
  

  useEffect(() => {
    fetchPolicyDetails();
  }, [fetchPolicyDetails]);

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

  if (!policy) {
    return <div className="text-center text-2xl mt-10">ไม่พบข้อมูลนโยบายสาธารณะ</div>;
  }

  
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-24">
        <Link href="/components/public-policy" className="inline-block mb-8">
          <div className="text-green-600 hover:text-green-700 transition-colors duration-300">
            <FaHome className="inline mr-2" />
            กลับสู่หน้ารวมนโยบายสาธารณะ
          </div>
        </Link>
        
        {/* Hero Section */}
        <div className="relative aspect-video mb-12 rounded-lg overflow-hidden shadow-xl">
          {policy.images && policy.images.length > 0 ? (
            <img
              src={policy.images[0].url}
              alt={policy.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gray-200 flex items-center justify-center">
              <p className="text-gray-500">ไม่มีรูปภาพ</p>
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent flex items-end">
            <h1 className="text-4xl md:text-5xl font-bold text-white p-8">{policy.name}</h1>
          </div>
        </div>

        {/* Main Content */}
        <div className="bg-white shadow-lg rounded-lg overflow-hidden">
          <div className="p-8">
            <h2 className="text-3xl font-medium mb-6 text-green-600 border-b pb-2">ข้อมูลทั่วไป</h2>
            <div className="grid md:grid-cols-2 gap-6 mb-8">
              <div>
                <p className="mb-4 flex items-center">
                  <FaCalendar className="mr-2 text-green-500" />
                  <span className="font-medium text-gray-700">วันที่ลงนาม:</span> 
                  <span className="ml-2 font-extralight">{new Date(policy.signingDate).toLocaleDateString('th-TH')}</span>
                </p>
                <p className="mb-4">
                  <span className="font-medium text-gray-700">ระดับ:</span> 
                  <span className="ml-2 font-extralight">{levelNameMap[policy.level]}</span>
                </p>
                <p className="mb-4 flex items-start">
                  <FaMapMarkerAlt className="mr-2 text-green-500 mt-1 flex-shrink-0" />
                  <span>
                    <span className="font-medium text-gray-700">พื้นที่:</span> 
                    <span className="ml-2 font-extralight">{policy.village ? `${policy.village}, ` : ''}{policy.district}, {policy.amphoe}, {policy.province}</span>
                  </span>
                </p>
              </div>
              <div>
                <p className="mb-4">
                  <span className="font-medium text-gray-700">ประเภท:</span> 
                  <span className="ml-2 font-extralight">{policy.type}</span>
                </p>
                <p className="mb-4">
                  <span className="font-medium text-gray-700">เนื้อหาของนโยบาย:</span> 
                  <span className="ml-2 font-extralight">
                    {policy.content.map(c => contentNameMap[c]).join(', ')}
                  </span>
                </p>
              </div>
            </div>

            <h2 className="text-3xl font-medium my-6 text-green-600 border-b pb-2">รายละเอียด</h2>
            <div className="mb-8">
              <h3 className="text-xl font-medium mb-4 text-gray-700">สรุป</h3>
              <p className="text-gray-600 leading-relaxed font-extralight">{policy.summary}</p>
            </div>
            {policy.results && (
              <div className="mb-8">
                <h3 className="text-xl font-medium mb-4 text-gray-700">ผลลัพธ์</h3>
                <p className="text-gray-600 leading-relaxed font-extralight">{policy.results}</p>
              </div>
            )}
          </div>
          
          {policy.images && policy.images.length > 1 && (
            <div className="p-8 bg-gray-50">
              <h2 className="text-3xl font-medium mb-6 text-green-600 border-b pb-2">รูปภาพประกอบเพิ่มเติม</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {policy.images.slice(1).map((img) => (
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
          
          {(policy.videoLink || policy.policyFileUrl) && (
            <div className="p-8">
              <h2 className="text-3xl font-medium mb-6 text-green-600 border-b pb-2">ไฟล์และลิงก์ที่เกี่ยวข้อง</h2>
              <div className="flex flex-col sm:flex-row sm:space-x-4">
                {policy.videoLink && (
                  <a href={policy.videoLink} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center bg-green-100 text-green-700 px-6 py-3 rounded-full hover:bg-green-200 transition duration-300 mb-4 sm:mb-0 font-medium">
                    <FaVideo className="mr-2" />
                    ดูวิดีโอประกอบ
                  </a>
                )}
                {policy.policyFileUrl && (
                  <a href={policy.policyFileUrl} download className="flex items-center justify-center bg-blue-100 text-blue-700 px-6 py-3 rounded-full hover:bg-blue-200 transition duration-300 font-medium">
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
          <p className="font-extralight">เข้าชมทั้งหมด {policy.viewCount} ครั้ง</p>
        </div>
      </div>
      
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