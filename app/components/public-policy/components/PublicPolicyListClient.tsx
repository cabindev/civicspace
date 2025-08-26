// app/components/public-policy/components/PublicPolicyListClient.tsx
'use client'

import { useState, useCallback } from 'react';
import { Spin } from 'antd';
import Link from 'next/link';
import { FaCalendar, FaMapMarkerAlt, FaImage } from 'react-icons/fa';
import Navbar from '../../Navbar';
import Pagination from '../../Pagination';

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

interface PublicPolicyListClientProps {
  initialPolicies: PublicPolicy[];
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

export default function PublicPolicyListClient({ initialPolicies }: PublicPolicyListClientProps) {
  const [policies] = useState<PublicPolicy[]>(initialPolicies);
  const [loading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.ceil(policies.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentPolicies = policies.slice(startIndex, endIndex);

  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex items-center justify-center min-h-[50vh]">
          <Spin size="large" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-16">
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-normal text-gray-900 mb-4">
            นโยบายสาธารณะ
          </h1>
          <p className="text-lg text-gray-600 font-light max-w-2xl mx-auto">
            รวบรวมนโยบายสาธารณะและข้อบังคับต่างๆ ที่เกี่ยวข้องกับการสร้างสรรค์และอนุรักษ์ประเพณีไทย
          </p>
        </div>

        {policies.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <FaImage className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-xl font-medium text-gray-900 mb-2">ยังไม่มีนโยบายสาธารณะ</h3>
            <p className="text-gray-600">ยังไม่มีข้อมูลนโยบายสาธารณะในระบบ</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {currentPolicies.map((policy) => (
                <Link 
                  key={policy.id} 
                  href={`/components/public-policy/${policy.id}`}
                  className="group"
                >
                  <div className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 transform group-hover:-translate-y-1 border border-gray-100">
                    <div className="aspect-[16/10] bg-gray-100 overflow-hidden">
                      {policy.images && policy.images.length > 0 ? (
                        <img
                          src={policy.images[0].url}
                          alt={policy.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-green-50 to-green-100 flex items-center justify-center">
                          <FaImage className="w-8 h-8 text-green-300" />
                        </div>
                      )}
                    </div>
                    
                    <div className="p-6">
                      <div className="mb-4">
                        <span className="inline-block bg-green-50 text-green-700 px-3 py-1 rounded-full text-sm font-medium border border-green-200">
                          {levelNameMap[policy.level] || policy.level}
                        </span>
                      </div>
                      
                      <h3 className="text-lg font-medium text-gray-900 mb-3 line-clamp-2 group-hover:text-green-600 transition-colors duration-200">
                        {policy.name}
                      </h3>
                      
                      <div className="space-y-2 text-sm text-gray-600">
                        <div className="flex items-start gap-2">
                          <FaMapMarkerAlt className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                          <span className="line-clamp-1">
                            {policy.district}, {policy.amphoe}, {policy.province}
                          </span>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <FaCalendar className="w-4 h-4 text-green-500 flex-shrink-0" />
                          <span>
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

            {totalPages > 1 && (
              <div className="mt-12">
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={handlePageChange}
                />
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}