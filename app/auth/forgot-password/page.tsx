'use client';

import { useState, FormEvent } from 'react';
import axios from 'axios';
import Link from 'next/link';
import Image from 'next/image';
import { Mail, ArrowLeft, Send, CheckCircle, XCircle } from 'lucide-react';
import Loading from '../../components/Loading';

export default function ForgotPassword() {
  const [email, setEmail] = useState<string>('');
  const [message, setMessage] = useState<string>('');
  const [isSuccess, setIsSuccess] = useState<boolean | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    setIsSuccess(null);

    try {
      const res = await axios.post('/api/auth/forgot-password', { email });
      setMessage(res.data.message);
      setIsSuccess(true);
    } catch (error: any) {
      console.error('Error occurred:', error);
      setMessage(error.response?.data?.error || 'เกิดข้อผิดพลาดในการส่งอีเมล โปรดลองอีกครั้งในภายหลัง');
      setIsSuccess(false);
    } finally {
      setLoading(false);
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
              ลืมรหัสผ่าน
            </h2>
            <p className="mt-2 text-sm text-gray-600 text-center">
              กรอกอีเมลของคุณเพื่อรับลิงก์รีเซ็ตรหัสผ่าน
            </p>
          </div>

          {isSuccess === true ? (
            <div className="text-center space-y-4">
              <div className="flex justify-center">
                <CheckCircle className="h-16 w-16 text-green-500" />
              </div>
              <div className="bg-green-50 border border-green-200 rounded-md p-4">
                <div className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-400 mr-2" />
                  <p className="text-sm text-green-700">{message}</p>
                </div>
              </div>
              <p className="text-sm text-gray-600">
                โปรดตรวจสอบอีเมลของคุณ และคลิกลิงก์เพื่อรีเซ็ตรหัสผ่าน
              </p>
            </div>
          ) : (
            <form className="space-y-6" onSubmit={handleSubmit}>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-900 mb-2">
                  อีเมล
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-4 w-4 text-gray-500" />
                  </div>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-gray-500"
                    placeholder="กรอกอีเมลของคุณ"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>

              {isSuccess === false && message && (
                <div className="bg-red-50 border border-red-200 rounded-md p-3">
                  <div className="flex items-center">
                    <XCircle className="h-5 w-5 text-red-400 mr-2" />
                    <p className="text-sm text-red-600">{message}</p>
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center items-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gray-900 hover:bg-black focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <Loading size="sm" color="white" className="mr-2" />
                ) : (
                  <Send className="w-4 h-4 mr-2" />
                )}
                {loading ? 'กำลังส่ง...' : 'ส่งลิงก์รีเซ็ตรหัสผ่าน'}
              </button>
            </form>
          )}

          <div className="mt-6">
            <div className="text-center">
              <Link
                href="/auth/signin"
                className="flex items-center justify-center text-sm font-medium text-gray-600 hover:text-gray-900"
              >
                <ArrowLeft className="w-4 h-4 mr-1" />
                กลับไปหน้าเข้าสู่ระบบ
              </Link>
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