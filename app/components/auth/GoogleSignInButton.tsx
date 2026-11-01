'use client';
// ปุ่มเดียวใช้ทั้งหน้าเข้าสู่ระบบและสมัครสมาชิก
// อีเมลเคยมีบัญชีแล้ว = เข้าบัญชีเดิม · ยังไม่เคยมี = สร้างบัญชีรออนุมัติ (ดู callbacks.signIn ใน authOptions)
import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { Loader } from 'lucide-react';

export default function GoogleSignInButton({ callbackUrl = '/' }: { callbackUrl?: string }) {
  const [isLoading, setIsLoading] = useState(false);

  return (
    <button
      type="button"
      disabled={isLoading}
      onClick={() => {
        setIsLoading(true);
        signIn('google', { callbackUrl });
      }}
      className="w-full flex justify-center items-center gap-3 py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-900 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {isLoading ? <Loader className="w-4 h-4 text-gray-600 animate-spin" /> : <GoogleLogo />}
      {isLoading ? 'กำลังไปที่ Google...' : 'ดำเนินการต่อด้วย Google'}
    </button>
  );
}

export function OrDivider({ label = 'หรือใช้อีเมล' }: { label?: string }) {
  return (
    <div className="relative my-6">
      <div className="absolute inset-0 flex items-center" aria-hidden="true">
        <div className="w-full border-t border-gray-200" />
      </div>
      <div className="relative flex justify-center">
        <span className="bg-white px-3 text-xs text-gray-500">{label}</span>
      </div>
    </div>
  );
}

function GoogleLogo() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
      <path fill="#4285F4" d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84a4.14 4.14 0 0 1-1.8 2.72v2.26h2.9c1.7-1.57 2.7-3.88 2.7-6.62Z" />
      <path fill="#34A853" d="M9 18c2.43 0 4.47-.81 5.96-2.18l-2.9-2.26c-.81.54-1.84.86-3.06.86-2.35 0-4.34-1.59-5.05-3.72H.98v2.33A9 9 0 0 0 9 18Z" />
      <path fill="#FBBC05" d="M3.95 10.7A5.4 5.4 0 0 1 3.66 9c0-.59.1-1.17.29-1.7V4.97H.98A9 9 0 0 0 0 9c0 1.45.35 2.83.98 4.03l2.97-2.33Z" />
      <path fill="#EA4335" d="M9 3.58c1.32 0 2.51.45 3.44 1.35l2.58-2.58C13.46.89 11.43 0 9 0A9 9 0 0 0 .98 4.97l2.97 2.33C4.66 5.17 6.65 3.58 9 3.58Z" />
    </svg>
  );
}
