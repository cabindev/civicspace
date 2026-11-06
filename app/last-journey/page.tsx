// app/last-journey/page.tsx
// เส้นทางสุดท้าย: หน้าเรียนรู้งานศพแบบ 3D เลื่อนตาม (หีบปิดฝา → หันเข้าเมรุ → เข้าเตา → ปิดเตา)
// ดูแบบได้ที่ docs/last-journey/BRIEF.md
import type { Metadata } from 'next';
import Navbar from '../components/Navbar';
import { Footer } from '../components/Footer';
import JourneyScroll from './components/JourneyScroll';
import JourneyContent from './components/JourneyContent';

export const revalidate = 300;

export const metadata: Metadata = {
  title: 'เส้นทางสุดท้าย · เรียนรู้งานศพที่เรียบง่าย',
  description:
    'เดินไปส่งหีบศพหนึ่งใบตั้งแต่ปิดฝาจนเข้าเตา พร้อมบทเรียนงานศพที่เรียบง่าย ประหยัด ไม่เลี้ยงเหล้า จากพื้นที่ที่ทำได้จริง',
  alternates: { canonical: '/last-journey' },
};

export default function LastJourneyPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Navbar ต้องอยู่เหนือส่วน 3D ที่ดึงขึ้นไปซ้อนใต้ (-mt-16) ให้ภาพเต็มจอแรกพอดี */}
      <div className="relative z-20">
        <Navbar />
      </div>
      <main>
        <JourneyScroll />
        <JourneyContent />
      </main>
      <Footer />
    </div>
  );
}
