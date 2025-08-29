// app/dashboard/ethnic-group/[id]/components/EthnicGroupDetailClient.tsx
'use client'

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { FaCalendar, FaEye, FaVideo, FaFileAlt, FaMapMarkerAlt, FaEdit, FaHome, FaTag, FaHistory } from 'react-icons/fa';
import { Modal } from 'antd';

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

interface EthnicGroupDetailClientProps {
  ethnicGroup: EthnicGroup;
}

export default function EthnicGroupDetailClient({ ethnicGroup }: EthnicGroupDetailClientProps) {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [imageErrors, setImageErrors] = useState<Set<string>>(new Set());

  const handleImageClick = (url: string) => {
    setSelectedImage(url);
  };

  const handleImageError = (url: string) => {
    setImageErrors(prev => new Set(Array.from(prev).concat(url)));
    console.warn('Failed to load image:', url);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 lg:px-6 pt-6 pb-12">
        <Link href="/dashboard/ethnic-group" className="inline-block mb-8">
          <div className="text-gray-500 hover:text-green-600 transition-colors duration-200 flex items-center gap-2 text-xs font-light">
            <FaHome className="text-xs" />
            กลับสู่หน้ารวมกลุ่มชาติพันธุ์
          </div>
        </Link>
        
        {/* Hero Section */}
        <div className="mb-10">
          <div className="aspect-[16/9] rounded-xl overflow-hidden bg-white mb-4 relative max-w-2xl mx-auto shadow-sm">
            {ethnicGroup.images && ethnicGroup.images.length > 0 && !imageErrors.has(ethnicGroup.images[0].url) ? (
              <Image
                src={ethnicGroup.images[0].url}
                alt={ethnicGroup.name}
                fill
                className="object-cover cursor-pointer"
                onClick={() => handleImageClick(ethnicGroup.images[0].url)}
                onError={() => handleImageError(ethnicGroup.images?.[0]?.url || '')}
                style={{ imageRendering: 'crisp-edges' }}
                quality={100}
                unoptimized
              />
            ) : (
              <div className="w-full h-full bg-gray-50 flex items-center justify-center">
                <p className="text-gray-300 font-light text-sm">ไม่มีรูปภาพ</p>
              </div>
            )}
          </div>
          <h1 className="text-lg md:text-xl font-light text-gray-800 leading-snug text-center">
            {ethnicGroup.name}
          </h1>
        </div>

        {/* Main Content */}
        <div className="space-y-8">
          {/* General Information */}
          <section className="bg-white rounded-lg p-6 shadow-sm">
            <h2 className="text-base font-light mb-4 text-gray-700 border-b border-gray-100 pb-2">ข้อมูลทั่วไป</h2>
            <div className="grid md:grid-cols-2 gap-x-8 gap-y-4">
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <FaTag className="text-green-400 text-xs flex-shrink-0" />
                  <span className="text-gray-700 font-light text-sm">{ethnicGroup.category.name}</span>
                </div>
                <div className="flex items-start gap-2">
                  <FaMapMarkerAlt className="text-green-400 text-xs mt-0.5 flex-shrink-0" />
                  <div>
                    <span className="text-gray-500 font-light text-xs block mb-1">พื้นที่</span>
                    <div className="text-gray-700 font-light text-sm leading-relaxed">
                      {ethnicGroup.village ? `${ethnicGroup.village}, ` : ''}{ethnicGroup.district}, {ethnicGroup.amphoe}, {ethnicGroup.province}
                    </div>
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex items-start gap-2">
                  <FaHistory className="text-green-400 text-xs mt-0.5 flex-shrink-0" />
                  <div>
                    <span className="text-gray-500 font-light text-xs block mb-1">ชื่อกิจกรรม</span>
                    <span className="text-gray-700 font-light text-sm">{ethnicGroup.activityName}</span>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <FaCalendar className="text-green-400 text-xs mt-0.5 flex-shrink-0" />
                  <div>
                    <span className="text-gray-500 font-light text-xs block mb-1">ปีที่เริ่มดำเนินการ</span>
                    <span className="text-gray-700 font-light text-sm">{ethnicGroup.startYear}</span>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Content Sections */}
          <div className="space-y-6">
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <h3 className="text-sm font-light mb-3 text-gray-600 border-b border-gray-100 pb-2">ประวัติ</h3>
              <p className="text-gray-700 leading-relaxed font-light text-sm whitespace-pre-line">{ethnicGroup.history}</p>
            </div>
            
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <h3 className="text-sm font-light mb-3 text-gray-600 border-b border-gray-100 pb-2">ที่มาของกิจกรรม</h3>
              <p className="text-gray-700 leading-relaxed font-light text-sm whitespace-pre-line">{ethnicGroup.activityOrigin}</p>
            </div>
            
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <h3 className="text-sm font-light mb-3 text-gray-600 border-b border-gray-100 pb-2">รายละเอียดกิจกรรม</h3>
              <p className="text-gray-700 leading-relaxed font-light text-sm whitespace-pre-line">{ethnicGroup.activityDetails}</p>
            </div>
            
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <h3 className="text-sm font-light mb-3 text-gray-600 border-b border-gray-100 pb-2">แนวทางการจัดงานแบบปลอดเหล้า</h3>
              <p className="text-gray-700 leading-relaxed font-light text-sm whitespace-pre-line">{ethnicGroup.alcoholFreeApproach}</p>
            </div>
            
            {ethnicGroup.results && (
              <div className="bg-white rounded-lg p-6 shadow-sm">
                <h3 className="text-sm font-light mb-3 text-gray-600 border-b border-gray-100 pb-2">ผลลัพธ์</h3>
                <p className="text-gray-700 leading-relaxed font-light text-sm whitespace-pre-line">{ethnicGroup.results}</p>
              </div>
            )}
          </div>

          {/* Additional Images */}
          {ethnicGroup.images && ethnicGroup.images.length > 1 && (
            <section className="bg-white rounded-lg p-6 shadow-sm">
              <h2 className="text-base font-light mb-4 text-gray-700 border-b border-gray-100 pb-2">รูปภาพประกอบเพิ่มเติม</h2>
              <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                {ethnicGroup.images.slice(1)
                  .filter(img => !imageErrors.has(img.url))
                  .map((img) => (
                  <div
                    key={img.id}
                    className="aspect-square rounded-lg overflow-hidden bg-gray-50 cursor-pointer transition-all duration-200 hover:scale-102 border border-gray-200 hover:border-green-300 relative hover:shadow-md"
                    onClick={() => handleImageClick(img.url)}
                  >
                    <Image
                      src={img.url}
                      alt="รูปภาพประกอบ"
                      fill
                      className="object-cover"
                      onError={() => handleImageError(img.url)}
                      style={{ imageRendering: 'crisp-edges' }}
                      quality={100}
                      unoptimized
                    />
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Files and Links */}
          {(ethnicGroup.videoLink || ethnicGroup.fileUrl) && (
            <section className="bg-white rounded-lg p-6 shadow-sm">
              <h2 className="text-base font-light mb-4 text-gray-700 border-b border-gray-100 pb-2">ไฟล์และลิงก์ที่เกี่ยวข้อง</h2>
              <div className="flex flex-wrap gap-3">
                {ethnicGroup.videoLink && (
                  <a 
                    href={ethnicGroup.videoLink} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="inline-flex items-center gap-2 bg-green-50 text-green-600 px-4 py-2 rounded-lg hover:bg-green-100 transition-colors duration-200 font-light border border-green-200 text-sm"
                  >
                    <FaVideo className="text-xs" />
                    ดูวิดีโอประกอบ
                  </a>
                )}
                {ethnicGroup.fileUrl && (
                  <a 
                    href={ethnicGroup.fileUrl} 
                    download 
                    className="inline-flex items-center gap-2 bg-green-50 text-green-600 px-4 py-2 rounded-lg hover:bg-green-100 transition-colors duration-200 font-light border border-green-200 text-sm"
                  >
                    <FaFileAlt className="text-xs" />
                    ดาวน์โหลดไฟล์
                  </a>
                )}
              </div>
            </section>
          )}

          {/* Bottom Actions and View Count */}
          <div className="flex justify-between items-center pt-6 border-t border-gray-200 bg-white rounded-lg p-6 shadow-sm">
            <Link 
              href={`/dashboard/ethnic-group/edit/${ethnicGroup.id}`} 
              className="inline-flex items-center gap-2 bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors duration-200 font-light text-sm shadow-sm"
            >
              <FaEdit className="text-xs" />
              แก้ไขข้อมูล
            </Link>
            <div className="flex items-center text-gray-400">
              <FaEye className="mr-2 text-xs" />
              <p className="font-light text-xs">เข้าชมทั้งหมด {ethnicGroup.viewCount} ครั้ง</p>
            </div>
          </div>
        </div>
      </div>

      {/* Image Modal */}
      <Modal
        open={!!selectedImage}
        footer={null}
        onCancel={() => setSelectedImage(null)}
        width="auto"
        className="max-w-[95%] md:max-w-[80%] lg:max-w-[70%] mx-auto"
        styles={{
          body: { padding: 0 },
          content: {
            borderRadius: '0.75rem',
            overflow: 'hidden',
            border: 'none',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
          }
        }}
        centered
      >
        {selectedImage && (
          <div className="relative aspect-auto max-h-[85vh] overflow-hidden">
            <img
              src={selectedImage}
              alt="รูปภาพขยาย"
              className="w-full h-full object-contain"
              style={{ imageRendering: 'crisp-edges' }}
            />
          </div>
        )}
      </Modal>
    </div>
  );
}