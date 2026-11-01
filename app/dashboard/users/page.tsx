'use client';
// app/dashboard/users/page.tsx — จัดการผู้ใช้: อนุมัติ / ปฏิเสธบัญชีใหม่ และเปลี่ยน role (SUPER_ADMIN เท่านั้น)
// สิทธิ์จริงเช็คที่ API (/api/admin/users) จาก DB ทุกครั้ง — หน้านี้แค่ซ่อน/แสดงปุ่มให้ตรงสิทธิ์
import { useCallback, useEffect, useMemo, useState } from 'react';
import toast, { Toaster } from 'react-hot-toast';
import { Users, Clock, UserCheck, ShieldCheck, Check, X, RefreshCw } from 'lucide-react';
import { ROLE_LABELS, type RoleName } from '@/app/lib/roles';

interface AdminUser {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  image: string | null;
  role: RoleName;
  emailVerified: string | null;
  hasPassword: boolean;
  createdAt: string;
}

interface UsersResponse {
  users: AdminUser[];
  stats: { total: number; pending: number; members: number; admins: number };
  me: { id: number; role: RoleName };
}

const ROLE_BADGE: Record<RoleName, string> = {
  SUPER_ADMIN: 'bg-gray-900 text-white',
  ADMIN: 'bg-gray-200 text-gray-900',
  MEMBER: 'bg-green-50 text-green-700 border border-green-200',
  PENDING: 'bg-yellow-50 text-yellow-800 border border-yellow-200',
};

async function fetchUsers(): Promise<UsersResponse> {
  const res = await fetch('/api/admin/users', { cache: 'no-store' });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(json.error || 'โหลดรายชื่อไม่สำเร็จ');
  return json;
}

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: '2-digit' });

export default function UsersPage() {
  const [data, setData] = useState<UsersResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [tab, setTab] = useState<'pending' | 'all' | null>(null);
  const [busyId, setBusyId] = useState<number | null>(null);
  const [confirmRejectId, setConfirmRejectId] = useState<number | null>(null);

  const applyResult = useCallback((json: UsersResponse) => {
    setError(null);
    setData(json);
    // เปิดแท็บ "รออนุมัติ" ให้เองถ้ามีคนรอ (เฉพาะตอนโหลดครั้งแรก)
    setTab((t) => t ?? (json.stats.pending > 0 ? 'pending' : 'all'));
  }, []);
  const applyError = useCallback((e: unknown) => {
    setError(e instanceof Error ? e.message : 'โหลดรายชื่อไม่สำเร็จ');
  }, []);

  const load = useCallback(() => fetchUsers().then(applyResult, applyError), [applyResult, applyError]);

  useEffect(() => {
    let cancelled = false;
    fetchUsers().then(
      (json) => !cancelled && applyResult(json),
      (e) => !cancelled && applyError(e),
    );
    return () => {
      cancelled = true;
    };
  }, [applyResult, applyError]);

  const rows = useMemo(() => {
    if (!data) return [];
    return tab === 'pending' ? data.users.filter((u) => u.role === 'PENDING') : data.users;
  }, [data, tab]);

  const isSuperAdmin = data?.me.role === 'SUPER_ADMIN';

  async function mutate(id: number, init: RequestInit) {
    setBusyId(id);
    try {
      const res = await fetch(`/api/admin/users/${id}`, init);
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json.error || 'ทำรายการไม่สำเร็จ');
      toast.success(json.message || 'บันทึกแล้ว');
      await load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'ทำรายการไม่สำเร็จ');
    } finally {
      setBusyId(null);
      setConfirmRejectId(null);
    }
  }

  const setRole = (id: number, role: RoleName) =>
    mutate(id, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ role }) });
  const reject = (id: number) => mutate(id, { method: 'DELETE' });

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-sm text-red-700">{error}</div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="p-6 flex justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-600" />
      </div>
    );
  }

  const stats = [
    { label: 'รออนุมัติ', value: data.stats.pending, icon: Clock, tone: 'bg-yellow-50 text-yellow-600' },
    { label: 'เจ้าหน้าที่', value: data.stats.members, icon: UserCheck, tone: 'bg-green-50 text-green-600' },
    { label: 'ผู้ดูแลระบบ', value: data.stats.admins, icon: ShieldCheck, tone: 'bg-gray-100 text-gray-700' },
    { label: 'ทั้งหมด', value: data.stats.total, icon: Users, tone: 'bg-gray-100 text-gray-700' },
  ];

  return (
    <div className="p-6">
      <Toaster />
      <div className="flex items-start justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-1">ผู้ใช้</h1>
          <p className="text-sm text-gray-600">
            อนุมัติหรือปฏิเสธบัญชีที่สมัครใหม่
            {isSuperAdmin ? ' และกำหนดสิทธิ์ผู้ใช้' : ' · การเปลี่ยนสิทธิ์ทำได้เฉพาะผู้ดูแลสูงสุด'}
          </p>
        </div>
        <button
          type="button"
          onClick={load}
          className="inline-flex items-center px-3 py-2 text-sm text-gray-700 border border-gray-200 rounded-md bg-white hover:bg-gray-50"
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          รีเฟรช
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {stats.map((s) => (
          <div key={s.label} className="bg-white rounded-lg border border-gray-200 p-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-600">{s.label}</p>
              <p className="text-2xl font-bold text-gray-900">{s.value}</p>
            </div>
            <div className={`p-3 rounded-lg ${s.tone}`}>
              <s.icon className="w-5 h-5" />
            </div>
          </div>
        ))}
      </div>

      <div className="flex gap-1 mb-4 border-b border-gray-200">
        {(
          [
            ['pending', `รออนุมัติ (${data.stats.pending})`],
            ['all', `ทั้งหมด (${data.stats.total})`],
          ] as const
        ).map(([key, label]) => (
          <button
            key={key}
            type="button"
            onClick={() => setTab(key)}
            className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px ${
              tab === key ? 'border-amber-500 text-gray-900' : 'border-transparent text-gray-500 hover:text-gray-900'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {rows.length === 0 ? (
        <div className="bg-white rounded-lg border border-gray-200 p-12 text-center text-sm text-gray-500">
          {tab === 'pending' ? 'ไม่มีบัญชีรออนุมัติ' : 'ยังไม่มีผู้ใช้'}
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-gray-200 overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50 text-xs text-gray-600">
              <tr>
                <th className="px-4 py-3 text-left font-medium">ชื่อ</th>
                <th className="px-4 py-3 text-left font-medium">เข้าระบบด้วย</th>
                <th className="px-4 py-3 text-left font-medium">สมัครเมื่อ</th>
                <th className="px-4 py-3 text-left font-medium">สิทธิ์</th>
                <th className="px-4 py-3 text-right font-medium">จัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {rows.map((u) => {
                const isMe = u.id === data.me.id;
                const busy = busyId === u.id;
                return (
                  <tr key={u.id} className={busy ? 'opacity-50' : undefined}>
                    <td className="px-4 py-3">
                      <div className="font-medium text-gray-900">
                        {`${u.firstName} ${u.lastName}`.trim() || '—'}
                        {isMe && <span className="ml-2 text-xs text-gray-500">(คุณ)</span>}
                      </div>
                      <div className="text-xs text-gray-500">{u.email}</div>
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-600">
                      {u.hasPassword ? 'อีเมล/รหัสผ่าน' : 'Google'}
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-600 whitespace-nowrap">{formatDate(u.createdAt)}</td>
                    <td className="px-4 py-3">
                      {isSuperAdmin && !isMe && u.role !== 'PENDING' ? (
                        <select
                          aria-label={`สิทธิ์ของ ${u.email}`}
                          value={u.role}
                          disabled={busy}
                          onChange={(e) => setRole(u.id, e.target.value as RoleName)}
                          className="text-xs border border-gray-200 rounded-md px-2 py-1 bg-white"
                        >
                          {(['MEMBER', 'ADMIN', 'SUPER_ADMIN'] as const).map((r) => (
                            <option key={r} value={r}>
                              {ROLE_LABELS[r]}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <span className={`inline-block px-2 py-0.5 rounded-full text-xs ${ROLE_BADGE[u.role]}`}>
                          {ROLE_LABELS[u.role]}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right whitespace-nowrap">
                      {u.role === 'PENDING' &&
                        (confirmRejectId === u.id ? (
                          <span className="inline-flex items-center gap-2">
                            <span className="text-xs text-gray-600">ลบบัญชีนี้?</span>
                            <button
                              type="button"
                              disabled={busy}
                              onClick={() => reject(u.id)}
                              className="px-2.5 py-1 text-xs rounded-md bg-red-600 text-white hover:bg-red-700"
                            >
                              ยืนยันปฏิเสธ
                            </button>
                            <button
                              type="button"
                              onClick={() => setConfirmRejectId(null)}
                              className="px-2.5 py-1 text-xs rounded-md border border-gray-200 text-gray-700 hover:bg-gray-50"
                            >
                              ยกเลิก
                            </button>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-2">
                            <button
                              type="button"
                              disabled={busy}
                              onClick={() => setRole(u.id, 'MEMBER')}
                              className="inline-flex items-center px-2.5 py-1 text-xs rounded-md bg-gray-900 text-white hover:bg-black"
                            >
                              <Check className="w-3.5 h-3.5 mr-1" />
                              อนุมัติ
                            </button>
                            <button
                              type="button"
                              disabled={busy}
                              onClick={() => setConfirmRejectId(u.id)}
                              className="inline-flex items-center px-2.5 py-1 text-xs rounded-md border border-gray-200 text-gray-700 hover:bg-gray-50"
                            >
                              <X className="w-3.5 h-3.5 mr-1" />
                              ปฏิเสธ
                            </button>
                          </span>
                        ))}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
