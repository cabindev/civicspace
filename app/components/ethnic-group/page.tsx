//app/components/ethnic-group/page.tsx
'use client'

import React, { useState, useEffect } from 'react';
import { Spin } from 'antd';
import Link from 'next/link';
// Server Actions
import { getEthnicGroups } from '@/app/lib/actions/ethnic-group/get';
import { FaCalendar, FaMapMarkerAlt, FaImage } from 'react-icons/fa';
import Navbar from '../Navbar';
import Pagination from '../Pagination';

interface EthnicGroup {
  id: string;
  name: string;
  category: { name: string };
  province: string;
  startYear: number;
  images?: { id: string; url: string }[];
}

const ITEMS_PER_PAGE = 12;

export default function EthnicGroupList() {
  const [ethnicGroups, setEthnicGroups] = useState<EthnicGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    const fetchEthnicGroups = async () => {
      try {
        const result = await getEthnicGroups();
        if (result.success) {
          setEthnicGroups(result.data);
        } else {
          console.error('Failed to fetch ethnic groups:', result.error);
        }
      } catch (error) {
        console.error('Failed to fetch ethnic groups:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchEthnicGroups();
  }, []);

  const totalPages = Math.ceil(ethnicGroups.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentGroups = ethnicGroups.slice(startIndex, endIndex);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
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
            Ethnic Communities & Culture
          </h1>
          <p className="text-xl font-light text-gray-600">
            กลุ่มชาติพันธุ์
          </p>
          <div className="mt-4 w-24 h-1 bg-gradient-to-r from-green-400 to-green-600 mx-auto rounded-full"></div>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {currentGroups.map((group) => (
            <Link href={`/components/ethnic-group/${group.id}`} key={group.id}>
              <div className="bg-white rounded-2xl overflow-hidden transition-transform duration-200 hover:scale-105 cursor-pointer">
                <div className="aspect-[16/9] relative">
                  {group.images && group.images.length > 0 ? (
                    <img
                      src={group.images[0].url}
                      alt={group.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex flex-col items-center justify-center">
                      <FaImage className="text-4xl text-gray-400 mb-2" />
                      <p className="text-gray-500 font-light text-sm">ไม่มีรูปภาพ</p>
                      <p className="text-gray-400 font-light text-xs">{group.category.name}</p>
                    </div>
                  )}
                </div>
                
                <div className="p-6">
                  <h2 className="text-lg font-normal text-gray-900 mb-4 line-clamp-2 leading-tight">
                    {group.name}
                  </h2>
                  
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <FaCalendar className="text-green-500 flex-shrink-0" />
                      <span className="font-light">ปีที่เริ่ม: {group.startYear}</span>
                    </div>
                    
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <FaMapMarkerAlt className="text-green-500 flex-shrink-0" />
                      <span className="font-light">{group.province}</span>
                    </div>
                    
                    <div className="pt-2 border-t border-gray-100">
                      <p className="text-sm text-gray-700">
                        <span className="font-medium">ประเภท:</span> 
                        <span className="font-light ml-1">{group.category.name}</span>
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Empty State */}
        {currentGroups.length === 0 && (
          <div className="text-center py-16">
            <div className="w-24 h-24 mx-auto mb-6 bg-gray-100 rounded-full flex items-center justify-center">
              <FaImage className="text-4xl text-gray-400" />
            </div>
            <h3 className="text-xl font-normal text-gray-900 mb-2">ไม่พบกลุ่มชาติพันธุ์</h3>
            <p className="text-gray-500 font-light">ยังไม่มีข้อมูลกลุ่มชาติพันธุ์ในระบบ</p>
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
        {ethnicGroups.length > 0 && (
          <div className="mt-8 text-center text-sm text-gray-500">
            แสดง {startIndex + 1}-{Math.min(endIndex, ethnicGroups.length)} จาก {ethnicGroups.length} รายการ
          </div>
        )}
      </div>
    </div>
  );
}