// app/works/page.tsx — ผลงานในพื้นที่ของ Civic Space: แผนที่ + การ์ดงานเรียงจากล่าสุด กรองตามกลุ่มประเด็นได้ (?issue=)
// เห็นเฉพาะงานที่เผยแพร่แล้ว (app/lib/works.ts) · ข้อมูลจากฐานข้อมูล civicspace (ตาราง Activity)
import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowUpRight, MapPin } from 'lucide-react';
import Navbar from '../components/Navbar';
import { Footer } from '../components/Footer';
import { ISSUE_GROUPS } from '@/app/lib/issues';
import { formatWorkDate, getPublishedWorks, placeText, fileUrl, REGION_LABELS, type WorkCard } from '@/app/lib/works';
import WorksMap from './components/WorksMap';

// ข้อมูลจากฐานข้อมูลของเราเอง — อ่านใหม่ทุกครั้ง งานที่เพิ่งเผยแพร่ในแดชบอร์ดขึ้นทันที
export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'ผลงานในพื้นที่',
  description: 'งานที่ Civic Space ลงพื้นที่จริง ตั้งแต่สงกรานต์ งานบุญประเพณี จนถึงงานบวชและงานศพ พร้อมเรื่องเล่า กระบวนการ และบทเรียน',
  alternates: { canonical: '/works' },
};

function Card({ w }: { w: WorkCard }) {
  const group = ISSUE_GROUPS.find((g) => g.key === w.issueKey);
  return (
    <Link
      href={`/works/${w.id}`}
      className="group flex h-full flex-col overflow-hidden rounded-3xl bg-white shadow-sm ring-1 ring-black/5 transition duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-yellow-900/10 focus-visible:outline focus-visible:outline-4 focus-visible:outline-yellow-400"
    >
      <div className="relative aspect-video overflow-hidden bg-stone-200">
        {w.coverId ? (
          <Image
            src={fileUrl(w.coverId)}
            alt=""
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 400px"
            className="object-cover transition-transform duration-700 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center bg-gradient-to-br from-stone-800 to-stone-950">
            <MapPin className="h-10 w-10 text-yellow-400/60" />
          </div>
        )}
        {group && (
          <span className="absolute left-3 top-3 rounded-full bg-black/55 px-2.5 py-1 text-[11px] text-white backdrop-blur-sm">
            {group.stage}
          </span>
        )}
      </div>
      <div className="flex flex-1 flex-col p-5">
        <p className="text-xs text-gray-500">{formatWorkDate(w.startDate, w.startDatePrecision)}</p>
        <h2 className="mt-1.5 text-base font-bold leading-[1.6] text-gray-900 line-clamp-2 group-hover:text-yellow-700">{w.title}</h2>
        <p className="mt-auto flex items-start gap-1.5 pt-3 text-xs text-gray-600">
          <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-yellow-600" />
          <span className="line-clamp-2">{placeText(w)}</span>
        </p>
      </div>
    </Link>
  );
}

export default async function WorksPage({ searchParams }: PageProps<'/works'>) {
  const { issue } = await searchParams;
  const all = await getPublishedWorks();
  const selected = typeof issue === 'string' && ISSUE_GROUPS.some((g) => g.key === issue) ? issue : undefined;
  const works = selected ? all.filter((w) => w.issueKey === selected) : all;

  const provinces = new Set(all.map((w) => w.province)).size;
  const regions = new Set(all.map((w) => REGION_LABELS[w.region] ?? w.region)).size;
  const points = works
    .filter((w) => w.latitude != null && w.longitude != null)
    .map((w) => ({ id: w.id, title: w.title, province: w.province, lat: w.latitude!, lng: w.longitude! }));

  return (
    <div className="min-h-screen bg-[#fffbeb]">
      <Navbar />

      {/* หัวหน้า: ตัวเลข + แผนที่ */}
      <section className="relative isolate overflow-hidden bg-stone-950 text-white">
        <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute right-0 top-0 h-[32rem] w-[32rem] translate-x-1/4 -translate-y-1/4 rounded-full bg-yellow-500/20 blur-3xl" />
          <div className="absolute inset-0 bg-[radial-gradient(rgba(255,255,255,0.06)_1px,transparent_1px)] [background-size:22px_22px] [mask-image:linear-gradient(to_bottom,black,transparent)]" />
        </div>
        <div className="max-w-7xl mx-auto grid items-center gap-10 px-4 py-14 sm:px-6 sm:py-20 lg:grid-cols-5 lg:px-8">
          <div className="lg:col-span-3">
            <p className="text-sm font-semibold text-yellow-400">ผลงานในพื้นที่</p>
            <h1 className="mt-3 text-3xl font-bold leading-[1.3] sm:text-5xl">
              งานที่ลงพื้นที่จริง
              <br />
              <span className="bg-gradient-to-r from-yellow-300 to-amber-500 bg-clip-text text-transparent">กับชุมชนทั่วประเทศ</span>
            </h1>
            <p className="mt-5 max-w-xl text-base leading-relaxed text-stone-300">
              ทุกงานมีเรื่องเล่า กระบวนการ และบทเรียน ให้พื้นที่อื่นหยิบไปใช้ต่อได้
            </p>
            <dl className="mt-8 grid max-w-md grid-cols-3 gap-px overflow-hidden rounded-2xl bg-white/10 ring-1 ring-white/10">
              {[
                { v: all.length, l: 'งาน' },
                { v: provinces, l: 'จังหวัด' },
                { v: regions, l: 'ภูมิภาค' },
              ].map((s) => (
                <div key={s.l} className="flex flex-col-reverse bg-stone-900/80 px-4 py-4 text-center">
                  <dt className="text-xs text-stone-400">{s.l}</dt>
                  <dd className="text-3xl font-bold tabular-nums">{s.v}</dd>
                </div>
              ))}
            </dl>
          </div>
          <div className="mx-auto w-full max-w-[22rem] lg:col-span-2">
            <WorksMap points={points} className="h-auto w-full" />
          </div>
        </div>
      </section>

      {/* กรองตามกลุ่มประเด็น */}
      <nav aria-label="กรองตามประเด็น" className="sticky top-0 z-10 border-b border-yellow-900/10 bg-[#fffbeb]/90 backdrop-blur">
        <div className="max-w-7xl mx-auto flex gap-2 overflow-x-auto px-4 py-3 sm:px-6 lg:px-8">
          {[{ key: undefined, label: 'ทั้งหมด', n: all.length }, ...ISSUE_GROUPS.map((g) => ({ key: g.key, label: g.title, n: all.filter((w) => w.issueKey === g.key).length }))].map((f) => {
            const active = f.key === selected;
            return (
              <Link
                key={f.label}
                href={f.key ? `/works?issue=${f.key}` : '/works'}
                aria-current={active ? 'page' : undefined}
                className={`shrink-0 rounded-full px-4 py-2 text-sm transition ${
                  active ? 'bg-stone-950 text-white' : 'bg-white text-gray-700 ring-1 ring-black/10 hover:ring-black/30'
                }`}
              >
                {f.label} <span className={active ? 'text-yellow-300' : 'text-gray-400'}>{f.n}</span>
              </Link>
            );
          })}
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
        {works.length > 0 ? (
          <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {works.map((w) => (
              <li key={w.id}>
                <Card w={w} />
              </li>
            ))}
          </ul>
        ) : (
          <p className="py-16 text-center text-gray-500">ยังไม่มีผลงานที่เผยแพร่ในประเด็นนี้</p>
        )}

        {selected && (
          <p className="mt-10 text-center">
            <Link href={`/issues/${selected}`} className="inline-flex items-center gap-1 text-sm font-medium text-yellow-800 hover:text-yellow-900">
              ดูเรื่องเล่าและวิดีโอของประเด็นนี้ <ArrowUpRight className="h-4 w-4" />
            </Link>
          </p>
        )}
      </main>

      <Footer />
    </div>
  );
}
