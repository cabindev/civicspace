//app/dashboard/profile/edit/[id]/page.tsx
'use client'

import React, { useState, useEffect, useCallback, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { FaUser, FaCamera, FaArrowLeft, FaCheck } from 'react-icons/fa';
import { Spin, message } from 'antd';
import { UserData } from '@/app/types/types';
import imageCompression from 'browser-image-compression';

// Server Actions
import { getProfile } from '@/app/lib/actions/profile/get';
import { updateProfile } from '@/app/lib/actions/profile/put';

export default function EditProfilePage({ params }: { params: { id: string } }) {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [image, setImage] = useState<File | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [compressing, setCompressing] = useState(false);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const fetchUserData = useCallback(async () => {
    startTransition(async () => {
      try {
        setLoading(true);
        const result = await getProfile();
        if (result.success) {
          setUserData(result.data);
          setFirstName(result.data.firstName || '');
          setLastName(result.data.lastName || '');
          setPreviewImage(result.data.image || null);
        } else {
          message.error('ไม่สามารถโหลดข้อมูลผู้ใช้ได้');
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
        message.error('เกิดข้อผิดพลาดในการโหลดข้อมูล');
      } finally {
        setLoading(false);
      }
    });
  }, []);

  useEffect(() => {
    fetchUserData();
  }, [fetchUserData]);

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      
      // ตรวจสอบประเภทไฟล์
      if (!file.type.startsWith('image/')) {
        message.error('กรุณาเลือกไฟล์รูปภาพเท่านั้น');
        return;
      }

      // ตรวจสอบขนาดไฟล์เบื้องต้น (10MB)
      if (file.size > 10 * 1024 * 1024) {
        message.error('ไฟล์รูปภาพต้องมีขนาดไม่เกิน 10MB');
        return;
      }

      try {
        setCompressing(true);
        message.loading({ content: 'กำลังบีบอัดรูปภาพ...', key: 'compress' });

        // ตั้งค่าการบีบอัด
        const options = {
          maxSizeMB: 0.2, // 200 KB
          maxWidthOrHeight: 800, // ขนาดสูงสุด 800px
          useWebWorker: true, // ใช้ web worker เพื่อไม่ให้หน่วง UI
          quality: 0.8, // คุณภาพรูปภาพ 80%
          fileType: 'image/jpeg' as const, // แปลงเป็น JPEG เสมอ
        };

        // บีบอัดรูปภาพ
        const compressedFile = await imageCompression(file, options);
        
        console.log('Original file size:', (file.size / 1024).toFixed(2), 'KB');
        console.log('Compressed file size:', (compressedFile.size / 1024).toFixed(2), 'KB');

        // ตรวจสอบผลลัพธ์การบีบอัด
        if (compressedFile.size > 200 * 1024) {
          message.warning('ไฟล์ยังใหญ่เกินไป กำลังบีบอัดเพิ่มเติม...');
          
          // ลองบีบอัดเพิ่มเติมด้วยคุณภาพที่ต่ำลง
          const secondOptions = {
            ...options,
            maxSizeMB: 0.15, // ลดลงเหลือ 150KB
            quality: 0.6, // คุณภาพ 60%
            maxWidthOrHeight: 600, // ขนาดเล็กลง
          };
          
          const finalCompressedFile = await imageCompression(compressedFile, secondOptions);
          setImage(finalCompressedFile);
          setPreviewImage(URL.createObjectURL(finalCompressedFile));
          
          console.log('Final compressed file size:', (finalCompressedFile.size / 1024).toFixed(2), 'KB');
        } else {
          setImage(compressedFile);
          setPreviewImage(URL.createObjectURL(compressedFile));
        }

        message.success({ 
          content: `บีบอัดรูปภาพสำเร็จ (${(compressedFile.size / 1024).toFixed(0)} KB)`, 
          key: 'compress' 
        });

      } catch (error) {
        console.error('Error compressing image:', error);
        message.error({ content: 'เกิดข้อผิดพลาดในการบีบอัดรูปภาพ', key: 'compress' });
      } finally {
        setCompressing(false);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userData) return;

    if (!firstName.trim() || !lastName.trim()) {
      message.error('กรุณากรอกชื่อและนามสกุล');
      return;
    }

    setSaving(true);

    const formData = new FormData();
    formData.append('firstName', firstName.trim());
    formData.append('lastName', lastName.trim());
    if (image) {
      formData.append('image', image);
    }

    try {
      const result = await updateProfile(parseInt(params.id), formData);
      
      if (result.success) {
        message.success('บันทึกข้อมูลเรียบร้อยแล้ว');
        router.push('/dashboard/profile');
      } else {
        message.error(result.error || 'ไม่สามารถบันทึกข้อมูลได้');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      message.error('เกิดข้อผิดพลาดในการบันทึกข้อมูล');
    } finally {
      setSaving(false);
    }
  };

  const getImageSrc = () => {
    if (previewImage) {
      // ถ้าเป็น blob URL หรือ path ที่ถูกต้อง
      if (previewImage.startsWith('blob:') || previewImage.startsWith('/uploads/profiles/')) {
        return previewImage;
      }
      // ถ้าเป็น path เก่าให้แปลงเป็น path ใหม่
      if (previewImage.startsWith('/uploads/')) {
        return previewImage;
      }
      // ถ้าเป็น filename เฉยๆ ให้ใส่ path
      return `/uploads/profiles/${previewImage}`;
    }
    return '/default-avatar.png';
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-white">
        <Spin size="large" />
      </div>
    );
  }

  if (!userData) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-normal text-gray-900 mb-2">ไม่พบข้อมูลผู้ใช้</h2>
          <p className="text-gray-500 font-light">กรุณาลองใหม่อีกครั้ง</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-2xl mx-auto px-6 lg:px-8 pt-24 pb-16">
        
        {/* Header */}
        <div className="flex items-center gap-4 mb-12">
          <button
            onClick={() => router.back()}
            className="flex items-center justify-center w-10 h-10 rounded-xl hover:bg-gray-100 transition-colors duration-200"
          >
            <FaArrowLeft className="text-gray-600" />
          </button>
          <div>
            <h1 className="text-3xl font-normal text-gray-900">แก้ไขโปรไฟล์</h1>
            <p className="text-gray-500 font-light mt-1">อัปเดตข้อมูลส่วนตัวของคุณ</p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-8">
          
          {/* Profile Picture Section */}
          <div className="bg-gray-50 rounded-2xl p-8">
            <h3 className="text-lg font-normal text-gray-900 mb-6">รูปโปรไฟล์</h3>
            <div className="flex items-center gap-6">
              <div className="relative">
                <img
                  src={getImageSrc()}
                  alt="Profile"
                  className="w-24 h-24 rounded-full object-cover bg-gray-200"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = "/default-avatar.png";
                  }}
                />
                {compressing && (
                  <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center">
                    <Spin size="small" />
                  </div>
                )}
                <div className="absolute inset-0 bg-black bg-opacity-40 rounded-full flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity duration-200">
                  <FaCamera className="text-white text-lg" />
                </div>
              </div>
              
              <div className="flex-1">
                <input
                  type="file"
                  id="image"
                  accept="image/*"
                  onChange={handleImageChange}
                  disabled={compressing}
                  className="hidden"
                />
                <label
                  htmlFor="image"
                  className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl transition-colors duration-200 cursor-pointer font-light ${
                    compressing 
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                      : 'bg-white text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <FaCamera className="text-sm" />
                  {compressing ? 'กำลังบีบอัด...' : 'เลือกรูปภาพ'}
                </label>
                <p className="text-sm text-gray-500 font-light mt-2">
                  รองรับไฟล์ JPG, PNG • จะบีบอัดให้เหลือไม่เกิน 200KB โดยอัตโนมัติ
                </p>
                {image && (
                  <p className="text-xs text-green-600 font-light mt-1">
                    ✓ รูปภาพถูกบีบอัดแล้ว ({(image.size / 1024).toFixed(0)} KB)
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Personal Information */}
          <div className="space-y-6">
            <h3 className="text-lg font-normal text-gray-900">ข้อมูลส่วนตัว</h3>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-2">
                  ชื่อ
                </label>
                <div className="relative">
                  <FaUser className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    id="firstName"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:border-green-500 focus:outline-none transition-colors duration-200 font-light"
                    placeholder="กรอกชื่อ"
                    required
                  />
                </div>
              </div>

              <div>
                <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-2">
                  นามสกุล
                </label>
                <div className="relative">
                  <FaUser className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    id="lastName"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:border-green-500 focus:outline-none transition-colors duration-200 font-light"
                    placeholder="กรอกนามสกุล"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Email (Read-only) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                อีเมล
              </label>
              <div className="relative">
                <input
                  type="email"
                  value={userData.email}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-gray-500 font-light cursor-not-allowed"
                  disabled
                />
                <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-xs text-gray-400 bg-gray-50 px-2">
                  ไม่สามารถแก้ไขได้
                </span>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex items-center justify-end gap-4 pt-6 border-t border-gray-100">
            <button
              type="button"
              onClick={() => router.back()}
              disabled={saving || compressing}
              className="px-6 py-3 text-gray-600 font-light hover:text-gray-800 transition-colors duration-200 disabled:opacity-50"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              disabled={saving || compressing}
              className="inline-flex items-center gap-2 bg-green-600 text-white px-8 py-3 rounded-xl hover:bg-green-700 transition-colors duration-200 font-light disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? (
                <>
                  <Spin size="small" />
                  กำลังบันทึก...
                </>
              ) : compressing ? (
                <>
                  <Spin size="small" />
                  รอการบีบอัด...
                </>
              ) : (
                <>
                  <FaCheck className="text-sm" />
                  บันทึกการเปลี่ยนแปลง
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}