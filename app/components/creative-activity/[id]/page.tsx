//app/components/creative-activity/[id]/page.tsx
'use client'

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
// Server Actions
import { getCreativeActivityById } from '@/app/lib/actions/creative-activity/get';
import { incrementCreativeActivityViewCount } from '@/app/lib/actions/creative-activity/put';
import { FaUser, FaPhone, FaCalendar, FaEye, FaVideo, FaFilePdf, FaMapMarkerAlt, FaHome, FaTag, FaGlobe, FaListUl, FaImage } from 'react-icons/fa';
import { Modal, Spin } from 'antd';
import Navbar from '../../Navbar';
import PrintPage from '../../PrintPage';
import NotFoundPage from '../../NotFoundPage';

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
  user: {
    firstName: string;
    lastName: string;
    image: string | null;
    email: string;
  };
}

export default function CreativeActivityDetails() {
  const { id } = useParams();
  const router = useRouter();
  const [activity, setActivity] = useState<CreativeActivity | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [imageErrors, setImageErrors] = useState<Set<string>>(new Set());
  const viewCountUpdated = useRef(false);

  const fetchActivityDetails = useCallback(async () => {
    if (!id || typeof id !== 'string') {
      setNotFound(true);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      
      // Get creative activity data
      const result = await getCreativeActivityById(id);
      if (result.success && result.data) {
        setActivity(result.data);
        
        // Increment view count only once
        if (!viewCountUpdated.current) {
          await incrementCreativeActivityViewCount(id);
          viewCountUpdated.current = true;
        }
      } else {
        console.error('Failed to fetch creative activity details:', result.error);
        setNotFound(true);
        // Redirect to creative activities list after 3 seconds
        setTimeout(() => {
          router.push('/components/creative-activity');
        }, 3000);
      }
    } catch (error) {
      console.error('Failed to fetch creative activity details:', error);
      setNotFound(true);
      // Redirect to creative activities list after 3 seconds
      setTimeout(() => {
        router.push('/components/creative-activity');
      }, 3000);
    } finally {
      setLoading(false);
    }
  }, [id, router]);

  useEffect(() => {
    fetchActivityDetails();
  }, [fetchActivityDetails]);

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

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-white">
        <Spin size="large" />
      </div>
    );
  }

  if (notFound || !activity) {
    return (
      <NotFoundPage
        title="ไม่พบข้อมูลกิจกรรมสร้างสรรค์"
        description="กิจกรรมสร้างสรรค์ที่คุณกำลังหาไม่มีอยู่ในระบบ หรืออาจถูกลบออกไปแล้ว"
        backUrl="/components/creative-activity"
        backText="กลับสู่หน้ารวมกิจกรรมสร้างสรรค์"
        buttonColor="orange"
        isDashboard={false}
      />
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <div className="max-w-5xl mx-auto px-6 lg:px-8 pt-24 pb-16">
        <div className="flex justify-between items-center mb-12">
          <Link
            href="/components/creative-activity"
            className="inline-block"
            data-back-button
          >
            <div className="text-gray-600 hover:text-green-600 transition-colors duration-200 flex items-center gap-2 text-base md:text-lg font-medium">
              <FaHome className="text-green-500 text-lg md:text-xl" />
              กลับสู่หน้ารวมกิจกรรมสร้างสรรค์
            </div>
          </Link>

          <PrintPage showText={true} iconSize="md" />
        </div>

        {/* Hero Section */}
        <div className="mb-16">
          <div className="aspect-[16/9] rounded-2xl overflow-hidden bg-gray-100 mb-6">
            {activity.images && activity.images.length > 0 && !imageErrors.has(activity.images[0].url) ? (
              <img
                src={activity.images[0].url}
                alt={activity.name}
                className="w-full h-full object-cover"
                onError={() => handleImageError(activity.images[0].url)}
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex flex-col items-center justify-center">
                <FaImage className="text-6xl text-gray-400 mb-4" />
                <p className="text-gray-500 font-light text-lg">ไม่มีรูปภาพ</p>
                <p className="text-gray-400 font-light text-sm">
                  {activity.category.name}
                </p>
              </div>
            )}
          </div>
          <h4 className="text-xl md:text-xl font-normal text-gray-900 leading-tight">
            {activity.name}
          </h4>
        </div>

        {/* Main Content */}
        <div className="space-y-16">
          {/* General Information */}
          <section className="print-avoid-break">
            <h4 className="text-xl font-normal mb-8 text-gray-900">
              ข้อมูลทั่วไป
            </h4>
            <div className="grid md:grid-cols-2 gap-x-16 gap-y-6">
              <div className="space-y-6">
                <div className="flex items-center gap-3">
                  <FaTag className="text-green-500 flex-shrink-0" />
                  <span className="text-gray-900 font-light">
                    {activity.category.name}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <FaListUl className="text-green-500 flex-shrink-0" />
                  <span className="text-gray-500 font-light">หมวดหมู่ย่อย</span>
                  <span className="text-gray-900 font-light">
                    {activity.subCategory.name}
                  </span>
                </div>
                <div className="flex items-start gap-3">
                  <FaMapMarkerAlt className="text-green-500 mt-1 flex-shrink-0" />
                  <div className="print-avoid-break">
                    <span className="text-gray-500 font-light">พื้นที่</span>
                    <div className="text-gray-900 font-light">
                      {activity.village ? `${activity.village}, ` : ""}
                      {activity.district}, {activity.amphoe},{" "}
                      {activity.province}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <FaGlobe className="text-green-500 flex-shrink-0" />
                  <span className="text-gray-900 font-light">
                    {activity.type}
                  </span>
                </div>
              </div>
              <div className="space-y-6">
                <div className="flex items-center gap-3">
                  <FaUser className="text-green-500 flex-shrink-0" />
                  <span className="text-gray-500 font-light">ผู้ประสานงาน</span>
                  <span className="text-gray-900 font-light">
                    {activity.coordinatorName}
                  </span>
                </div>
                {activity.phone && (
                  <div className="flex items-center gap-3">
                    <FaPhone className="text-green-500 flex-shrink-0" />
                    <span className="text-gray-500 font-light">
                      เบอร์ติดต่อ
                    </span>
                    <span className="text-gray-900 font-light">
                      {activity.phone}
                    </span>
                  </div>
                )}
                <div className="flex items-center gap-3">
                  <FaCalendar className="text-green-500 flex-shrink-0" />
                  <span className="text-gray-500 font-light">
                    ปีที่เริ่มดำเนินการ
                  </span>
                  <span className="text-gray-900 font-light">
                    {activity.startYear}
                  </span>
                </div>
              </div>
            </div>
          </section>

          {/* Content Sections */}
          <section className="space-y-12">
            <div className="print-avoid-break">
              <h3 className="text-xl font-normal mb-6 text-gray-900">
                รายละเอียดกิจกรรม
              </h3>
              <p className="text-gray-700 leading-relaxed font-light text-lg">
                {activity.description}
              </p>
            </div>

            <div>
              <h3 className="text-xl font-normal mb-6 text-gray-900">
                สรุปเนื้อหาการดำเนินงาน
              </h3>
              <p className="text-gray-700 leading-relaxed font-light text-lg">
                {activity.summary}
              </p>
            </div>

            {activity.results && (
              <div className="print-avoid-break">
                <h3 className="text-xl font-normal mb-6 text-gray-900">
                  ผลลัพธ์
                </h3>
                <p className="text-gray-700 leading-relaxed font-light text-lg">
                  {activity.results}
                </p>
              </div>
            )}
          </section>

          {/* Additional Images */}
          {activity.images && activity.images.length > 1 && (
            <section>
              <h2 className="text-2xl font-normal mb-8 text-gray-900">
                รูปภาพประกอบเพิ่มเติม
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {activity.images.slice(1)
                  .filter(img => !imageErrors.has(img.url))
                  .map((img) => (
                  <div
                    key={img.id}
                    className="aspect-square rounded-xl overflow-hidden bg-gray-100 cursor-pointer transition-transform duration-200 hover:scale-105"
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

          {/* Files and Links - Hidden in print */}
          {(activity.videoLink || activity.reportFileUrl) && (
            <section className="no-print">
              <h2 className="text-2xl font-normal mb-8 text-gray-900">
                ไฟล์และลิงก์ที่เกี่ยวข้อง
              </h2>
              <div className="flex flex-wrap gap-4">
                {activity.videoLink && (
                  <a
                    href={activity.videoLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 bg-green-50 text-green-700 px-6 py-3 rounded-xl hover:bg-green-100 transition-colors duration-200 font-light"
                  >
                    <FaVideo />
                    ดูวิดีโอประกอบ
                  </a>
                )}
                {activity.reportFileUrl && (
                  <a
                    href={activity.reportFileUrl}
                    download
                    className="inline-flex items-center gap-2 bg-green-50 text-green-700 px-6 py-3 rounded-xl hover:bg-green-100 transition-colors duration-200 font-light"
                  >
                    <FaFilePdf />
                    ดาวน์โหลดไฟล์รายงาน
                  </a>
                )}
              </div>
            </section>
          )}
          {/* Author Information - เพิ่มส่วนนี้ก่อน View Count */}
          <section className="rounded-xl p-0 no-print">
            <h3 className="text-sm font-light text-gray-500 mb-4">
              Recorder Information
            </h3>
            <div className="flex items-center gap-4">
              <div className="flex-shrink-0">
                {activity.user.image ? (
                  <img
                    src={activity.user.image}
                    alt={`${activity.user.firstName} ${activity.user.lastName}`}
                    className="w-12 h-12 rounded-full object-cover border-2 border-green-200"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                      const parent = target.parentElement;
                      if (parent) {
                        parent.innerHTML = `
                          <div class="w-12 h-12 rounded-full bg-green-100 border-2 border-green-200 flex items-center justify-center">
                            <svg class="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                              <path fill-rule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clip-rule="evenodd" />
                            </svg>
                          </div>
                        `;
                      }
                    }}
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-green-100 border-2 border-green-200 flex items-center justify-center">
                    <FaUser className="text-green-600 text-lg" />
                  </div>
                )}
              </div>
              <div>
                <p className="font-light text-gray-900">
                  {activity.user.firstName} {activity.user.lastName}
                </p>
                <p className="text-sm text-gray-500">{activity.user.email}</p>
              </div>
            </div>
          </section>

          {/* View Count - Hidden in print */}
          <div className="flex justify-end items-center text-gray-500 pt-8 no-print">
            <FaEye className="mr-2" />
            <p className="font-light">
              เข้าชมทั้งหมด {activity.viewCount} ครั้ง
            </p>
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
            borderRadius: "1rem",
            overflow: "hidden",
            border: "none",
          },
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