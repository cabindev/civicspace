'use client';

import React, { useState, ChangeEvent, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import toast, { Toaster } from 'react-hot-toast';
import imageCompression from 'browser-image-compression';
import { User, Mail, Lock, Upload, UserPlus, Eye, EyeOff } from 'lucide-react';
import Loading from '../../components/Loading';

interface FormData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  image: File | null;
}

export default function SignupPage() {
  const [formData, setFormData] = useState<FormData>({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    image: null,
  });
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const router = useRouter();

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { name, value, files } = event.target;
    if (name === 'image' && files) {
      const file = files[0];
      const allowedExtensions = ['.jpg', '.jpeg', '.webp', '.svg', '.png'];
      const fileExtension = file.name.split('.').pop()?.toLowerCase();
      
      if (file && allowedExtensions.includes(`.${fileExtension}`)) {
        const options = {
          maxSizeMB: 0.2,
          maxWidthOrHeight: 1024,
          useWebWorker: true,
        };
        imageCompression(file, options)
          .then(compressedFile => {
            const reader = new FileReader();
            reader.onloadend = () => {
              setImagePreview(reader.result as string);
            };
            reader.readAsDataURL(compressedFile);
            setFormData({ ...formData, image: compressedFile });
          })
          .catch(error => {
            console.error('Error compressing image', error);
            toast.error('เกิดข้อผิดพลาดในการบีบอัดรูปภาพ');
          });
      } else {
        toast.error('ประเภทไฟล์ไม่ถูกต้อง');
      }
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setIsLoading(true);
    const formDataToSend = new FormData();
    Object.entries(formData).forEach(([key, value]) => {
      if (value !== null) formDataToSend.append(key, value);
    });

    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        body: formDataToSend,
      });
      const data = await response.json();

      if (response.status === 200) {
        toast.success('ลงทะเบียนสำเร็จ กำลังนำคุณไปยังหน้าเข้าสู่ระบบ...', {
          duration: 4000,
        });
        setTimeout(() => router.push('/auth/signin'), 2000);
      } else {
        toast.error(data.error || 'เกิดข้อผิดพลาด โปรดลองอีกครั้ง');
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('เกิดข้อผิดพลาดในการเชื่อมต่อ โปรดลองอีกครั้ง');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <div className="w-16 h-16 flex items-center justify-center bg-white rounded-full shadow-sm">
            <Image
              src="/Civic-Spacelogo.png"
              alt="CivicSpace Logo"
              width={40}
              height={40}
              className="w-auto h-auto max-w-10 max-h-10"
            />
          </div>
        </div>
        <h1 className="mt-6 text-center text-2xl font-bold text-gray-900">
          CivicSpace
        </h1>
        <p className="mt-2 text-center text-sm text-gray-600">
          พื้นที่พลเมืองร่วมหาทางออกปัญหาแอลกอฮอล์
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow-sm sm:rounded-lg sm:px-10 border border-gray-200">
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-gray-900 text-center">
              สร้างบัญชีใหม่
            </h2>
            <p className="mt-2 text-sm text-gray-600 text-center">
              สมัครสมาชิกเพื่อเข้าใช้งานระบบ
            </p>
          </div>

          <form className="space-y-6" onSubmit={handleSubmit}>
            <Toaster />
            
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="firstName" className="block text-sm font-medium text-gray-900 mb-2">
                  ชื่อจริง
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-4 w-4 text-gray-500" />
                  </div>
                  <input
                    type="text"
                    name="firstName"
                    id="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    required
                    className="block w-full pl-10 pr-3 py-2 border border-gray-200 rounded-md text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-gray-400"
                    placeholder="ชื่อจริง"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="lastName" className="block text-sm font-medium text-gray-900 mb-2">
                  นามสกุล
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-4 w-4 text-gray-500" />
                  </div>
                  <input
                    type="text"
                    name="lastName"
                    id="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    required
                    className="block w-full pl-10 pr-3 py-2 border border-gray-200 rounded-md text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-gray-400"
                    placeholder="นามสกุล"
                  />
                </div>
              </div>
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-900 mb-2">
                อีเมล
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-4 w-4 text-gray-500" />
                </div>
                <input
                  type="email"
                  name="email"
                  id="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="block w-full pl-10 pr-3 py-2 border border-gray-200 rounded-md text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-gray-400"
                  placeholder="กรอกอีเมลของคุณ"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-900 mb-2">
                รหัสผ่าน
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-4 w-4 text-gray-500" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  id="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  className="block w-full pl-10 pr-10 py-2 border border-gray-200 rounded-md text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-gray-400"
                  placeholder="กรอกรหัสผ่านของคุณ"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4 text-gray-500" />
                  ) : (
                    <Eye className="h-4 w-4 text-gray-500" />
                  )}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                รูปถ่าย (ไม่บังคับ)
              </label>
              <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-200 border-dashed rounded-md hover:border-gray-300 transition-colors">
                <div className="space-y-2 text-center">
                  {imagePreview ? (
                    <div className="flex flex-col items-center">
                      <img src={imagePreview} alt="Preview" className="w-16 h-16 object-cover rounded-full mb-2" />
                      <label htmlFor="image" className="cursor-pointer text-sm font-medium text-gray-600 hover:text-gray-500">
                        เปลี่ยนรูปภาพ
                      </label>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center">
                      <Upload className="mx-auto h-8 w-8 text-gray-400" />
                      <label htmlFor="image" className="cursor-pointer text-sm font-medium text-gray-600 hover:text-gray-500">
                        <span>อัพโหลดรูปภาพ</span>
                      </label>
                    </div>
                  )}
                  <input
                    type="file"
                    name="image"
                    id="image"
                    accept=".jpg,.jpeg,.webp,.svg,.png"
                    onChange={handleChange}
                    className="sr-only"
                  />
                  <p className="text-xs text-gray-500">PNG, JPG, WEBP, SVG สูงสุด 200KB</p>
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex justify-center items-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gray-900 hover:bg-black focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <Loading size="sm" color="white" className="mr-2" />
              ) : (
                <UserPlus className="w-4 h-4 mr-2" />
              )}
              {isLoading ? 'กำลังสร้างบัญชี...' : 'สร้างบัญชี'}
            </button>
          </form>

          <div className="mt-6">
            <div className="text-center">
              <p className="text-sm text-gray-600">
                มีบัญชีอยู่แล้ว?{' '}
                <Link
                  href="/auth/signin"
                  className="font-medium text-gray-600 hover:text-gray-500 underline"
                >
                  เข้าสู่ระบบ
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-8 text-center">
        <p className="text-xs text-gray-500">
          © 2025 CivicSpace. พื้นที่พลเมืองร่วมหาทางออกปัญหาแอลกอฮอล์
        </p>
      </div>
    </div>
  );
}