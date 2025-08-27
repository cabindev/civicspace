// app/components/public-policy/page.tsx
'use client'

import { useState, useEffect } from 'react';
import { Spin } from 'antd';
import Link from 'next/link';
// Server Actions
import { getPublicPolicies } from '@/app/lib/actions/public-policy/get';
import { FaCalendar, FaMapMarkerAlt, FaImage } from 'react-icons/fa';
import Navbar from '../Navbar';
import Pagination from '../Pagination';

interface PublicPolicy {
  id: string;
  name: string;
  signingDate: string;
  level: string;
  district: string;
  amphoe: string;
  province: string;
  type: string;
  images?: { id: string; url: string }[];
}

const levelNameMap: Record<string, string> = {
  'NATIONAL': 'ระดับประเทศ',
  'HEALTH_REGION': 'ระดับเขตสุขภาพ',
  'PROVINCIAL': 'ระดับจังหวัด',
  'DISTRICT': 'ระดับอำเภอ',
  'SUB_DISTRICT': 'ระดับตำบล',
  'VILLAGE': 'ระดับหมู่บ้าน'
};

const ITEMS_PER_PAGE = 12;

export default function PublicPolicyList() {
  const [policies, setPolicies] = useState<PublicPolicy[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    const fetchPolicies = async () => {
      try {
        const result = await getPublicPolicies();
        if (result.success) {
          setPolicies(result.data);
        } else {
          console.error('Failed to fetch public policies:', result.error);
        }
      } catch (error) {
        console.error('Failed to fetch public policies:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchPolicies();
  }, []);

  const totalPages = Math.ceil(policies.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentPolicies = policies.slice(startIndex, endIndex);

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
      <Navbar />
      <div className="max-w-7xl mx-auto px-6 lg:px-8 pt-24 pb-16">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-normal text-gray-900 mb-3">
            Public Policy Hub
          </h1>
          <p className="text-xl font-light text-gray-600">
            นโยบายสาธารณะ
          </p>
          <div className="mt-4 w-24 h-1 bg-gradient-to-r from-green-400 to-green-600 mx-auto rounded-full"></div>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {currentPolicies.map((policy) => (
            <Link href={`/components/public-policy/${policy.id}`} key={policy.id}>
              <div className="bg-white rounded-2xl overflow-hidden transition-transform duration-200 hover:scale-105 cursor-pointer">
                <div className="aspect-[16/9] relative">
                  {policy.images && policy.images.length > 0 ? (
                    <img
                      src={policy.images[0].url}
                      alt={policy.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                      <FaImage className="text-2xl text-gray-400" />
                    </div>
                  )}
                </div>
                
                <div className="p-6">
                  <div className="mb-4">
                    <span className="inline-block bg-green-50 text-green-700 px-3 py-1 rounded-full text-sm font-medium border border-green-200">
                      {levelNameMap[policy.level] || policy.level}
                    </span>
                  </div>
                  
                  <h2 className="text-lg font-normal text-gray-900 mb-4 line-clamp-2 leading-tight">
                    {policy.name}
                  </h2>
                  
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <FaMapMarkerAlt className="text-green-500 flex-shrink-0" />
                      <span className="font-light line-clamp-1">
                        {policy.district}, {policy.amphoe}, {policy.province}
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <FaCalendar className="text-green-500 flex-shrink-0" />
                      <span className="font-light">
                        {new Date(policy.signingDate).toLocaleDateString('th-TH', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        })}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Empty State */}
        {currentPolicies.length === 0 && (
          <div className="text-center py-16">
            <div className="w-24 h-24 mx-auto mb-6 bg-gray-100 rounded-full flex items-center justify-center">
              <FaImage className="text-4xl text-gray-400" />
            </div>
            <h3 className="text-xl font-normal text-gray-900 mb-2">ไม่พบนโยบายสาธารณะ</h3>
            <p className="text-gray-500 font-light">ยังไม่มีข้อมูลนโยบายสาธารณะในระบบ</p>
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
        {policies.length > 0 && (
          <div className="mt-8 text-center text-sm text-gray-500">
            แสดง {startIndex + 1}-{Math.min(endIndex, policies.length)} จาก {policies.length} รายการ
          </div>
        )}
      </div>
    </div>
  );
}