'use client'

import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import axios from 'axios';
import { FaCalendar, FaEye, FaVideo, FaFilePdf, FaMapMarkerAlt, FaListUl } from 'react-icons/fa';
import { Spin } from 'antd';
import Navbar from '../../Navbar';

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
  content: string[];
  summary: string;
  results?: string;
  images: { id: string; url: string }[];
  videoLink?: string;
  policyFileUrl?: string;
  viewCount: number;
}

export default function PublicPolicyDetails() {
  const { id } = useParams();
  const [policy, setPolicy] = useState<PublicPolicy | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchPolicyDetails = useCallback(async () => {
    if (!id) return;

    try {
      setLoading(true);
      const response = await axios.get(`/api/public-policy/${id}`);
      setPolicy(response.data);
      
      // Increment view count
      await axios.put(`/api/public-policy/${id}`, { action: 'incrementViewCount' });
    } catch (error) {
      console.error('Failed to fetch public policy details:', error);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchPolicyDetails();
  }, [fetchPolicyDetails]);

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

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar/>
      <div className="container mx-auto p-4 max-w-4xl pt-20">
        {/* ลิงก์ไปยังหน้านโยบายสาธารณะทั้งหมด */}
        <div className="flex justify-center items-center my-4">
          <Link href="/components/public-policy" className="inline-block">
            <div className="badge badge-success text-white gap-2 badge-lg p-4 text-lg hover:bg-green-600 transition-colors duration-300">
              <FaListUl className="inline-block h-6 w-6" />
              ดูนโยบายสาธารณะทั้งหมด
            </div>
          </Link>
        </div>

        {/* Hero Section */}
        <div className="relative h-64 md:h-96 mb-8 rounded-lg overflow-hidden shadow-xl">
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
          <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent flex items-end">
            <h1 className="text-3xl md:text-4xl font-bold text-white p-6">{policy.name}</h1>
          </div>
        </div>

        {/* Main Content */}
        <div className="bg-white shadow-lg rounded-lg overflow-hidden">
          <div className="p-6">
            <h2 className="text-2xl font-semibold mb-4 text-green-600 border-b pb-2">ข้อมูลทั่วไป</h2>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <p className="mb-2 flex items-center">
                  <FaCalendar className="mr-2 text-green-500" />
                  <span className="font-semibold">วันที่ลงนาม:</span> {new Date(policy.signingDate).toLocaleDateString('th-TH')}
                </p>
                <p className="mb-2"><span className="font-semibold">ระดับ:</span> {policy.level}</p>
                <p className="mb-2 flex items-center">
                  <FaMapMarkerAlt className="mr-2 text-green-500" />
                  <span className="font-semibold">พื้นที่:</span> {policy.village ? `${policy.village}, ` : ''}{policy.district}, {policy.amphoe}, {policy.province}
                </p>
              </div>
              <div>
                <p className="mb-2"><span className="font-semibold">ประเภท:</span> {policy.type}</p>
                <p className="mb-2"><span className="font-semibold">เนื้อหา:</span> {policy.content.join(', ')}</p>
              </div>
            </div>

            <h2 className="text-2xl font-semibold my-4 text-green-600 border-b pb-2">รายละเอียด</h2>
            <div className="mb-4">
              <h3 className="font-semibold mb-2">สรุป:</h3>
              <p className="text-gray-700">{policy.summary}</p>
            </div>
            {policy.results && (
              <div className="mb-4">
                <h3 className="font-semibold mb-2">ผลลัพธ์:</h3>
                <p className="text-gray-700">{policy.results}</p>
              </div>
            )}
          </div>
          
          {policy.images && policy.images.length > 1 && (
            <div className="p-6 bg-gray-50">
              <h2 className="text-2xl font-semibold mb-4 text-green-600 border-b pb-2">รูปภาพประกอบเพิ่มเติม</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {policy.images.slice(1).map((img) => (
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
          
          {(policy.videoLink || policy.policyFileUrl) && (
            <div className="p-6">
              <h2 className="text-2xl font-semibold mb-4 text-green-600 border-b pb-2">ไฟล์และลิงก์ที่เกี่ยวข้อง</h2>
              <div className="flex flex-col md:flex-row md:space-x-4">
                {policy.videoLink && (
                  <a href={policy.videoLink} target="_blank" rel="noopener noreferrer" className="flex items-center bg-green-100 text-green-700 px-4 py-2 rounded-full hover:bg-green-200 transition duration-300 mb-2 md:mb-0">
                    <FaVideo className="mr-2" />
                    ดูวิดีโอประกอบ
                  </a>
                )}
                {policy.policyFileUrl && (
                  <a href={policy.policyFileUrl} download className="flex items-center bg-green-100 text-green-700 px-4 py-2 rounded-full hover:bg-green-200 transition duration-300">
                    <FaFilePdf className="mr-2" />
                    ดาวน์โหลดไฟล์นโยบาย
                  </a>
                )}
              </div>
            </div>
          )}
        </div>
        <div className="mt-6 flex justify-end items-center text-gray-600">
          <FaEye className="mr-2" />
          <p>เข้าชมทั้งหมด {policy.viewCount} ครั้ง</p>
        </div>
      </div>
    </div>
  );
}