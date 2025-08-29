//app/components/creative-activity/page.tsx
'use client'

import { useState, useEffect } from 'react';
import { Spin } from 'antd';
import Link from 'next/link';
// Server Actions
import { getCreativeActivities } from '@/app/lib/actions/creative-activity/get';
import { FaCalendar, FaMapMarkerAlt, FaUser, FaPhone, FaImage } from 'react-icons/fa';
import Navbar from '../Navbar';
import Pagination from '../Pagination';

interface CreativeActivity {
  id: string;
  name: string;
  province: string;
  type: string;
  startYear: number;
  images?: { id: string; url: string }[];
  category: { name: string };
  subCategory: { name: string };
  coordinatorName: string;
  phone: string;
}

const ITEMS_PER_PAGE = 12;

export default function CreativeActivityList() {
  const [activities, setActivities] = useState<CreativeActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [imageErrors, setImageErrors] = useState<Set<string>>(new Set());

  useEffect(() => {
    const fetchActivities = async () => {
      try {
        const result = await getCreativeActivities();
        if (result.success) {
          setActivities(result.data);
        } else {
          console.error('Failed to fetch creative activities:', result.error);
        }
      } catch (error) {
        console.error('Failed to fetch creative activities:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchActivities();
  }, []);

  const totalPages = Math.ceil(activities.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentActivities = activities.slice(startIndex, endIndex);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleImageError = (url: string) => {
    setImageErrors(prev => new Set(Array.from(prev).concat(url)));
    console.warn('Failed to load image:', url);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-white">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <Navbar/>
      <div className="max-w-7xl mx-auto px-6 lg:px-8 pt-24 pb-16">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-normal text-gray-900 mb-3">
            Creative Activity Hub
          </h1>
          <p className="text-xl font-light text-gray-600">
            กิจกรรมสร้างสรรค์
          </p>
          <div className="mt-4 w-24 h-1 bg-gradient-to-r from-green-400 to-green-600 mx-auto rounded-full"></div>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {currentActivities.map((activity) => (
            <Link href={`/components/creative-activity/${activity.id}`} key={activity.id}>
              <div className="bg-white rounded-2xl overflow-hidden transition-transform duration-200 hover:scale-105 cursor-pointer">
                <div className="aspect-[16/9] relative">
                  {activity.images && activity.images.length > 0 && !imageErrors.has(activity.images[0].url) ? (
                    <img
                      src={activity.images[0].url}
                      alt={activity.name}
                      className="w-full h-full object-cover"
                      onError={() => handleImageError(activity.images?.[0]?.url || '')}
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex flex-col items-center justify-center">
                      <FaImage className="text-4xl text-gray-400 mb-2" />
                      <p className="text-gray-500 font-light text-sm">ไม่มีรูปภาพ</p>
                      <p className="text-gray-400 font-light text-xs">{activity.category.name}</p>
                    </div>
                  )}
                </div>
                
                <div className="p-6">
                  <h2 className="text-lg font-normal text-gray-900 mb-4 line-clamp-2 leading-tight">
                    {activity.name}
                  </h2>
                  
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <FaCalendar className="text-green-500 flex-shrink-0" />
                      <span className="font-light">ปีที่เริ่ม: {activity.startYear}</span>
                    </div>
                    
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <FaMapMarkerAlt className="text-green-500 flex-shrink-0" />
                      <span className="font-light">{activity.province} | {activity.type}</span>
                    </div>
                    
                    <div className="pt-2 border-t border-gray-100">
                      <p className="text-sm text-gray-700 mb-1">
                        <span className="font-medium">ประเภท:</span> 
                        <span className="font-light ml-1">{activity.category.name}</span>
                      </p>
                      <p className="text-sm text-gray-700 mb-3">
                        <span className="font-medium">หมวดหมู่ย่อย:</span> 
                        <span className="font-light ml-1">{activity.subCategory.name}</span>
                      </p>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <FaUser className="text-green-500 flex-shrink-0" />
                        <span className="font-light">{activity.coordinatorName}</span>
                      </div>
                      
                      {activity.phone && (
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <FaPhone className="text-green-500 flex-shrink-0" />
                          <span className="font-light">{activity.phone}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Empty State */}
        {currentActivities.length === 0 && (
          <div className="text-center py-16">
            <div className="w-24 h-24 mx-auto mb-6 bg-gray-100 rounded-full flex items-center justify-center">
              <FaImage className="text-4xl text-gray-400" />
            </div>
            <h3 className="text-xl font-normal text-gray-900 mb-2">ไม่พบกิจกรรมสร้างสรรค์</h3>
            <p className="text-gray-500 font-light">ยังไม่มีข้อมูลกิจกรรมสร้างสรรค์ในระบบ</p>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
            className="mt-12"
          />
        )}

        {/* Results Info */}
        {activities.length > 0 && (
          <div className="mt-8 text-center text-sm text-gray-500">
            แสดง {startIndex + 1}-{Math.min(endIndex, activities.length)} จาก {activities.length} รายการ
          </div>
        )}
      </div>
    </div>
  );
}