'use client';
// app/dashboard/works/page.tsx — รายการผลงานทั้งหมด (รวมที่ยังไม่เผยแพร่) สำหรับเจ้าหน้าที่ · สิทธิ์จริงเช็คที่ /api/works
import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { Eye, EyeOff, ExternalLink, Paperclip, Plus, Search } from 'lucide-react';
import { ISSUE_GROUPS } from '@/app/lib/issues';

interface Row {
  id: number;
  title: string;
  issueKey: string | null;
  province: string;
  district: string;
  areaName: string | null;
  startDate: string | null;
  isPublished: boolean;
  sourceSystem: string | null;
  _count: { attachments: number; links: number };
}

const fmt = (d: string | null) =>
  d ? new Date(d).toLocaleDateString('th-TH', { year: 'numeric', month: 'short', day: 'numeric', timeZone: 'Asia/Bangkok' }) : '—';

export default function DashboardWorksPage() {
  const [rows, setRows] = useState<Row[] | null>(null);
  const [error, setError] = useState('');
  const [q, setQ] = useState('');
  const [show, setShow] = useState<'all' | 'published' | 'draft'>('all');

  useEffect(() => {
    fetch('/api/works', { cache: 'no-store' })
      .then(async (r) => {
        const j = await r.json().catch(() => ({}));
        if (!r.ok) throw new Error(j.error || 'โหลดรายการไม่สำเร็จ');
        setRows(j.works);
      })
      .catch((e) => setError(e.message));
  }, []);

  const shown = useMemo(() => {
    const term = q.trim();
    return (rows ?? []).filter(
      (r) =>
        (show === 'all' || (show === 'published') === r.isPublished) &&
        (!term || `${r.title} ${r.province} ${r.district} ${r.areaName ?? ''}`.includes(term)),
    );
  }, [rows, q, show]);

  if (error) return <div className="p-6"><div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div></div>;
  if (!rows) return <div className="flex justify-center p-6"><div className="h-8 w-8 animate-spin rounded-full border-b-2 border-gray-600" /></div>;

  const published = rows.filter((r) => r.isPublished).length;

  return (
    <div className="p-6">
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="mb-1 text-2xl font-bold text-gray-900">ผลงานในพื้นที่</h1>
          <p className="text-sm text-gray-600">
            ทั้งหมด {rows.length} งาน · เผยแพร่แล้ว {published} · ยังไม่เผยแพร่ {rows.length - published}
          </p>
        </div>
        <div className="flex gap-2">
          <Link href="/works" target="_blank" className="inline-flex items-center gap-2 rounded-md border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 hover:bg-gray-50">
            <ExternalLink className="h-4 w-4" /> หน้าสาธารณะ
          </Link>
          <Link href="/dashboard/works/new" className="inline-flex items-center gap-2 rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-700">
            <Plus className="h-4 w-4" /> เพิ่มงาน
          </Link>
        </div>
      </div>

      <div className="mb-4 flex flex-wrap items-center gap-3">
        <label className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="ค้นชื่องานหรือพื้นที่" className="h-10 w-64 rounded-md border border-gray-300 pl-9 pr-3 text-sm outline-none focus:border-gray-900" />
        </label>
        {(['all', 'published', 'draft'] as const).map((k) => (
          <button
            key={k}
            type="button"
            onClick={() => setShow(k)}
            className={`h-10 rounded-md px-3 text-sm ${show === k ? 'bg-gray-900 text-white' : 'border border-gray-200 bg-white text-gray-700 hover:bg-gray-50'}`}
          >
            {k === 'all' ? 'ทั้งหมด' : k === 'published' ? 'เผยแพร่แล้ว' : 'ยังไม่เผยแพร่'}
          </button>
        ))}
      </div>

      <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-left text-xs text-gray-500">
            <tr>
              <th className="px-4 py-3 font-medium">งาน</th>
              <th className="px-4 py-3 font-medium">ประเด็น</th>
              <th className="px-4 py-3 font-medium">เริ่มงาน</th>
              <th className="px-4 py-3 font-medium">ไฟล์ / ลิงก์</th>
              <th className="px-4 py-3 font-medium">สถานะ</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {shown.map((r) => (
              <tr key={r.id} className="hover:bg-yellow-50/40">
                <td className="px-4 py-3">
                  <Link href={`/dashboard/works/${r.id}`} className="font-medium text-gray-900 hover:text-yellow-700">{r.title}</Link>
                  <p className="mt-0.5 text-xs text-gray-500">{r.areaName ? `${r.areaName} · ` : ''}ต.{r.district} จ.{r.province}</p>
                </td>
                <td className="px-4 py-3 text-gray-700">{ISSUE_GROUPS.find((g) => g.key === r.issueKey)?.title ?? <span className="text-gray-400">ยังไม่ระบุ</span>}</td>
                <td className="whitespace-nowrap px-4 py-3 text-gray-700">{fmt(r.startDate)}</td>
                <td className="whitespace-nowrap px-4 py-3 text-gray-700">
                  <span className="inline-flex items-center gap-1"><Paperclip className="h-3.5 w-3.5 text-gray-400" />{r._count.attachments}</span>
                  <span className="ml-3 text-gray-500">{r._count.links} ลิงก์</span>
                </td>
                <td className="whitespace-nowrap px-4 py-3">
                  {r.isPublished ? (
                    <span className="inline-flex items-center gap-1 rounded-full bg-green-50 px-2 py-0.5 text-xs text-green-700"><Eye className="h-3 w-3" /> เผยแพร่</span>
                  ) : (
                    <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600"><EyeOff className="h-3 w-3" /> ร่าง</span>
                  )}
                </td>
              </tr>
            ))}
            {shown.length === 0 && (
              <tr><td colSpan={5} className="px-4 py-10 text-center text-gray-500">ไม่พบงาน</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
