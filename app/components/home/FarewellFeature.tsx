// app/components/home/FarewellFeature.tsx — การ์ด "ส่งด้วยใจ" บนหน้าแรก (ทางออกของประเด็นงานศพ)
// ต่อจาก "เส้นทางชีวิต" ช่วงที่ 3 (ตั้งแต่วันบวชถึงวันลา) — ใช้ฟอนต์เสาชิงช้าและโทนขาว-ดำแบบหน้า /farewell
import Link from 'next/link';
import { ArrowRight, ClipboardList, Megaphone, Sparkles } from 'lucide-react';
import ChanFlowerIcon from '@/app/farewell/components/ChanFlowerIcon';
import { SITE_NAME, SITE_TAGLINE } from '@/app/farewell/content';
import { sao } from '@/app/farewell/font';
import fontStyles from '@/app/farewell/farewell.module.css';
import { Reveal } from './Motion';

const LINKS = [
  { href: '/farewell/plan', icon: ClipboardList, label: 'วางแผนทีละขั้น' },
  { href: '/farewell/signs', icon: Megaphone, label: 'ป้าย “ไม่เลี้ยงเหล้า”' },
  { href: '/farewell/journey', icon: Sparkles, label: 'เส้นทางสุดท้าย (3D)' },
];

export default function FarewellFeature() {
  return (
    <section className={`${sao.variable} ${fontStyles.sao} bg-[#fffbeb] pb-16 sm:pb-24`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Reveal>
          <div className="grid overflow-hidden rounded-3xl bg-white shadow-sm ring-1 ring-black/5 md:grid-cols-5">
            <div className="p-7 sm:p-10 md:col-span-3">
              <p className="text-sm text-yellow-700">ทางออกของช่วงชีวิตที่ 3 · งานศพ</p>
              <div className="mt-3 flex items-center gap-3">
                <span className="flex h-12 w-12 items-center justify-center rounded-2xl border border-gray-200 bg-gray-50">
                  <ChanFlowerIcon className="h-7 w-7 text-gray-900" />
                </span>
                <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">{SITE_NAME}</h2>
              </div>
              <p className="mt-4 text-lg text-gray-700">{SITE_TAGLINE}</p>
              <p className="mt-3 max-w-xl text-base leading-relaxed text-gray-600">
                เครื่องมือให้ครอบครัวคิดทีละเรื่อง ตั้งแต่จำนวนวัน อาหาร พระและพิธี จนถึงงบประมาณ
                พร้อมเรื่องจริงจากชุมชนที่จัดงานศพเรียบง่ายและไม่เลี้ยงเหล้าได้สำเร็จ
              </p>
              <Link
                href="/farewell"
                className="group mt-7 inline-flex min-h-12 items-center gap-2 rounded-full bg-gray-900 px-6 text-base font-semibold text-white transition hover:bg-gray-700"
              >
                เปิดส่งด้วยใจ
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </div>

            <ul className="flex flex-col justify-center gap-2 border-t border-gray-100 bg-gray-50 p-7 sm:p-10 md:col-span-2 md:border-l md:border-t-0">
              {LINKS.map(({ href, icon: Icon, label }) => (
                <li key={href}>
                  <Link
                    href={href}
                    className="group flex items-center gap-3 rounded-2xl bg-white px-4 py-3.5 ring-1 ring-gray-200 transition hover:ring-gray-900"
                  >
                    <Icon className="h-5 w-5 text-gray-900" />
                    <span className="flex-1 text-base font-semibold text-gray-900">{label}</span>
                    <ArrowRight className="h-4 w-4 text-gray-400 transition group-hover:translate-x-0.5 group-hover:text-gray-900" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
