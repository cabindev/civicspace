//app/components/traditions/[id]/page.tsx
'use client'

import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import axios from 'axios';
import { FaUser, FaPhone, FaCalendar, FaEye, FaVideo, FaFilePdf, FaMapMarkerAlt, FaHome, FaTag, FaGlobe, FaImage } from 'react-icons/fa';
import { Spin, Modal } from 'antd';
import Navbar from '../../Navbar';
import PrintPage from '../../PrintPage';

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

export default function TraditionDetails() {
  const { id } = useParams();
  const [tradition, setTradition] = useState<Tradition | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const fetchTraditionDetails = useCallback(async () => {
    if (!id) return;

    try {
      setLoading(true);
      const response = await axios.get(`/api/tradition/${id}`);
      setTradition(response.data);
      
      // Increment view count using PUT
      await axios.put(`/api/tradition/${id}`, { action: 'incrementViewCount' });
    } catch (error) {
      console.error('Failed to fetch tradition details:', error);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchTraditionDetails();
  }, [fetchTraditionDetails]);

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

  if (!tradition) {
    return <div className="text-center text-2xl mt-10 text-gray-900">ไม่พบข้อมูลงานบุญประเพณี</div>;
  }

  return (
    <div className="min-h-screen bg-white">
      <Navbar/>
      <div className="max-w-5xl mx-auto px-6 lg:px-8 pt-24 pb-16">
        <div className="flex justify-between items-center mb-12">
           <Link href="/components/ethnic-group" className="inline-block" data-back-button>
           <div className="text-gray-600 hover:text-green-600 transition-colors duration-200 flex items-center gap-2 text-base md:text-lg font-medium">
              <FaHome className="text-lg md:text-xl" />
              กลับสู่หน้ารวมงานบุญประเพณี
            </div>
          </Link>
          
          <PrintPage showText={true} iconSize="md" />
        </div>
        
        {/* Hero Section */}
        <div className="mb-16">
          <div className="aspect-[16/9] rounded-2xl overflow-hidden bg-gray-100 mb-6">
            {tradition.images && tradition.images.length > 0 ? (
              <img
                src={tradition.images[0].url}
                alt={tradition.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex flex-col items-center justify-center">
                <FaImage className="text-6xl text-gray-400 mb-4" />
                <p className="text-gray-500 font-light text-lg">ไม่มีรูปภาพ</p>
                <p className="text-gray-400 font-light text-sm">{tradition.category.name}</p>
              </div>
            )}
          </div>
          <h4 className="text-xl md:text-xl font-normal text-gray-900 leading-tight">
            {tradition.name}
          </h4>
        </div>

        {/* Main Content */}
        <div className="space-y-16">
          {/* General Information */}
          <section>
            <h4 className="text-xl font-normal mb-8 text-gray-900">ข้อมูลทั่วไป</h4>
            <div className="grid md:grid-cols-2 gap-x-16 gap-y-6">
              <div className="space-y-6">
                <div className="flex items-center gap-3">
                  <span className="text-gray-500 font-light min-w-[80px]">ประเภท</span>
                  <span className="text-gray-900 font-light">{tradition.category.name}</span>
                </div>
                <div className="flex items-start gap-3">
                  <FaMapMarkerAlt className="text-green-500 mt-1 flex-shrink-0" />
                  <div>
                    <span className="text-gray-500 font-light">พื้นที่</span>
                    <div className="text-gray-900 font-light">
                      {tradition.village ? `${tradition.village}, ` : ''}{tradition.district}, {tradition.amphoe}, {tradition.province}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-gray-500 font-light min-w-[80px]">ภาค</span>
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
              <h3 className="text-xl font-normal mb-6 text-gray-900">แนวทางการจัดงานแบบปลอดเหล้า</h3>
              <p className="text-gray-700 leading-relaxed font-light text-lg">{tradition.alcoholFreeApproach}</p>
            </div>
            
            {tradition.results && (
              <div>
                <h3 className="text-xl font-normal mb-6 text-gray-900">ผลลัพธ์</h3>
                <p className="text-gray-700 leading-relaxed font-light text-lg">{tradition.results}</p>
              </div>
            )}
            
            <div>
              <h3 className="text-xl font-normal mb-6 text-gray-900">ประวัติของงาน</h3>
              <p className="text-gray-700 leading-relaxed font-light text-lg">{tradition.history}</p>
            </div>
          </section>

          {/* Measures Section */}
          <section>
            <h2 className="text-2xl font-light mb-8 text-gray-900">การดำเนินการและมาตรการ</h2>
            <div className="grid gap-6">
              {[
                {
                  name: "hasPolicy",
                  label: "นโยบายและมาตรการชุมชน",
                  description: "มีการกำหนดนโยบาย มาตรการธรรมนูญชุมชนร่วมกันของคณะกรรมการจังหวัดหรืออำเภอ เพื่อให้การจัดงานบุญ งานประเพณี งานเทศกาล ปลอดเครื่องดื่มแอลกอฮอล์",
                  value: tradition.hasPolicy,
                  icon: "📜"
                },
                {
                  name: "hasAnnouncement",
                  label: "การประกาศและสื่อสาร",
                  description: "มีเอกสาร คำสั่ง ป้ายประกาศ บริเวณทางเข้าหรือรอบ ๆ บริเวณ เพื่อแสดงให้ผู้ร่วมงานรับทราบร่วมกันว่าเป็นการจัดงานปลอดเครื่องดื่มแอลกอฮอล์",
                  value: tradition.hasAnnouncement,
                  icon: "📢"
                },
                {
                  name: "hasInspector",
                  label: "การกำกับดูแล",
                  description: "มีเจ้าหน้าที่กำกับดูแล/คณะกรรมการจังหวัดหรืออำเภอ ตรวจสอบบริเวณการจัดงานอย่างสม่ำเสมอ",
                  value: tradition.hasInspector,
                  icon: "👮"
                },
                {
                  name: "hasMonitoring",
                  label: "การเฝ้าระวัง",
                  description: "มีเจ้าหน้าที่ในการเฝ้าระวังและตรวจสอบการนำเครื่องดื่มแอลกอฮอล์เข้ามาในงานบุญ งานประเพณี งานเทศกาล",
                  value: tradition.hasMonitoring,
                  icon: "🔍"
                },
                {
                  name: "hasCampaign",
                  label: "การรณรงค์และประชาสัมพันธ์",
                  description: "มีการจัดกิจกรรรมรณรงค์ประชาสัมพันธ์จากเจ้าหน้าที่หรือภาคีเครือข่ายในพื้นที่ เพื่อให้งานบุญ งานประเพณี งานเทศกาล ปลอดเครื่องดื่มแอลกอฮอล์",
                  value: tradition.hasCampaign,
                  icon: "📣"
                },
                {
                  name: "hasAlcoholPromote",
                  label: "การโฆษณาเครื่องดื่มแอลกอฮอล์",
                  description: "มีการรับหรือสนับสนุนหรือพบเห็นการโฆษณาเครื่องดื่มแอลกอฮอล์จากธุรกิจสุราในพื้นที่",
                  value: tradition.hasAlcoholPromote,
                  icon: "🚫"
                }
              ].map((item) => (
                <div 
                  key={item.name} 
                  className="bg-gray-50 p-6 rounded-xl transition-colors duration-200 hover:bg-gray-100"
                >
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 text-2xl w-10 h-10 flex items-center justify-center">
                      {item.icon}
                    </div>
                    <div className="flex-grow">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="text-lg font-normal text-gray-900">
                          {item.label}
                        </h3>
                        <span className={`
                          px-3 py-1 text-sm rounded-full font-light whitespace-nowrap
                          ${
                            item.name === "hasAlcoholPromote"
                              ? item.value 
                                ? 'bg-red-50 text-red-600'
                                : 'bg-green-50 text-green-600'
                              : item.value
                                ? 'bg-green-50 text-green-600'
                                : 'bg-red-50 text-red-600'
                          }
                        `}>
                          {item.name === "hasAlcoholPromote"
                            ? item.value ? 'พบ' : 'ไม่พบ'
                            : item.value ? 'ดำเนินการ' : 'ไม่ได้ดำเนินการ'}
                        </span>
                      </div>
                      <p className="text-gray-600 font-light leading-relaxed">
                        {item.description}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Additional Images */}
          {tradition.images && tradition.images.length > 1 && (
            <section>
              <h2 className="text-2xl font-normal mb-8 text-gray-900">รูปภาพประกอบเพิ่มเติม</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {tradition.images.slice(1).map((img) => (
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
          {(tradition.videoLink || tradition.policyFileUrl) && (
            <section>
              <h2 className="text-2xl font-normal mb-8 text-gray-900">ไฟล์และลิงก์ที่เกี่ยวข้อง</h2>
              <div className="flex flex-wrap gap-4">
                {tradition.videoLink && (
                  <a 
                    href={tradition.videoLink} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="inline-flex items-center gap-2 bg-green-50 text-green-700 px-6 py-3 rounded-xl hover:bg-green-100 transition-colors duration-200 font-light"
                  >
                    <FaVideo />
                    ดูวิดีโอประกอบ
                  </a>
                )}
                {tradition.policyFileUrl && (
                  <a 
                    href={tradition.policyFileUrl} 
                    download 
                    className="inline-flex items-center gap-2 bg-green-50 text-green-700 px-6 py-3 rounded-xl hover:bg-green-100 transition-colors duration-200 font-light"
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
        className="max-w-[95%] md:max-w-[80%] lg:max-w-[60%] mx-auto print:hidden"
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