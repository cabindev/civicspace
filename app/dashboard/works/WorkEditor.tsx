'use client';
// app/dashboard/works/WorkEditor.tsx — ฟอร์มเพิ่ม/แก้ผลงาน + จัดการไฟล์แนบ (ใช้ทั้ง /new และ /[id])
// ข้อมูลตรวจซ้ำที่ API (app/lib/workInput.ts) — ที่นี่ช่วยกรอกให้ครบเท่านั้น
// ไฟล์แนบอัปโหลดได้หลังบันทึกงานครั้งแรก (ต้องมี id ก่อน) · ไฟล์ใหม่เริ่มเป็น "ไม่เผยแพร่"
import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import toast, { Toaster } from 'react-hot-toast';
import { ArrowLeft, ExternalLink, Eye, EyeOff, FileText, ImageIcon, Lock, Plus, Star, Trash2, Upload } from 'lucide-react';
import { ISSUE_GROUPS } from '@/app/lib/issues';

const REGIONS: [string, string][] = [
  ['north-upper', 'ภาคเหนือบน'], ['north-lower', 'ภาคเหนือล่าง'], ['northeast-upper', 'ภาคอีสานบน'], ['northeast-lower', 'ภาคอีสานล่าง'],
  ['central', 'ภาคกลาง'], ['east', 'ภาคตะวันออก'], ['west', 'ภาคตะวันตก'], ['south-upper', 'ภาคใต้บน'], ['south-lower', 'ภาคใต้ล่าง'], ['bangkok', 'กรุงเทพฯ'],
];

interface LinkRow { url: string; title: string; isPublic: boolean }
interface FileRow { id: number; kind: 'IMAGE' | 'DOCUMENT'; fileName: string; caption: string | null; isPublic: boolean; isCover: boolean; size: number }

type Form = Record<
  | 'title' | 'description' | 'issueKey' | 'status' | 'startDate' | 'endDate'
  | 'areaName' | 'district' | 'amphoe' | 'province' | 'region' | 'latitude' | 'longitude'
  | 'storyLead' | 'storyProcess' | 'storyLessons'
  | 'coordinatorName' | 'coordinatorRole' | 'coordinatorPhone' | 'coordinatorLine',
  string
>;

const EMPTY: Form = {
  title: '', description: '', issueKey: '', status: 'ACTIVE', startDate: '', endDate: '',
  areaName: '', district: '', amphoe: '', province: '', region: '', latitude: '', longitude: '',
  storyLead: '', storyProcess: '', storyLessons: '',
  coordinatorName: '', coordinatorRole: '', coordinatorPhone: '', coordinatorLine: '',
};

/** วันที่ใน DB (UTC) → YYYY-MM-DD ตามเวลาไทย */
const toDateInput = (d: string | null) => (d ? new Date(new Date(d).getTime() + 7 * 3600_000).toISOString().slice(0, 10) : '');

const input = 'mt-1.5 h-10 w-full rounded-md border border-gray-300 bg-white px-3 text-sm outline-none focus:border-gray-900 focus:ring-2 focus:ring-gray-200';
const area = 'mt-1.5 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm leading-relaxed outline-none focus:border-gray-900 focus:ring-2 focus:ring-gray-200';

function Field({ label, hint, children, className = '' }: { label: string; hint?: string; children: React.ReactNode; className?: string }) {
  return (
    <label className={`block ${className}`}>
      <span className="text-sm font-medium text-gray-900">{label}</span>
      {hint && <span className="ml-1.5 text-xs text-gray-500">{hint}</span>}
      {children}
    </label>
  );
}

function Card({ title, desc, children }: { title: string; desc?: string; children: React.ReactNode }) {
  return (
    <section className="rounded-lg border border-gray-200 bg-white p-5 sm:p-6">
      <h2 className="text-base font-semibold text-gray-900">{title}</h2>
      {desc && <p className="mt-1 text-xs text-gray-500">{desc}</p>}
      <div className="mt-5 space-y-4">{children}</div>
    </section>
  );
}

export default function WorkEditor({ id }: { id?: number }) {
  const router = useRouter();
  const [form, setForm] = useState<Form>(EMPTY);
  const [links, setLinks] = useState<LinkRow[]>([]);
  const [files, setFiles] = useState<FileRow[]>([]);
  const [isPublished, setIsPublished] = useState(false);
  const [loaded, setLoaded] = useState(!id);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [source, setSource] = useState<string | null>(null);
  const fileInput = useRef<HTMLInputElement>(null);

  const set = (k: keyof Form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const apply = useCallback((w: any) => {
    setForm({
      ...EMPTY,
      ...Object.fromEntries(Object.keys(EMPTY).map((k) => [k, w[k] == null ? '' : String(w[k])])),
      startDate: toDateInput(w.startDate),
      endDate: toDateInput(w.endDate),
    } as Form);
    setLinks(w.links.map((l: LinkRow) => ({ url: l.url, title: l.title ?? '', isPublic: l.isPublic })));
    setFiles(w.attachments);
    setIsPublished(w.isPublished);
    setSource(w.sourceSystem);
    setLoaded(true);
  }, []);

  const fetchWork = useCallback(async () => {
    const r = await fetch(`/api/works/${id}`, { cache: 'no-store' });
    const j = await r.json().catch(() => ({}));
    if (!r.ok) throw new Error(j.error || 'โหลดงานไม่สำเร็จ');
    return j.work;
  }, [id]);

  const load = useCallback(
    () => fetchWork().then(apply, (e: Error) => toast.error(e.message)),
    [fetchWork, apply],
  );

  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    fetchWork().then(
      (w) => !cancelled && apply(w),
      (e: Error) => !cancelled && toast.error(e.message),
    );
    return () => {
      cancelled = true;
    };
  }, [id, fetchWork, apply]);

  async function save(publish = isPublished) {
    setSaving(true);
    try {
      const r = await fetch(id ? `/api/works/${id}` : '/api/works', {
        method: id ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, links: links.filter((l) => l.url.trim()), isPublished: publish }),
      });
      const j = await r.json().catch(() => ({}));
      if (!r.ok) throw new Error(j.error || 'บันทึกไม่สำเร็จ');
      setIsPublished(publish);
      toast.success(id ? 'บันทึกแล้ว' : 'สร้างงานแล้ว — อัปโหลดรูปต่อได้เลย');
      if (!id) router.replace(`/dashboard/works/${j.id}`);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'บันทึกไม่สำเร็จ');
    } finally {
      setSaving(false);
    }
  }

  async function upload(list: FileList | null) {
    if (!id || !list?.length) return;
    setUploading(true);
    const fd = new FormData();
    Array.from(list).forEach((f) => fd.append('files', f));
    try {
      const r = await fetch(`/api/works/${id}/files`, { method: 'POST', body: fd });
      const j = await r.json().catch(() => ({}));
      if (j.saved?.length) toast.success(`อัปโหลด ${j.saved.length} ไฟล์ (ยังไม่เผยแพร่)`);
      if (j.rejected?.length) toast.error(`ไม่รับ: ${j.rejected.join(', ')}`, { duration: 8000 });
      if (!r.ok && !j.rejected?.length) toast.error(j.error || 'อัปโหลดไม่สำเร็จ');
      await load();
    } finally {
      setUploading(false);
      if (fileInput.current) fileInput.current.value = '';
    }
  }

  async function fileAction(fileId: number, init: RequestInit, msg: string) {
    const r = await fetch(`/api/works/${id}/files/${fileId}`, init);
    const j = await r.json().catch(() => ({}));
    if (!r.ok) { toast.error(j.error || 'ทำรายการไม่สำเร็จ'); return; }
    toast.success(msg);
    await load();
  }
  const patchFile = (fileId: number, body: object, msg: string) =>
    fileAction(fileId, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) }, msg);

  async function removeWork() {
    if (!id || !window.confirm('ซ่อนงานนี้ออกจากระบบ? (กู้คืนได้จากฐานข้อมูล)')) return;
    const r = await fetch(`/api/works/${id}`, { method: 'DELETE' });
    if (r.ok) { toast.success('ซ่อนงานแล้ว'); router.replace('/dashboard/works'); }
    else toast.error('ทำรายการไม่สำเร็จ');
  }

  if (!loaded) return <div className="flex justify-center p-6"><div className="h-8 w-8 animate-spin rounded-full border-b-2 border-gray-600" /></div>;

  return (
    <div className="mx-auto max-w-4xl p-6 pb-28">
      <Toaster />
      <Link href="/dashboard/works" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900"><ArrowLeft className="h-4 w-4" /> ผลงานทั้งหมด</Link>
      <div className="mt-3 mb-6 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{id ? 'แก้ไขผลงาน' : 'เพิ่มผลงาน'}</h1>
          {source && <p className="mt-1 text-xs text-gray-500">นำเข้าจาก {source} — แก้ที่นี่ได้เลย การนำเข้าซ้ำจะทับเนื้อหาด้วยข้อมูลต้นทาง (ยกเว้นประเด็น)</p>}
        </div>
        {id && (
          <Link href={`/works/${id}`} target="_blank" className="inline-flex items-center gap-1.5 rounded-md border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 hover:bg-gray-50">
            <ExternalLink className="h-4 w-4" /> ดูหน้าจริง
          </Link>
        )}
      </div>

      <div className="space-y-6">
        <Card title="ข้อมูลงาน">
          <Field label="ชื่องาน *"><input className={input} value={form.title} onChange={set('title')} maxLength={191} /></Field>
          <Field label="คำอธิบายสั้น *" hint="แสดงบนการ์ดและเป็นสรุปท้ายหน้า"><textarea className={area} rows={3} value={form.description} onChange={set('description')} /></Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="ประเด็น">
              <select className={input} value={form.issueKey} onChange={set('issueKey')}>
                <option value="">— ยังไม่ระบุ —</option>
                {ISSUE_GROUPS.map((g) => <option key={g.key} value={g.key}>{g.title}</option>)}
              </select>
            </Field>
            <Field label="สถานะงาน">
              <select className={input} value={form.status} onChange={set('status')}>
                <option value="PLANNING">วางแผน</option>
                <option value="ACTIVE">กำลังดำเนินการ</option>
                <option value="COMPLETED">เสร็จสิ้น</option>
              </select>
            </Field>
            <Field label="วันเริ่มงาน"><input type="date" className={input} value={form.startDate} onChange={set('startDate')} /></Field>
            <Field label="วันสิ้นสุด" hint="ไม่บังคับ"><input type="date" className={input} value={form.endDate} onChange={set('endDate')} /></Field>
          </div>
        </Card>

        <Card title="พื้นที่" desc="พิกัดไม่บังคับ — ถ้าใส่ จุดบนแผนที่จะตรงตำแหน่ง (คัดลอกจาก Google Maps: คลิกขวาที่จุด แล้วกดตัวเลขพิกัด)">
          <Field label="ชื่อสถานที่" hint="เช่น ถนนข้าวเหนียว, วัดจันทรังษี"><input className={input} value={form.areaName} onChange={set('areaName')} /></Field>
          <div className="grid gap-4 sm:grid-cols-3">
            <Field label="ตำบล / แขวง *"><input className={input} value={form.district} onChange={set('district')} /></Field>
            <Field label="อำเภอ / เขต *"><input className={input} value={form.amphoe} onChange={set('amphoe')} /></Field>
            <Field label="จังหวัด *"><input className={input} value={form.province} onChange={set('province')} /></Field>
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            <Field label="ภูมิภาค *">
              <select className={input} value={form.region} onChange={set('region')}>
                <option value="">— เลือก —</option>
                {REGIONS.map(([k, l]) => <option key={k} value={k}>{l}</option>)}
              </select>
            </Field>
            <Field label="ละติจูด"><input inputMode="decimal" className={input} value={form.latitude} onChange={set('latitude')} placeholder="16.43" /></Field>
            <Field label="ลองจิจูด"><input inputMode="decimal" className={input} value={form.longitude} onChange={set('longitude')} placeholder="102.83" /></Field>
          </div>
        </Card>

        <Card title="เรื่องเล่า" desc="พิมพ์ข้อความธรรมดา: ขึ้นบรรทัดใหม่ว่าง = ย่อหน้าใหม่ · ■ หัวข้อ · - รายการ · 1) หัวข้อย่อย · ขั้นที่ 1 ...">
          <Field label="บทนำ" hint="ย่อหน้าแรกแสดงเป็นคำโปรยตัวใหญ่"><textarea className={area} rows={8} value={form.storyLead} onChange={set('storyLead')} /></Field>
          <Field label="กระบวนการ"><textarea className={area} rows={8} value={form.storyProcess} onChange={set('storyProcess')} /></Field>
          <Field label="บทเรียน"><textarea className={area} rows={8} value={form.storyLessons} onChange={set('storyLessons')} /></Field>
        </Card>

        <Card title="ลิงก์" desc="โพสต์ Facebook, คลิป YouTube, ข่าว — ระบบเดาชนิดจากลิงก์ให้เอง">
          {links.map((l, i) => (
            <div key={i} className="grid gap-2 rounded-md border border-gray-100 p-3 sm:grid-cols-[1fr_14rem_auto_auto] sm:items-center">
              <input className="h-10 rounded-md border border-gray-300 px-3 text-sm" placeholder="https://..." value={l.url} onChange={(e) => setLinks((ls) => ls.map((x, j) => (j === i ? { ...x, url: e.target.value } : x)))} />
              <input className="h-10 rounded-md border border-gray-300 px-3 text-sm" placeholder="ชื่อที่แสดง (ไม่บังคับ)" value={l.title} onChange={(e) => setLinks((ls) => ls.map((x, j) => (j === i ? { ...x, title: e.target.value } : x)))} />
              <label className="inline-flex items-center gap-1.5 text-xs text-gray-700">
                <input type="checkbox" checked={l.isPublic} onChange={(e) => setLinks((ls) => ls.map((x, j) => (j === i ? { ...x, isPublic: e.target.checked } : x)))} /> เผยแพร่
              </label>
              <button type="button" onClick={() => setLinks((ls) => ls.filter((_, j) => j !== i))} className="justify-self-start rounded-md p-2 text-gray-400 hover:bg-red-50 hover:text-red-600" aria-label="ลบลิงก์"><Trash2 className="h-4 w-4" /></button>
            </div>
          ))}
          <button type="button" onClick={() => setLinks((ls) => [...ls, { url: '', title: '', isPublic: true }])} className="inline-flex items-center gap-1.5 rounded-md border border-dashed border-gray-300 px-3 py-2 text-sm text-gray-700 hover:border-gray-900">
            <Plus className="h-4 w-4" /> เพิ่มลิงก์
          </button>
        </Card>

        <Card title="รูปและเอกสาร" desc="JPG / PNG / WebP / PDF ไม่เกิน 15 MB ต่อไฟล์ · ไฟล์ใหม่ยังไม่เผยแพร่จนกว่าจะกดเปิด · ปกต้องเป็นรูปที่เผยแพร่">
          {!id ? (
            <p className="text-sm text-gray-500">บันทึกงานครั้งแรกก่อน แล้วจึงอัปโหลดรูปได้</p>
          ) : (
            <>
              <input ref={fileInput} type="file" multiple accept="image/jpeg,image/png,image/webp,application/pdf" className="hidden" onChange={(e) => upload(e.target.files)} />
              <button type="button" disabled={uploading} onClick={() => fileInput.current?.click()} className="inline-flex items-center gap-2 rounded-md border border-gray-300 bg-white px-4 py-2 text-sm text-gray-900 hover:border-gray-900 disabled:opacity-50">
                <Upload className="h-4 w-4" /> {uploading ? 'กำลังอัปโหลด…' : 'อัปโหลดไฟล์'}
              </button>
              {files.length > 0 && (
                <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                  {files.map((f) => (
                    <li key={f.id} className={`overflow-hidden rounded-lg border ${f.isCover ? 'border-yellow-400 ring-2 ring-yellow-300' : 'border-gray-200'}`}>
                      <a href={`/api/works/files/${f.id}`} target="_blank" rel="noopener noreferrer" className="relative block aspect-square bg-gray-100">
                        {f.kind === 'IMAGE' ? (
                          // eslint-disable-next-line @next/next/no-img-element -- ไฟล์ภายในต้องส่ง cookie ของเจ้าหน้าที่ next/image ทำไม่ได้
                          <img src={`/api/works/files/${f.id}`} alt="" loading="lazy" className="h-full w-full object-cover" />
                        ) : (
                          <span className="flex h-full flex-col items-center justify-center gap-2 p-3 text-center text-xs text-gray-600"><FileText className="h-8 w-8 text-gray-400" />{f.fileName}</span>
                        )}
                        {f.isCover && <span className="absolute left-2 top-2 rounded-full bg-yellow-400 px-2 py-0.5 text-[11px] font-semibold text-gray-900">ปก</span>}
                        {!f.isPublic && <span className="absolute right-2 top-2 rounded-full bg-black/60 p-1 text-white" title="ไม่เผยแพร่"><Lock className="h-3 w-3" /></span>}
                      </a>
                      <div className="space-y-2 p-2">
                        <input
                          defaultValue={f.caption ?? ''}
                          placeholder="คำบรรยาย"
                          onBlur={(e) => e.target.value !== (f.caption ?? '') && patchFile(f.id, { caption: e.target.value }, 'บันทึกคำบรรยายแล้ว')}
                          className="h-8 w-full rounded border border-gray-200 px-2 text-xs"
                        />
                        <div className="flex items-center justify-between gap-1">
                          <button type="button" onClick={() => patchFile(f.id, { isPublic: !f.isPublic }, f.isPublic ? 'ซ่อนไฟล์แล้ว' : 'เผยแพร่ไฟล์แล้ว')} className="inline-flex items-center gap-1 rounded px-1.5 py-1 text-xs text-gray-700 hover:bg-gray-100" title={f.isPublic ? 'ซ่อนจากหน้าสาธารณะ' : 'เผยแพร่'}>
                            {f.isPublic ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}{f.isPublic ? 'เผยแพร่' : 'ซ่อน'}
                          </button>
                          {f.kind === 'IMAGE' && !f.isCover && (
                            <button type="button" onClick={() => patchFile(f.id, { isCover: true }, 'ตั้งเป็นปกแล้ว')} className="rounded p-1 text-gray-500 hover:bg-yellow-50 hover:text-yellow-700" title="ตั้งเป็นปก"><Star className="h-3.5 w-3.5" /></button>
                          )}
                          <button type="button" onClick={() => window.confirm(`ลบ ${f.fileName}?`) && fileAction(f.id, { method: 'DELETE' }, 'ลบไฟล์แล้ว')} className="rounded p-1 text-gray-400 hover:bg-red-50 hover:text-red-600" title="ลบไฟล์"><Trash2 className="h-3.5 w-3.5" /></button>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
              {files.length === 0 && <p className="inline-flex items-center gap-2 text-sm text-gray-500"><ImageIcon className="h-4 w-4" /> ยังไม่มีไฟล์</p>}
            </>
          )}
        </Card>

        <Card title="ผู้ประสานงานในพื้นที่" desc="ข้อมูลภายใน — ไม่แสดงบนหน้าสาธารณะ">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="ชื่อ"><input className={input} value={form.coordinatorName} onChange={set('coordinatorName')} /></Field>
            <Field label="บทบาท"><input className={input} value={form.coordinatorRole} onChange={set('coordinatorRole')} /></Field>
            <Field label="โทรศัพท์"><input className={input} value={form.coordinatorPhone} onChange={set('coordinatorPhone')} /></Field>
            <Field label="LINE"><input className={input} value={form.coordinatorLine} onChange={set('coordinatorLine')} /></Field>
          </div>
        </Card>

        {id && (
          <button type="button" onClick={removeWork} className="inline-flex items-center gap-1.5 text-sm text-red-600 hover:underline"><Trash2 className="h-4 w-4" /> ซ่อนงานนี้ออกจากระบบ</button>
        )}
      </div>

      {/* แถบบันทึกติดล่าง */}
      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-gray-200 bg-white/95 backdrop-blur lg:left-64">
        <div className="mx-auto flex max-w-4xl flex-wrap items-center justify-between gap-3 px-6 py-3">
          <span className={`inline-flex items-center gap-1.5 text-sm ${isPublished ? 'text-green-700' : 'text-gray-600'}`}>
            {isPublished ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
            {isPublished ? 'เผยแพร่อยู่ — คนทั่วไปเห็นงานนี้' : 'ยังไม่เผยแพร่ — เห็นเฉพาะเจ้าหน้าที่'}
          </span>
          <div className="flex gap-2">
            <button type="button" disabled={saving} onClick={() => save(!isPublished)} className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm text-gray-900 hover:border-gray-900 disabled:opacity-50">
              {isPublished ? 'บันทึกและยกเลิกเผยแพร่' : 'บันทึกและเผยแพร่'}
            </button>
            <button type="button" disabled={saving} onClick={() => save()} className="rounded-md bg-gray-900 px-5 py-2 text-sm font-medium text-white hover:bg-gray-700 disabled:opacity-50">
              {saving ? 'กำลังบันทึก…' : 'บันทึก'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
