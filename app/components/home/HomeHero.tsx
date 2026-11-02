// app/components/home/HomeHero.tsx — ส่วนเปิดหลัง LifeCycle: "เวลาที่เหลือ" → "ทุกช่วงชีวิตมีทางออก"
import { Suspense } from 'react';
import Link from 'next/link';
import { ArrowRight, PlayCircle } from 'lucide-react';
import HeroStats, { HeroStatsSkeleton } from './HeroStats';
import { Reveal } from './Motion';

export default function HomeHero() {
  return (
    <section className="relative isolate overflow-hidden bg-stone-950 text-white">
      {/* แสงเหลืองฟุ้ง ๆ ด้านหลัง (ตกแต่งล้วน) */}
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute left-1/2 top-0 h-[38rem] w-[38rem] -translate-x-1/2 -translate-y-1/3 rounded-full bg-yellow-500/25 blur-3xl" />
        <div className="absolute -left-24 bottom-0 h-72 w-72 rounded-full bg-amber-600/20 blur-3xl" />
        <div className="absolute -right-24 bottom-10 h-72 w-72 rounded-full bg-yellow-400/10 blur-3xl" />
        <div className="absolute inset-0 bg-[radial-gradient(rgba(255,255,255,0.06)_1px,transparent_1px)] [background-size:22px_22px] [mask-image:linear-gradient(to_bottom,black,transparent)]" />
        {/* โลโก้ CivicSpace จาง ๆ ด้านหลังพาดหัว — ใช้ไฟล์ svg สีเดียวเป็น mask จึงย้อมสีได้ตามธีม */}
        <div className="absolute left-1/2 top-[42%] aspect-square w-[125vw] max-w-[1150px] -translate-x-1/2 -translate-y-1/2 bg-gradient-to-b from-yellow-200 to-amber-500 opacity-[0.06] [mask-image:url(/civicspace.svg)] [mask-position:center] [mask-repeat:no-repeat] [mask-size:contain] sm:w-[85vw]" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 text-center">
        <Reveal>
          <p className="inline-flex items-center gap-2 rounded-full border border-yellow-400/30 bg-yellow-400/10 px-3 py-1 text-xs sm:text-sm text-yellow-300">
            <span className="h-1.5 w-1.5 rounded-full bg-yellow-400 animate-pulse" />
            CivicSpace · พื้นที่พลเมืองร่วมหาทางออกปัญหาแอลกอฮอล์
          </p>
        </Reveal>

        <Reveal delay={0.08}>
          <h1 className="mt-6 text-4xl sm:text-5xl lg:text-6xl font-bold leading-[1.15] tracking-tight">
            ทุกช่วงชีวิต
            <br />
            <span className="bg-gradient-to-r from-yellow-300 via-amber-400 to-yellow-500 bg-clip-text text-transparent">
              มีคนหาทางออกไว้แล้ว
            </span>
          </h1>
        </Reveal>

        <Reveal delay={0.16}>
          <p className="mt-6 text-base sm:text-lg text-stone-300 max-w-2xl mx-auto leading-relaxed">
            ตั้งแต่สนามของเด็ก งานบุญประจำปี จนถึงวันบวชและวันลา
            รวมเรื่องจริงจากพื้นที่ที่ชุมชนช่วยกันทำให้ ม่วนได้ ไม่ต้องเมา
          </p>
        </Reveal>

        <Reveal delay={0.24}>
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/issues"
              className="group inline-flex items-center gap-2 rounded-full bg-yellow-400 px-6 py-3 text-sm sm:text-base font-semibold text-stone-950 shadow-lg shadow-yellow-500/20 transition hover:bg-yellow-300 hover:shadow-yellow-400/40"
            >
              เดินตามเส้นทางชีวิต
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
            <Link
              href="/video"
              className="inline-flex items-center gap-2 rounded-full border border-white/20 px-6 py-3 text-sm sm:text-base font-medium text-white transition hover:border-white/40 hover:bg-white/5"
            >
              <PlayCircle className="h-4 w-4" />
              ดูวิดีโอจากพื้นที่
            </Link>
          </div>
        </Reveal>

        <div className="mt-12 sm:mt-16">
          <Suspense fallback={<HeroStatsSkeleton />}>
            <HeroStats />
          </Suspense>
        </div>
      </div>
    </section>
  );
}
