// app/page.tsx
// หน้าแรกเป็น Server Component: HTML พร้อมเนื้อหาถูกส่งมาจากเซิร์ฟเวอร์เลย
// ไม่ต้องรอ JS โหลดเสร็จแล้วค่อยยิง API จากเบราว์เซอร์เหมือนเดิม
import { Suspense } from 'react';
import Navbar from './components/Navbar';
import { Footer } from './components/Footer';
import LifeCycle from './components/LifeCycle';
import HeroStats, { HeroStatsSkeleton } from './components/home/HeroStats';
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

      {/* Hero Section */}
      <section className="bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20">
          <div className="text-center">
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-4 sm:mb-6">
              CivicSpace
            </h1>
            <p className="text-base sm:text-lg md:text-xl text-gray-600 mb-8 sm:mb-12 max-w-3xl mx-auto leading-relaxed px-4">
              Resource hub for articles and research
              <br className="hidden sm:block" />
              <span className="font-semibold">
                Civic space for collaborative solutions to alcohol issues
              </span>
            </p>

            {/* Stats — สตรีมเข้ามาทีหลัง ไม่บล็อกส่วนอื่นของหน้า */}
            <Suspense fallback={<HeroStatsSkeleton />}>
              <HeroStats />
            </Suspense>
          </div>
        </div>
      </section>

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
