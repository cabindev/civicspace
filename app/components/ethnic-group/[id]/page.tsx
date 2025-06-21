//app/components/ethnic-group/[id]/page.tsx
'use client'

import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import axios from 'axios';
import { FaCalendar, FaEye, FaVideo, FaFileAlt, FaMapMarkerAlt, FaUsers, FaHistory, FaHome, FaTag, FaImage } from 'react-icons/fa';
import { Modal, Spin } from 'antd';
import Navbar from '../../Navbar';
import PrintPage from '../../PrintPage';

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
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const fetchEthnicGroupDetails = useCallback(async () => {
    if (!id) return;

    try {
      setLoading(true);
      const response = await axios.get(`/api/ethnic-group/${id}`);
      setEthnicGroup(response.data);
      
      // Increment view count
      await axios.put(`/api/ethnic-group/${id}`, { action: 'incrementViewCount' });
    } catch (error) {
      console.error('Failed to fetch ethnic group details:', error);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchEthnicGroupDetails();
  }, [fetchEthnicGroupDetails]);

  const handleImageClick = (url: string) => {
    setSelectedImage(url);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-white">
        <Spin size="large" />
      </div>
    );
  }

  if (!ethnicGroup) {
    return <div className="text-center text-2xl mt-10 text-gray-900">ไม่พบข้อมูลกลุ่มชาติพันธุ์</div>;
  }

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <div className="max-w-5xl mx-auto px-6 lg:px-8 pt-24 pb-16">
        <div className="flex justify-between items-center mb-12">
          <Link href="/components/ethnic-group" className="inline-block" data-back-button>
           <div className="text-gray-600 hover:text-green-600 transition-colors duration-200 flex items-center gap-2 text-base md:text-lg font-medium">
              <FaHome className="text-lg md:text-xl" />
              กลับสู่หน้ารวมกลุ่มชาติพันธุ์
            </div>
          </Link>
          
          <PrintPage showText={true} iconSize="md" />
        </div>
        
        {/* Hero Section */}
        <div className="mb-16">
          <div className="aspect-[16/9] rounded-2xl overflow-hidden bg-gray-100 mb-6">
            {ethnicGroup.images && ethnicGroup.images.length > 0 ? (
              <img
                src={ethnicGroup.images[0].url}
                alt={ethnicGroup.name}
                className="w-full h-full object-cover"
              />
            ) : (
                <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex flex-col items-center justify-center">
                <FaImage className="text-6xl text-gray-400 mb-4" />
                <p className="text-gray-500 text-base font-medium">ไม่มีรูปภาพ</p>
                <p className="text-gray-400 text-sm font-normal">{ethnicGroup.category.name}</p>
                </div>
            )}
          </div>
            <h4 className="text-xl md:text-xl font-normal text-gray-900 leading-tight">
            {ethnicGroup.name}
            </h4>
        </div>

        {/* Main Content */}
        <div className="space-y-16">
          {/* General Information */}
          <section className="print-avoid-break">
            <h4 className="text-xl font-normal mb-8 text-gray-900">ข้อมูลทั่วไป</h4>
            <div className="grid md:grid-cols-2 gap-x-16 gap-y-6">
              <div className="space-y-6">
                <div className="flex items-center gap-3">
                  <FaTag className="text-green-500 flex-shrink-0" />
                  <span className="text-gray-900 font-light">{ethnicGroup.category.name}</span>
                </div>
                <div className="flex items-start gap-3">
                  <FaMapMarkerAlt className="text-green-500 mt-1 flex-shrink-0" />
                  <div className="print-avoid-break">
                    <span className="text-gray-500 font-light">พื้นที่</span>
                    <div className="text-gray-900 font-light">
                      {ethnicGroup.village ? `${ethnicGroup.village}, ` : ''}{ethnicGroup.district}, {ethnicGroup.amphoe}, {ethnicGroup.province}
                    </div>
                  </div>
                </div>
              </div>
              <div className="space-y-6">
                <div className="flex items-center gap-3">
                  <FaHistory className="text-green-500 flex-shrink-0" />
                  <span className="text-gray-500 font-light">ชื่อกิจกรรม</span>
                  <span className="text-gray-900 font-light">{ethnicGroup.activityName}</span>
                </div>
                <div className="flex items-center gap-3">
                  <FaCalendar className="text-green-500 flex-shrink-0" />
                  <span className="text-gray-500 font-light">ปีที่เริ่มดำเนินการ</span>
                  <span className="text-gray-900 font-light">{ethnicGroup.startYear}</span>
                </div>
              </div>
            </div>
          </section>

          {/* Content Sections */}
          <section className="space-y-12">
            <div className="print-avoid-break">
              <h3 className="text-xl font-normal mb-6 text-gray-900">ประวัติ</h3>
              <p className="text-gray-700 leading-relaxed font-light text-lg">{ethnicGroup.history}</p>
            </div>
            
            <div className="print-avoid-break">
              <h3 className="text-xl font-normal mb-6 text-gray-900">ที่มาของกิจกรรม</h3>
              <p className="text-gray-700 leading-relaxed font-light text-lg">{ethnicGroup.activityOrigin}</p>
            </div>
            
            <div className="print-avoid-break">
              <h3 className="text-xl font-normal mb-6 text-gray-900">รายละเอียดกิจกรรม</h3>
              <p className="text-gray-700 leading-relaxed font-light text-lg">{ethnicGroup.activityDetails}</p>
            </div>
            
            <div className="print-avoid-break">
              <h3 className="text-xl font-normal mb-6 text-gray-900">แนวทางการจัดงานแบบปลอดเหล้า</h3>
              <p className="text-gray-700 leading-relaxed font-light text-lg">{ethnicGroup.alcoholFreeApproach}</p>
            </div>
            
            {ethnicGroup.results && (
              <div className="print-avoid-break">
                <h3 className="text-xl font-normal mb-6 text-gray-900">ผลลัพธ์</h3>
                <p className="text-gray-700 leading-relaxed font-light text-lg">{ethnicGroup.results}</p>
              </div>
            )}
          </section>

          {/* Additional Images */}
          {ethnicGroup.images && ethnicGroup.images.length > 1 && (
            <section>
              <h2 className="text-2xl font-normal mb-8 text-gray-900">รูปภาพประกอบเพิ่มเติม</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {ethnicGroup.images.slice(1).map((img) => (
                  <div
                    key={img.id}
                    className="aspect-square rounded-xl overflow-hidden bg-gray-100 cursor-pointer transition-transform duration-200 hover:scale-105"
                    onClick={() => handleImageClick(img.url)}
                  >
                    <img 
                      src={img.url} 
                      alt="รูปภาพประกอบ" 
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Files and Links - Hidden in print */}
          {(ethnicGroup.videoLink || ethnicGroup.fileUrl) && (
            <section className="no-print">
              <h2 className="text-2xl font-normal mb-8 text-gray-900">ไฟล์และลิงก์ที่เกี่ยวข้อง</h2>
              <div className="flex flex-wrap gap-4">
                {ethnicGroup.videoLink && (
                  <a 
                    href={ethnicGroup.videoLink} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="inline-flex items-center gap-2 bg-green-50 text-green-700 px-6 py-3 rounded-xl hover:bg-green-100 transition-colors duration-200 font-light"
                  >
                    <FaVideo />
                    ดูวิดีโอประกอบ
                  </a>
                )}
                {ethnicGroup.fileUrl && (
                  <a 
                    href={ethnicGroup.fileUrl} 
                    download 
                    className="inline-flex items-center gap-2 bg-green-50 text-green-700 px-6 py-3 rounded-xl hover:bg-green-100 transition-colors duration-200 font-light"
                  >
                    <FaFileAlt />
                    ดาวน์โหลดไฟล์
                  </a>
                )}
              </div>
            </section>
          )}

          {/* View Count - Hidden in print */}
          <div className="flex justify-end items-center text-gray-500 pt-8 no-print">
            <FaEye className="mr-2" />
            <p className="font-light">เข้าชมทั้งหมด {ethnicGroup.viewCount} ครั้ง</p>
          </div>
        </div>
      </div>

      {/* Image Modal - Hidden in print */}
      <Modal
        open={!!selectedImage}
        footer={null}
        onCancel={() => setSelectedImage(null)}
        width="auto"
        className="max-w-[95%] md:max-w-[80%] lg:max-w-[60%] mx-auto no-print"
        styles={{
          body: { padding: 0 },
          content: {
            borderRadius: '1rem',
            overflow: 'hidden',
            border: 'none'
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