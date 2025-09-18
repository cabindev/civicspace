'use client';

import { useState, FormEvent, useEffect } from 'react';
import { signIn, useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { LogIn, Mail, Lock, Eye, EyeOff } from 'lucide-react';
import Loading from '../../components/Loading';

export default function SignIn() {
  const { data: session } = useSession();
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (session) {
      router.push('/dashboard');
    }
  }, [session, router]);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const result = await signIn('credentials', {
        redirect: false,
        email,
        password,
      });

      if (result?.error) {
        setError('อีเมลหรือรหัสผ่านไม่ถูกต้อง');
      } else {
        router.replace('/dashboard');
      }
    } catch (error) {
      setError('เกิดข้อผิดพลาด โปรดลองอีกครั้ง');
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
              เข้าสู่ระบบ
            </h2>
            <p className="mt-2 text-sm text-gray-600 text-center">
              เข้าสู่ระบบเพื่อเข้าถึงแดชบอร์ด
            </p>
          </div>

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

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-900 mb-2">
                รหัสผ่าน
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-4 w-4 text-gray-500" />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  className="block w-full pl-10 pr-10 py-2 border border-gray-300 rounded-md text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-gray-500"
                  placeholder="กรอกรหัสผ่านของคุณ"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
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

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 text-gray-600 focus:ring-gray-500 border-gray-300 rounded"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700">
                  จดจำฉัน
                </label>
              </div>

              <Link
                href="/auth/forgot-password"
                className="text-sm font-medium text-gray-600 hover:text-gray-900"
              >
                ลืมรหัสผ่าน?
              </Link>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-md p-3">
                <p className="text-sm text-red-600">{error}</p>
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
                <LogIn className="w-4 h-4 mr-2" />
              )}
              {loading ? 'กำลังเข้าสู่ระบบ...' : 'เข้าสู่ระบบ'}
            </button>
          </form>

          <div className="mt-6">
            <div className="text-center">
              <p className="text-sm text-gray-600">
                ยังไม่เป็นสมาชิก?{' '}
                <Link
                  href="/auth/form_signup"
                  className="font-medium text-gray-900 hover:text-black underline"
                >
                  สมัครสมาชิกเลย
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
