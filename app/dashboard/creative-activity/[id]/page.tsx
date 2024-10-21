'use client'

import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import axios from 'axios';
import { FaCalendar, FaEye, FaVideo, FaFilePdf, FaMapMarkerAlt, FaEdit } from 'react-icons/fa';
import { Spin, message } from 'antd';

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
  const router = useRouter();

  const fetchActivity = useCallback(async () => {
    try {
      const response = await axios.get(`/api/creative-activity/${id}`);
      setActivity(response.data);
      // Increment view count
      await axios.put(`/api/creative-activity/${id}`, { action: 'incrementViewCount' }, {
        headers: {
          'Content-Type': 'application/json'
        }
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

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Spin size="large" />
      </div>
    );
  }

  if (!activity) {
    return <div className="text-center text-2xl mt-10">ไม่พบข้อมูลกิจกรรมสร้างสรรค์</div>;
  }

  return (
    <div className="bg-gray-100 min-h-screen pt-24">
      <div className="container mx-auto p-4 max-w-4xl">
        {/* Hero Section */}
        <div className="relative h-64 md:h-96 mb-8 rounded-lg overflow-hidden shadow-xl">
          {activity.images && activity.images.length > 0 ? (
            <img
              src={activity.images[0].url}
              alt={activity.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gray-200 flex items-center justify-center">
              <p className="text-gray-500">ไม่มีรูปภาพ</p>
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent flex items-end">
            <h1 className="text-3xl md:text-4xl font-bold text-white p-6">{activity.name}</h1>
          </div>
        </div>

        {/* Main Content */}
        <div className="bg-white shadow-lg rounded-lg overflow-hidden">
          <div className="p-6">
            <h2 className="text-2xl font-semibold mb-4 text-green-600 border-b pb-2">ข้อมูลทั่วไป</h2>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <p className="mb-2"><span className="font-semibold">ประเภท:</span> {activity.category.name}</p>
                <p className="mb-2"><span className="font-semibold">หมวดหมู่ย่อย:</span> {activity.subCategory.name}</p>
                <p className="mb-2 flex items-center">
                  <FaMapMarkerAlt className="mr-2 text-green-500" />
                  <span className="font-semibold">พื้นที่:</span> {activity.village ? `${activity.village}, ` : ''}{activity.district}, {activity.amphoe}, {activity.province}
                </p>
                <p className="mb-2"><span className="font-semibold">ภาค:</span> {activity.type}</p>
              </div>
              <div>
                <div className="flex items-center mb-4">
                  <FaCalendar className="mr-2 text-green-500" />
                  <span className="font-semibold mr-2">ปีที่เริ่มดำเนินการ:</span> {activity.startYear}
                </div>
                <p className="mb-2"><span className="font-semibold">ผู้ประสานงาน:</span> {activity.coordinatorName}</p>
                {activity.phone && (
                  <p className="mb-2"><span className="font-semibold">เบอร์ติดต่อ:</span> {activity.phone}</p>
                )}
              </div>
            </div>

            <h2 className="text-2xl font-semibold my-4 text-green-600 border-b pb-2">รายละเอียดกิจกรรม</h2>
            <div className="mb-4">
              <h3 className="font-semibold mb-2">รายละเอียด:</h3>
              <p className="text-gray-700">{activity.description}</p>
            </div>
            <div className="mb-4">
              <h3 className="font-semibold mb-2">สรุป:</h3>
              <p className="text-gray-700">{activity.summary}</p>
            </div>
            {activity.results && (
              <div className="mb-4">
                <h3 className="font-semibold mb-2">ผลลัพธ์:</h3>
                <p className="text-gray-700">{activity.results}</p>
              </div>
            )}
          </div>
          
          {activity.images && activity.images.length > 1 && (
            <div className="p-6 bg-gray-50">
              <h2 className="text-2xl font-semibold mb-4 text-green-600 border-b pb-2">รูปภาพประกอบเพิ่มเติม</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {activity.images.slice(1).map((img) => (
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
          
          {(activity.videoLink || activity.reportFileUrl) && (
            <div className="p-6">
              <h2 className="text-2xl font-semibold mb-4 text-green-600 border-b pb-2">ไฟล์และลิงก์ที่เกี่ยวข้อง</h2>
              <div className="flex flex-col md:flex-row md:space-x-4">
                {activity.videoLink && (
                  <a href={activity.videoLink} target="_blank" rel="noopener noreferrer" className="flex items-center bg-green-100 text-green-700 px-4 py-2 rounded-full hover:bg-green-200 transition duration-300 mb-2 md:mb-0">
                    <FaVideo className="mr-2" />
                    ดูวิดีโอประกอบ
                  </a>
                )}
                {activity.reportFileUrl && (
                  <a href={activity.reportFileUrl} download className="flex items-center bg-green-100 text-green-700 px-4 py-2 rounded-full hover:bg-green-200 transition duration-300">
                    <FaFilePdf className="mr-2" />
                    ดาวน์โหลดไฟล์รายงาน
                  </a>
                )}
              </div>
            </div>
          )}
        </div>
        <div className="mt-6 flex justify-between items-center text-gray-600">
          <Link href={`/dashboard/creative-activity/edit/${activity.id}`} className="flex items-center bg-blue-500 text-white px-4 py-2 rounded-full hover:bg-blue-600 transition duration-300">
            <FaEdit className="mr-2" />
            แก้ไขกิจกรรม
          </Link>
          <div className="flex items-center">
            <FaEye className="mr-2" />
            <p>เข้าชมทั้งหมด {activity.viewCount} ครั้ง</p>
          </div>
        </div>
      </div>
    </div>
  );
}