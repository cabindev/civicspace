// app/page.tsx
// หน้าแรกเป็น Server Component: HTML พร้อมเนื้อหาถูกส่งมาจากเซิร์ฟเวอร์เลย
// ไม่ต้องรอ JS โหลดเสร็จแล้วค่อยยิง API จากเบราว์เซอร์เหมือนเดิม
import { Suspense } from 'react';
import Navbar from './components/Navbar';
import { Footer } from './components/Footer';
import LifeCycle from './components/LifeCycle';
import HomeHero from './components/home/HomeHero';
import LifeJourney, { LifeJourneySkeleton } from './components/home/LifeJourney';
import FarewellFeature from './components/home/FarewellFeature';
import LatestPostsSection, { LatestPostsSkeleton } from './components/home/LatestPostsSection';
import LatestVideosSection, { LatestVideosSkeleton } from './components/home/LatestVideosSection';
import SurveysSection from './components/home/SurveysSection';
import PopularAndCategories from './components/home/PopularAndCategories';

// ข้อมูลทั้งหน้าแคชไว้ 5 นาที (ดู REVALIDATE ใน app/lib/homeData.ts)
export const revalidate = 300;

export default function HomePage() {
  return (
    <div className="min-h-screen">
      <Navbar showDashboardLink={true} />

      {/* LifeCycle Section - renders immediately, no API dependency */}
      <LifeCycle />

      {/* เปิดเรื่อง: จาก "เวลาที่เหลือ" สู่ "ทุกช่วงชีวิตมีทางออก" + ตัวเลขจริง */}
      <HomeHero />

      {/* เส้นทางชีวิต 3 ช่วง — แก่นของเว็บ พาเข้าหน้าประเด็น */}
      <Suspense fallback={<LifeJourneySkeleton />}>
        <LifeJourney />
      </Suspense>

      {/* ทางออกของช่วงชีวิตที่ 3 (งานศพ): ส่งด้วยใจ — พื้นสีเดียวกับเส้นทางชีวิต ต่อกันเป็นส่วนเดียว */}
      <FarewellFeature />

      {/* แต่ละ section ดึงข้อมูลของตัวเองแบบขนาน ส่วนไหนพร้อมก่อนแสดงก่อน */}
      <Suspense fallback={<LatestPostsSkeleton />}>
        <LatestPostsSection />
      </Suspense>

      <Suspense fallback={<LatestVideosSkeleton />}>
        <LatestVideosSection />
      </Suspense>

      <Suspense fallback={null}>
        <SurveysSection />
      </Suspense>

      <Suspense fallback={null}>
        <PopularAndCategories />
      </Suspense>

      <Footer />
    </div>
  );
}
