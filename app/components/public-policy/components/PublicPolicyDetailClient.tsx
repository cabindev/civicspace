// app/components/public-policy/components/PublicPolicyDetailClient.tsx
'use client'

import React, { useState } from 'react';
import Link from 'next/link';
import { FaCalendar, FaEye, FaVideo, FaFilePdf, FaMapMarkerAlt, FaHome, FaTag, FaUser, FaGlobe, FaListUl } from 'react-icons/fa';
import { Modal } from 'antd';
import Navbar from '../../Navbar';
import PrintPage from '../../PrintPage';

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
  content: string[] | string | Record<string, any>;
  summary: string;
  results?: string;
  images: { id: string; url: string }[];
  videoLink?: string;
  policyFileUrl?: string;
  viewCount: number;
  user: {
    firstName: string;
    lastName: string;
  };
}

interface PublicPolicyDetailClientProps {
  policy: PublicPolicy;
}

export default function PublicPolicyDetailClient({ policy }: PublicPolicyDetailClientProps) {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [imageErrors, setImageErrors] = useState<Set<string>>(new Set());

  const getPolicyLevelText = (level: string) => {
    const levels: Record<string, string> = {
      NATIONAL: 'ระดับประเทศ',
      HEALTH_REGION: 'ระดับเขตสุขภาพ',
      PROVINCIAL: 'ระดับจังหวัด',
      DISTRICT: 'ระดับอำเภอ',
      SUB_DISTRICT: 'ระดับตำบล',
      VILLAGE: 'ระดับหมู่บ้าน'
    };
    return levels[level] || level;
  };

  const getPolicyContentText = (content: string) => {
    const contents: Record<string, string> = {
      LAW_ENFORCEMENT: 'การบังคับใช้กฎหมาย',
      ALCOHOL_FREE_TRADITION: 'บุญประเพณีปลอดเหล้า',
      ALCOHOL_FREE_MERIT: 'งานบุญปลอดเหล้า',
      CHILD_YOUTH_PROTECTION: 'การปกป้องเด็กและเยาวชน',
      CREATIVE_SPACE: 'พื้นที่สร้างสรรค์'
    };
    return contents[content] || content;
  };

  const renderContent = () => {
    if (!policy?.content) return 'ไม่มีข้อมูลเนื้อหา';
    
    if (Array.isArray(policy.content)) {
      return policy.content.map(item => getPolicyContentText(item)).join(', ');
    } else if (typeof policy.content === 'string') {
      try {
        const contentArray = JSON.parse(policy.content);
        if (Array.isArray(contentArray)) {
          return contentArray.map((item: string) => getPolicyContentText(item)).join(', ');
        }
        return getPolicyContentText(policy.content);
      } catch (e) {
        return getPolicyContentText(policy.content);
      }
    } else if (typeof policy.content === 'object') {
      return 'ข้อมูลเนื้อหาไม่ถูกต้อง';
    }
    return 'ไม่มีข้อมูลเนื้อหา';
  };

  const handleImageClick = (url: string) => {
    setSelectedImage(url);
  };

  const handleImageError = (url: string) => {
    setImageErrors(prev => {
      const next = new Set(prev);
      next.add(url);
      return next;
    });
    console.warn('Failed to load image:', url);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-5xl mx-auto px-6 lg:px-8 pt-24 pb-16">
        <div className="flex justify-between items-center mb-12">
          <Link
            href="/components/public-policy"
            className="inline-block"
            data-back-button
          >
            <div className="text-gray-600 hover:text-green-600 transition-colors duration-200 flex items-center gap-2 text-base md:text-lg font-medium">
              <FaHome className="text-green-500 text-lg md:text-xl" />
              กลับสู่หน้ารวมนโยบายสาธารณะ
            </div>
          </Link>

          <PrintPage showText={true} iconSize="md" />
        </div>
        
        {/* Hero Section */}
        <div className="mb-16">
          <div className="aspect-[16/9] rounded-2xl overflow-hidden bg-gray-100 mb-6">
            {policy.images && policy.images.length > 0 && !imageErrors.has(policy.images[0].url) ? (
              <img
                src={policy.images[0].url}
                alt={policy.name}
                className="w-full h-full object-cover cursor-pointer"
                onClick={() => handleImageClick(policy.images[0].url)}
                onError={() => handleImageError(policy.images[0].url)}
              />
            ) : (
              <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                <p className="text-gray-400 font-light">ไม่มีรูปภาพ</p>
              </div>
            )}
          </div>
          <h1 className="text-2xl md:text-3xl font-normal text-gray-900 leading-tight">
            {policy.name}
          </h1>
        </div>

        {/* Main Content */}
        <div className="space-y-16">
          {/* General Information */}
          <section>
            <h2 className="text-2xl font-normal mb-8 text-gray-900">ข้อมูลทั่วไป</h2>
            <div className="grid md:grid-cols-2 gap-x-16 gap-y-6">
              <div className="space-y-6">
                <div className="flex items-center gap-3">
                  <FaTag className="text-green-500 flex-shrink-0" />
                  <span className="text-gray-900 font-light">{getPolicyLevelText(policy.level)}</span>
                </div>
                <div className="flex items-start gap-3">
                  <FaMapMarkerAlt className="text-green-500 mt-1 flex-shrink-0" />
                  <div>
                    <span className="text-gray-500 font-light">พื้นที่</span>
                    <div className="text-gray-900 font-light">
                      {policy.village ? `${policy.village}, ` : ''}{policy.district}, {policy.amphoe}, {policy.province}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <FaGlobe className="text-green-500 flex-shrink-0" />
                  <span className="text-gray-900 font-light">{policy.type}</span>
                </div>
                <div className="flex items-center gap-3">
                  <FaUser className="text-green-500 flex-shrink-0" />
                  <span className="text-gray-500 font-light">ผู้สร้าง</span>
                  <span className="text-gray-900 font-light">
                    {policy.user?.firstName} {policy.user?.lastName}
                  </span>
                </div>
              </div>
              <div className="space-y-6">
                <div className="flex items-center gap-3">
                  <FaCalendar className="text-green-500 flex-shrink-0" />
                  <span className="text-gray-500 font-light">วันที่ลงนาม</span>
                  <span className="text-gray-900 font-light">
                    {new Date(policy.signingDate).toLocaleDateString('th-TH', { year: 'numeric', month: 'long', day: 'numeric' })}
                  </span>
                </div>
                <div className="flex items-start gap-3">
                  <FaListUl className="text-green-500 mt-1 flex-shrink-0" />
                  <div>
                    <span className="text-gray-500 font-light">เนื้อหาของนโยบาย</span>
                    <div className="text-gray-900 font-light">
                      {policy?.content ? renderContent() : 'ไม่มีข้อมูลเนื้อหา'}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Content Sections */}
          <section className="space-y-12">
            <div>
              <h3 className="text-xl font-normal mb-6 text-gray-900">สรุป</h3>
              <p className="text-gray-700 leading-relaxed font-light text-lg whitespace-pre-line">{policy.summary}</p>
            </div>
            
            {policy.results && (
              <div>
                <h3 className="text-xl font-normal mb-6 text-gray-900">ผลลัพธ์</h3>
                <p className="text-gray-700 leading-relaxed font-light text-lg whitespace-pre-line">{policy.results}</p>
              </div>
            )}
          </section>

          {/* Additional Images */}
          {policy.images && policy.images.length > 1 && (
            <section>
              <h2 className="text-2xl font-normal mb-8 text-gray-900">รูปภาพประกอบเพิ่มเติม</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {policy.images.slice(1)
                  .filter(img => !imageErrors.has(img.url))
                  .map((img) => (
                  <div
                    key={img.id}
                    className="aspect-square rounded-xl overflow-hidden bg-gray-100 cursor-pointer transition-transform duration-200 hover:scale-105 border border-green-100 hover:border-green-300"
                    onClick={() => handleImageClick(img.url)}
                  >
                    <img 
                      src={img.url} 
                      alt="รูปภาพประกอบ" 
                      className="w-full h-full object-cover"
                      onError={() => handleImageError(img.url)}
                    />
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Files and Links */}
          {(policy.videoLink || policy.policyFileUrl) && (
            <section>
              <h2 className="text-2xl font-normal mb-8 text-gray-900">ไฟล์และลิงก์ที่เกี่ยวข้อง</h2>
              <div className="flex flex-wrap gap-4">
                {policy.videoLink && (
                  <a 
                    href={policy.videoLink} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="inline-flex items-center gap-2 bg-green-50 text-green-700 px-6 py-3 rounded-xl hover:bg-green-100 transition-colors duration-200 font-light border border-green-200"
                  >
                    <FaVideo />
                    ดูวิดีโอประกอบ
                  </a>
                )}
                {policy.policyFileUrl && (
                  <a 
                    href={policy.policyFileUrl} 
                    download 
                    className="inline-flex items-center gap-2 bg-green-50 text-green-700 px-6 py-3 rounded-xl hover:bg-green-100 transition-colors duration-200 font-light border border-green-200"
                  >
                    <FaFilePdf />
                    ดาวน์โหลดไฟล์นโยบาย
                  </a>
                )}
              </div>
            </section>
          )}

          {/* View Count */}
          <div className="flex justify-end items-center text-gray-500 pt-8">
            <FaEye className="mr-2" />
            <p className="font-light">เข้าชมทั้งหมด {policy.viewCount} ครั้ง</p>
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