'use client';
// ปุ่มของหน้า /auth/pending
// RefreshSessionButton: อนุมัติแล้วแต่ cookie ยังเป็น PENDING → update() ให้ jwt callback อ่าน role ใหม่จาก DB
import { useState } from 'react';
import { signOut, useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { LogOut } from 'lucide-react';

export function RefreshSessionButton({ to }: { to: string }) {
  const { update } = useSession();
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  return (
    <button
      type="button"
      disabled={busy}
      onClick={async () => {
        setBusy(true);
        await update();
        router.push(to);
        router.refresh();
      }}
      className="px-4 py-2 rounded-md bg-gray-900 text-white text-sm font-medium hover:bg-black disabled:opacity-60"
    >
      {busy ? 'กำลังเข้าสู่ระบบ…' : 'เข้าใช้งาน'}
    </button>
  );
}

export function SignOutButton() {
  return (
    <button
      type="button"
      onClick={() => signOut({ callbackUrl: '/' })}
      className="inline-flex items-center px-4 py-2 rounded-md border border-gray-300 text-gray-700 text-sm font-medium hover:bg-gray-50"
    >
      <LogOut className="w-4 h-4 mr-2" />
      ออกจากระบบ
    </button>
  );
}
