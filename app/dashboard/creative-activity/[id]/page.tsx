//app/dashboard/creative-activity/[id]/page.tsx
'use client'

import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import axios from 'axios';
import { FaUser, FaPhone, FaCalendar, FaEye, FaVideo, FaFilePdf, FaMapMarkerAlt, FaEdit, FaHome, FaTag, FaGlobe, FaListUl } from 'react-icons/fa';
import { Spin, message, Modal } from 'antd';

interface CreativeActivity {
  id: string;
  name: string;
  categoryId: string;
  subCategoryId: string;
  category: { name: string };
  subCategory: { name: string };
  district: string;
  amphoe: string;
  province: string;
  type: string;
  village?: string;
  coordinatorName: string;
  phone?: string;
  description: string;
  summary: string;
  results?: string;
  startYear: number;
  images: { id: string; url: string }[];
  videoLink?: string;
  reportFileUrl?: string;
  viewCount: number;
}

export default function CreativeActivityDetails() {
  const { id } = useParams();
  const [activity, setActivity] = useState<CreativeActivity | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const fetchActivity = useCallback(async () => {
    try {
      const response = await axios.get(`/api/creative-activity/${id}`);
      setActivity(response.data);
      await axios.put(`/api/creative-activity/${id}`, { action: 'incrementViewCount' }, {
        headers: { 'Content-Type': 'application/json' }
      });
    } catch (error) {
      console.error('Error fetching activity:', error);
      message.error('ไม่สามารถโหลดข้อมูลกิจกรรมสร้างสรรค์ได้');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchActivity();
  }, [fetchActivity]);

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

  if (!activity) {
    return <div className="text-center text-2xl mt-10 text-gray-900">ไม่พบข้อมูลกิจกรรมสร้างสรรค์</div>;
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-5xl mx-auto px-6 lg:px-8 pt-24 pb-16">
        <Link href="/dashboard/creative-activity" className="inline-block mb-12">
          <div className="text-gray-600 hover:text-green-600 transition-colors duration-200 flex items-center gap-2 text-sm font-medium">
            <FaHome className="text-sm" />
            กลับสู่หน้ารวมกิจกรรมสร้างสรรค์
          </div>
        </Link>

        {/* Hero Section */}
        <div className="mb-16">
          <div className="aspect-[16/9] rounded-2xl overflow-hidden bg-gray-100 mb-6">
            {activity.images && activity.images.length > 0 ? (
              <img
                src={activity.images[0].url}
                alt={activity.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                <p className="text-gray-400 font-light">ไม่มีรูปภาพ</p>
              </div>
            )}
          </div>
          <h1 className="text-2xl md:text-3xl font-normal text-gray-900 leading-tight">
            {activity.name}
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
                  <span className="text-gray-900 font-light">{activity.category.name}</span>
                </div>
                <div className="flex items-center gap-3">
                  <FaListUl className="text-green-500 flex-shrink-0" />
                  <span className="text-gray-500 font-light">หมวดหมู่ย่อย</span>
                  <span className="text-gray-900 font-light">{activity.subCategory.name}</span>
                </div>
                <div className="flex items-start gap-3">
                  <FaMapMarkerAlt className="text-green-500 mt-1 flex-shrink-0" />
                  <div>
                    <span className="text-gray-500 font-light">พื้นที่</span>
                    <div className="text-gray-900 font-light">
                      {activity.village ? `${activity.village}, ` : ""}{activity.district}, {activity.amphoe}, {activity.province}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <FaGlobe className="text-green-500 flex-shrink-0" />
                  <span className="text-gray-900 font-light">{activity.type}</span>
                </div>
              </div>
              <div className="space-y-6">
                <div className="flex items-center gap-3">
                  <FaCalendar className="text-green-500 flex-shrink-0" />
                  <span className="text-gray-500 font-light">ปีที่เริ่มดำเนินการ</span>
                  <span className="text-gray-900 font-light">{activity.startYear}</span>
                </div>
                <div className="flex items-center gap-3">
                  <FaUser className="text-green-500 flex-shrink-0" />
                  <span className="text-gray-500 font-light">ผู้ประสานงาน</span>
                  <span className="text-gray-900 font-light">{activity.coordinatorName}</span>
                </div>
                {activity.phone && (
                  <div className="flex items-center gap-3">
                    <FaPhone className="text-green-500 flex-shrink-0" />
                    <span className="text-gray-500 font-light">เบอร์ติดต่อ</span>
                    <span className="text-gray-900 font-light">{activity.phone}</span>
                  </div>
                )}
              </div>
            </div>
          </section>

          {/* Content Sections */}
          <section className="space-y-12">
            <div>
              <h3 className="text-xl font-normal mb-6 text-gray-900">รายละเอียดกิจกรรม</h3>
              <p className="text-gray-700 leading-relaxed font-light text-lg">{activity.description}</p>
            </div>
            
            <div>
              <h3 className="text-xl font-normal mb-6 text-gray-900">สรุปเนื้อหาการดำเนินงาน</h3>
              <p className="text-gray-700 leading-relaxed font-light text-lg">{activity.summary}</p>
            </div>
            
            {activity.results && (
              <div>
                <h3 className="text-xl font-normal mb-6 text-gray-900">ผลลัพธ์</h3>
                <p className="text-gray-700 leading-relaxed font-light text-lg">{activity.results}</p>
              </div>
            )}
          </section>

          {/* Additional Images */}
          {activity.images && activity.images.length > 1 && (
            <section>
              <h2 className="text-2xl font-normal mb-8 text-gray-900">รูปภาพประกอบเพิ่มเติม</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {activity.images.slice(1).map((img) => (
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

          {/* Files and Links */}
          {(activity.videoLink || activity.reportFileUrl) && (
            <section>
              <h2 className="text-2xl font-normal mb-8 text-gray-900">ไฟล์และลิงก์ที่เกี่ยวข้อง</h2>
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

          {/* Bottom Actions and View Count */}
          <div className="flex justify-between items-center pt-8">
            <Link
              href={`/dashboard/creative-activity/edit/${activity.id}`}
              className="inline-flex items-center gap-2 bg-green-50 text-green-700 px-6 py-3 rounded-xl hover:bg-green-100 transition-colors duration-200 font-light"
            >
              <FaEdit />
              แก้ไขกิจกรรม
            </Link>
            <div className="flex items-center text-gray-500">
              <FaEye className="mr-2" />
              <p className="font-light">เข้าชมทั้งหมด {activity.viewCount} ครั้ง</p>
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
        className="max-w-[95%] md:max-w-[80%] lg:max-w-[60%] mx-auto"
        styles={{
          body: { padding: 0 },
          content: {
            borderRadius: "1rem",
            overflow: "hidden",
            border: 'none'
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