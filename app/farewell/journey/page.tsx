// app/farewell/journey/page.tsx
// เส้นทางสุดท้าย: หน้าเรียนรู้งานศพแบบ 3D เลื่อนตาม (หีบปิดฝา → หันเข้าเมรุ → เข้าเตา → ปิดเตา)
// เดิมอยู่ที่ /last-journey (redirect ไว้ใน next.config.mjs) · ดูแบบได้ที่ docs/last-journey/BRIEF.md
// Navbar/Footer มาจาก app/farewell/layout.tsx
import type { Metadata } from 'next';
import JourneyScroll from './components/JourneyScroll';
import JourneyContent from './components/JourneyContent';
import fontStyles from '../farewell.module.css';

export const revalidate = 300;

export const metadata: Metadata = {
  title: 'เส้นทางสุดท้าย · เรียนรู้งานศพที่เรียบง่าย',
  description:
    'เดินไปส่งหีบศพหนึ่งใบตั้งแต่ปิดฝาจนเข้าเตา พร้อมบทเรียนงานศพที่เรียบง่าย ประหยัด ไม่เลี้ยงเหล้า จากพื้นที่ที่ทำได้จริง',
  alternates: { canonical: '/farewell/journey' },
};

export default function JourneyPage() {
  return (
    <main className={fontStyles.sao}>
      <JourneyScroll />
      <JourneyContent />
    </main>
  );
}
