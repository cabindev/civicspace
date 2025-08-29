// app/dashboard/tradition/[id]/components/TraditionDetailClient.tsx
'use client'

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { FaUser, FaPhone, FaCalendar, FaEye, FaVideo, FaFilePdf, FaMapMarkerAlt, FaHome, FaTag, FaGlobe, FaEdit } from 'react-icons/fa';
import { Modal } from 'antd';

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
  hasPolicy: boolean;
  hasAnnouncement: boolean;
  hasInspector: boolean;
  hasMonitoring: boolean;
  hasCampaign: boolean;
  hasAlcoholPromote: boolean;
}

interface TraditionDetailClientProps {
  tradition: Tradition;
}

export default function TraditionDetailClient({ tradition }: TraditionDetailClientProps) {
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
    <div className="min-h-screen bg-white">
      <div className="max-w-5xl mx-auto px-6 lg:px-8 pt-8 pb-16">
        <Link href="/dashboard/tradition" className="inline-block mb-12">
          <div className="text-gray-600 hover:text-green-600 transition-colors duration-200 flex items-center gap-2 text-sm font-medium">
            <FaHome className="text-sm" />
            กลับสู่หน้ารวมงานบุญประเพณี
          </div>
        </Link>

        
        {/* Hero Section */}
        <div className="mb-16">

          <div className="aspect-[16/9] rounded-2xl overflow-hidden bg-gray-100 mb-6 relative max-w-3xl mx-auto">
            {tradition.images && tradition.images.length > 0 && !imageErrors.has(tradition.images[0].url) ? (
              <Image
                src={tradition.images[0].url}
                alt={tradition.name}
                fill
                className="object-cover cursor-pointer"
                onClick={() => handleImageClick(tradition.images[0].url)}
                onError={() => handleImageError(tradition.images?.[0]?.url || '')}
                style={{ imageRendering: 'crisp-edges' }}
                quality={100}
                unoptimized
              />
            ) : (
              <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                <p className="text-gray-400 font-light">ไม่มีรูปภาพ</p>
              </div>
            )}
          </div>
          <h1 className="text-xl md:text-2xl font-normal text-gray-900 leading-tight">
            {tradition.name}
          </h1>
        </div>

        {/* Main Content */}
        <div className="space-y-16">
          {/* General Information */}
          <section>
            <h2 className="text-xl font-normal mb-6 text-gray-900">ข้อมูลทั่วไป</h2>
            <div className="grid md:grid-cols-2 gap-x-16 gap-y-6">
              <div className="space-y-6">
                <div className="flex items-center gap-3">
                  <FaTag className="text-green-500 flex-shrink-0" />
                  <span className="text-gray-900 font-light">{tradition.category.name}</span>
                </div>
                <div className="flex items-start gap-3">
                  <FaMapMarkerAlt className="text-green-500 mt-1 flex-shrink-0" />
                  <div>
                    <span className="text-gray-500 font-light">พื้นที่</span>
                    <div className="text-gray-900 font-light">
                      {tradition.village ? `${tradition.village}, ` : ""}{tradition.district}, {tradition.amphoe}, {tradition.province}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <FaGlobe className="text-green-500 flex-shrink-0" />
                  <span className="text-gray-900 font-light">{tradition.type}</span>
                </div>
              </div>
              <div className="space-y-6">
                <div className="flex items-center gap-3">
                  <FaUser className="text-green-500 flex-shrink-0" />
                  <span className="text-gray-500 font-light">ผู้ประสานงาน</span>
                  <span className="text-gray-900 font-light">{tradition.coordinatorName}</span>
                </div>
                {tradition.phone && (
                  <div className="flex items-center gap-3">
                    <FaPhone className="text-green-500 flex-shrink-0" />
                    <span className="text-gray-500 font-light">เบอร์ติดต่อ</span>
                    <span className="text-gray-900 font-light">{tradition.phone}</span>
                  </div>
                )}
                <div className="flex items-center gap-3">
                  <FaCalendar className="text-green-500 flex-shrink-0" />
                  <span className="text-gray-500 font-light">ปีที่เริ่มดำเนินการ</span>
                  <span className="text-gray-900 font-light">{tradition.startYear}</span>
                </div>
              </div>
            </div>
          </section>

          {/* Content Sections */}
          <section className="space-y-12">
            <div>
              <h3 className="text-xl font-normal mb-6 text-gray-900">ประวัติและที่มา</h3>
              <p className="text-gray-700 leading-relaxed font-light text-lg whitespace-pre-line">{tradition.history}</p>
            </div>
            
            <div>
              <h3 className="text-xl font-normal mb-6 text-gray-900">แนวทางการจัดงานแบบปลอดเหล้า</h3>
              <p className="text-gray-700 leading-relaxed font-light text-lg whitespace-pre-line">{tradition.alcoholFreeApproach}</p>
            </div>
            
            {tradition.results && (
              <div>
                <h3 className="text-xl font-normal mb-6 text-gray-900">ผลลัพธ์</h3>
                <p className="text-gray-700 leading-relaxed font-light text-lg whitespace-pre-line">{tradition.results}</p>
              </div>
            )}
          </section>

          {/* Additional Images */}
          {tradition.images && tradition.images.length > 1 && (
            <section>
              <h2 className="text-2xl font-normal mb-8 text-gray-900">รูปภาพประกอบเพิ่มเติม</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {tradition.images.slice(1)
                  .filter(img => !imageErrors.has(img.url))
                  .map((img) => (
                  <div
                    key={img.id}
                    className="aspect-square rounded-xl overflow-hidden bg-gray-100 cursor-pointer transition-transform duration-200 hover:scale-105 border border-green-100 hover:border-green-300 relative"
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
          {(tradition.videoLink || tradition.policyFileUrl) && (
            <section>
              <h2 className="text-2xl font-normal mb-8 text-gray-900">ไฟล์และลิงก์ที่เกี่ยวข้อง</h2>
              <div className="flex flex-wrap gap-4">
                {tradition.videoLink && (
                  <a
                    href={tradition.videoLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 bg-green-50 text-green-700 px-6 py-3 rounded-xl hover:bg-green-100 transition-colors duration-200 font-light border border-green-200"
                  >
                    <FaVideo />
                    ดูวิดีโอประกอบ
                  </a>
                )}
                {tradition.policyFileUrl && (
                  <a
                    href={tradition.policyFileUrl}
                    download
                    className="inline-flex items-center gap-2 bg-green-50 text-green-700 px-6 py-3 rounded-xl hover:bg-green-100 transition-colors duration-200 font-light border border-green-200"
                  >
                    <FaFilePdf />
                    ดาวน์โหลดไฟล์
                  </a>
                )}
              </div>
            </section>
          )}

          {/* Bottom Actions and View Count */}
          <div className="flex justify-between items-center pt-8 border-t border-gray-100">
            <Link
              href={`/dashboard/tradition/edit/${tradition.id}`}
              className="inline-flex items-center gap-2 bg-green-600 text-white px-6 py-3 rounded-xl hover:bg-green-700 transition-colors duration-200 font-medium"
            >
              <FaEdit />
              แก้ไขข้อมูล
            </Link>
            <div className="flex items-center text-gray-500">
              <FaEye className="mr-2" />
              <p className="font-light">เข้าชมทั้งหมด {tradition.viewCount} ครั้ง</p>
            </div>
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
            content: { borderRadius: "1rem", overflow: "hidden", border: "none" },
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
    </div>
  );
}