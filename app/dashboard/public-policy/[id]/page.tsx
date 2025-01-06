// app/dashboard/public-policy/[id]/page.tsx
'use client'

import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import axios from 'axios';
import { FaCalendar, FaEye, FaVideo, FaFilePdf, FaMapMarkerAlt, FaEdit, FaHome } from 'react-icons/fa';
import { Spin, message, Modal } from 'antd';

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
}

export default function PublicPolicyDetail() {
  const { id } = useParams();
  const [policy, setPolicy] = useState<PublicPolicy | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const router = useRouter();

  const fetchPolicy = useCallback(async () => {
    try {
      const response = await axios.get(`/api/public-policy/${id}`);
      setPolicy(response.data);
      await axios.put(`/api/public-policy/${id}`, { action: 'incrementViewCount' }, {
        headers: { 'Content-Type': 'application/json' }
      });
    } catch (error) {
      console.error('Error fetching policy:', error);
      message.error('ไม่สามารถโหลดข้อมูลนโยบายได้');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchPolicy();
  }, [fetchPolicy]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Spin size="large" />
      </div>
    );
  }

  if (!policy) {
    return <div className="text-center text-2xl mt-10">ไม่พบข้อมูลนโยบายสาธารณะ</div>;
  }

  const getPolicyLevelText = (level: string) => {
    const levels: Record<string, string> = {
      NATIONAL: 'ระดับประเทศ',
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
    if (Array.isArray(policy.content)) {
      return (
        <ul className="list-disc pl-5">
          {policy.content.map((item, index) => (
            <li key={index} className="text-gray-700">{getPolicyContentText(item)}</li>
          ))}
        </ul>
      );
    } else if (typeof policy.content === 'string') {
      try {
        const contentArray = JSON.parse(policy.content);
        if (Array.isArray(contentArray)) {
          return (
            <ul className="list-disc pl-5">
              {contentArray.map((item, index) => (
                <li key={index} className="text-gray-700">{getPolicyContentText(item)}</li>
              ))}
            </ul>
          );
        }
      } catch (e) {
        // If parsing fails, just display the string
        return <p className="text-gray-700">{getPolicyContentText(policy.content)}</p>;
      }
    }
    return <p className="text-gray-700">ไม่มีข้อมูลเนื้อหา</p>;
  };

  const handleImageClick = (url: string) => {
    setSelectedImage(url);
  };

  return (
    <div className="bg-gray-50 min-h-screen pt-24">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link href="/dashboard/public-policy" className="inline-block mb-8">
          <div className="text-green-600 hover:text-green-700 transition-colors duration-300">
            <FaHome className="inline mr-2" />
            กลับสู่หน้ารวมนโยบายสาธารณะ
          </div>
        </Link>
        
        {/* Hero Section */}
        <div className="relative aspect-video mb-12 rounded-lg overflow-hidden shadow-xl">
          {policy.images && policy.images.length > 0 ? (
            <img
              src={policy.images[0].url}
              alt={policy.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gray-200 flex items-center justify-center">
              <p className="text-gray-500">ไม่มีรูปภาพ</p>
            </div>
          )}
          <div
            className="absolute inset-0 bg-gradient-to-t 
                        from-black via-transparent to-transparent
                        flex items-end"
          >
            <h1 className="text-2xl md:text-md font-bold text-white p-8">
              {policy.name}
            </h1>
          </div>
        </div>

        {/* Main Content */}
        <div className="bg-white shadow-lg rounded-lg overflow-hidden">
          <div className="p-8">
            <h2 className="text-3xl font-medium mb-6 text-green-600 border-b pb-2">ข้อมูลทั่วไป</h2>
            <div className="grid md:grid-cols-2 gap-6 mb-8">
              <div>
                <p className="mb-4 text-gray-700">
                  <span className="font-medium">ระดับ:</span> 
                  <span className="font-extralight ml-2">{getPolicyLevelText(policy.level)}</span>
                </p>
                <p className="mb-4 flex items-start">
                  <FaMapMarkerAlt className="mr-2 text-green-500 mt-1 flex-shrink-0" />
                  <span>
                    <span className="font-medium">พื้นที่:</span> 
                    <span className="font-extralight ml-2">{policy.village ? `${policy.village}, ` : ''}{policy.district}, {policy.amphoe}, {policy.province}</span>
                  </span>
                </p>
                <p className="mb-4 text-gray-700">
                  <span className="font-medium">ประเภท:</span> 
                  <span className="font-extralight ml-2">{policy.type}</span>
                </p>
              </div>
              <div>
                <p className="mb-4 flex items-center">
                  <FaCalendar className="mr-2 text-green-500" />
                  <span className="font-medium">วันที่ลงนาม:</span> 
                  <span className="font-extralight ml-2">
                    {new Date(policy.signingDate).toLocaleDateString('th-TH', { year: 'numeric', month: 'long', day: 'numeric' })}
                  </span>
                </p>
              </div>
            </div>

            <h2 className="text-3xl font-medium my-6 text-green-600 border-b pb-2">รายละเอียดนโยบาย</h2>
            <div className="mb-8">
              <h3 className="text-xl font-medium mb-4 text-gray-700">เนื้อหา</h3>
              <div className="text-gray-600 leading-relaxed font-extralight">
                {renderContent()}
              </div>
            </div>
            <div className="mb-8">
              <h3 className="text-xl font-medium mb-4 text-gray-700">สรุป</h3>
              <p className="text-gray-600 leading-relaxed font-extralight">{policy.summary}</p>
            </div>
            {policy.results && (
              <div className="mb-8">
                <h3 className="text-xl font-medium mb-4 text-gray-700">ผลลัพธ์</h3>
                <p className="text-gray-600 leading-relaxed font-extralight">{policy.results}</p>
              </div>
            )}
          </div>
          
          {policy.images && policy.images.length > 1 && (
            <div className="p-8 bg-gray-50">
              <h2 className="text-3xl font-medium mb-6 text-green-600 border-b pb-2">รูปภาพประกอบเพิ่มเติม</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {policy.images.slice(1).map((img) => (
                  <img 
                    key={img.id} 
                    src={img.url} 
                    alt="รูปภาพประกอบ" 
                    className="w-full h-48 object-cover rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300 cursor-pointer"
                    onClick={() => handleImageClick(img.url)}
                  />
                ))}
              </div>
            </div>
          )}
          
          {(policy.videoLink || policy.policyFileUrl) && (
            <div className="p-8">
              <h2 className="text-3xl font-medium mb-6 text-green-600 border-b pb-2">ไฟล์และลิงก์ที่เกี่ยวข้อง</h2>
              <div className="flex flex-col sm:flex-row sm:space-x-4">
                {policy.videoLink && (
                  <a href={policy.videoLink} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center bg-green-100 text-green-700 px-6 py-3 rounded-full hover:bg-green-200 transition duration-300 mb-4 sm:mb-0 font-medium">
                    <FaVideo className="mr-2" />
                    ดูวิดีโอประกอบ
                  </a>
                )}
                {policy.policyFileUrl && (
                  <a href={policy.policyFileUrl} download className="flex items-center justify-center bg-green-100 text-green-700 px-6 py-3 rounded-full hover:bg-green-200 transition duration-300 font-medium">
                    <FaFilePdf className="mr-2" />
                    ดาวน์โหลดไฟล์นโยบาย
                  </a>
                )}
              </div>
            </div>
          )}
        </div>
        <div className="mt-8 flex justify-between items-center text-gray-600">
          <Link href={`/dashboard/public-policy/edit/${policy.id}`} className="flex items-center bg-green-500 text-white px-6 py-3 rounded-full hover:bg-green-600 transition duration-300">
            <FaEdit className="mr-2" />
            แก้ไขนโยบาย
          </Link>
          <div className="flex items-center">
            <FaEye className="mr-2" />
            <p className="font-extralight">เข้าชมทั้งหมด {policy.viewCount} ครั้ง</p>
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
              borderRadius: '0.5rem',
              overflow: 'hidden'
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