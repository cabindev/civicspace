// app/components/home/HeroStats.tsx — ตัวเลขรวมจาก CivicSpace API (จาก /categories/ ที่นับให้แล้ว)
// เดิมมี "Total Views" ที่รวมแค่ยอดอ่านของโพสต์ยอดนิยม 4 รายการ — ตัวเลขชวนเข้าใจผิด จึงเอาออก
import { getSiteStats } from '@/app/lib/homeData';
import { CountUp } from './Motion';

const ITEMS = [
  { key: 'posts', label: 'เรื่องเล่าและบทความ' },
  { key: 'videos', label: 'วิดีโอจากพื้นที่' },
  { key: 'surveys', label: 'แบบสำรวจ' },
  { key: 'categories', label: 'ประเด็นที่ทำงาน' },
] as const;

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <dl className="grid grid-cols-2 lg:grid-cols-4 gap-px overflow-hidden rounded-2xl bg-white/10 ring-1 ring-white/10 max-w-4xl mx-auto">
      {children}
    </dl>
  );
}

export function HeroStatsSkeleton() {
  return (
    <Shell>
      {ITEMS.map((item) => (
        <div key={item.key} className="bg-stone-900/80 px-4 py-5 sm:py-6">
          <div className="h-9 sm:h-10 w-20 mx-auto rounded bg-white/10 animate-pulse" />
          <div className="h-3 w-24 mx-auto mt-3 rounded bg-white/10 animate-pulse" />
        </div>
      ))}
    </Shell>
  );
}

export default async function HeroStats() {
  const stats = await getSiteStats();
  // API ล่ม = getCategories() คืน [] → ทุกค่าเป็น 0 ซ่อนทั้งแถบดีกว่าโชว์เลข 0
  if (ITEMS.every((item) => !stats[item.key])) return null;

  return (
    <Shell>
      {ITEMS.map((item) => (
        <div key={item.key} className="flex flex-col-reverse bg-stone-900/80 px-4 py-5 sm:py-6 text-center">
          <dt className="mt-1 text-xs sm:text-sm text-stone-400">{item.label}</dt>
          <dd className="text-3xl sm:text-4xl font-bold text-white">
            <CountUp value={stats[item.key]} />
          </dd>
        </div>
      ))}
    </Shell>
  );
}
