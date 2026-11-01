// app/farewell/journey/page.tsx — เส้นทางสุดท้าย: 3D เลื่อนตาม (หีบปิดฝา → หันเข้าเมรุ → เข้าเตา → ปิดเตา)
// หน้าตาตามต้นฉบับ stopdrinknetwork /farewell/journey (หัวข้อแบบโปสเตอร์ ฟอนต์เสาชิงช้า ฉากจบกลางจอ)
// ต่างจากต้นฉบับ: "คุณไม่ได้เริ่มคนเดียว" ใช้กรณีศึกษา 4 พื้นที่ของ civicspace แทนแผนที่ข้อตกลง (ข้อมูลของ stopdrinknetwork)
// Navbar ของ civicspace ไม่ลอย — JourneyScroll ใช้ -mt-16 ดึงภาพขึ้นไปซ้อนใต้ Navbar (ดู layout.tsx)
// เดิมอยู่ที่ /last-journey (redirect ใน next.config.mjs) · แบบละเอียดดู docs/last-journey/BRIEF.md
import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, BookOpen, ClipboardList, MapPin, Megaphone } from 'lucide-react';
import ChanFlowerIcon from '../components/ChanFlowerIcon';
import JourneyScroll from './components/JourneyScroll';
import { AREAS } from './content';
import fontStyles from '../farewell.module.css';

export const metadata: Metadata = {
  title: 'เส้นทางสุดท้าย — ส่งด้วยใจ',
  description: 'เดินไปส่งหีบศพหนึ่งใบตั้งแต่ปิดฝาจนเข้าเตา พร้อมบทเรียนงานศพที่เรียบง่าย ประหยัด ไม่เลี้ยงเหล้า',
  alternates: { canonical: '/farewell/journey' },
};

const NEXT = [
  { href: '/farewell/plan', icon: ClipboardList, title: 'วางแผนงานศพทีละขั้น', text: 'จำนวนวัน อาหาร พระและพิธี จนถึงงบประมาณ' },
  { href: '/farewell/signs', icon: Megaphone, title: 'ป้ายหน้างาน', text: 'ป้าย “ไม่เลี้ยงเหล้า” ดาวน์โหลดไปพิมพ์ได้' },
  { href: '/issues/life-rituals?c=16', icon: BookOpen, title: 'เรื่องเล่าจากพื้นที่', text: 'บทความและวิดีโองานศพจาก CivicSpace' },
  { href: '/farewell', icon: ChanFlowerIcon, title: 'ส่งด้วยใจ', text: 'เครื่องมือและข้อมูลทั้งหมดสำหรับครอบครัว' },
];

export default function JourneyPage() {
  return (
    <main className={`${fontStyles.sao} bg-white`}>
      <JourneyScroll />

      {/* ต่อจากฉากสุดท้าย — ให้เห็นว่ามีชุมชนทำจริง ไม่ใช่แค่ข้อความรณรงค์ */}
      <section className="px-4 pt-14 sm:pt-20">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold text-gray-900">คุณไม่ได้เริ่มคนเดียว</h2>
          <p className="mt-2 text-sm sm:text-base leading-relaxed text-gray-600">
            ทุกพื้นที่ที่ทำสำเร็จมีข้อตกลงร่วมของชุมชน และมีผู้นำที่เริ่มทำก่อน
          </p>
          <ul className="mt-6 grid gap-3 sm:grid-cols-2">
            {AREAS.map((area) => (
              <li key={area.place} className="rounded-2xl border border-gray-200 bg-gray-50/60 p-5">
                <p className="inline-flex items-start gap-1.5 text-xs text-gray-500">
                  <MapPin className="w-3.5 h-3.5 mt-0.5 shrink-0 text-gray-900" />
                  {area.place}
                </p>
                <h3 className="mt-2 text-base font-semibold text-gray-900">{area.headline}</h3>
                <p className="mt-1 text-sm leading-relaxed text-gray-600">{area.body}</p>
              </li>
            ))}
          </ul>
          <p className="mt-3 text-xs text-gray-500">ที่มา: กรณีศึกษางานศพ Civic Space 2569</p>
        </div>
      </section>

      <section id="learn" className="scroll-mt-16 px-4 py-14 sm:py-20">
        <div className="max-w-3xl mx-auto">
          <p className="text-xs font-medium text-gray-900">ส่งด้วยใจ</p>
          <h2 className="mt-1 text-2xl font-bold text-gray-900">ครอบครัวเลือกเองได้</h2>
          <p className="mt-2 text-sm sm:text-base leading-relaxed text-gray-600">
            การเปลี่ยนค่านิยมงานศพไม่ใช่การลดความอาลัย แต่คือการคืนความหมายของงานบุญ เริ่มจากเรื่องที่ครอบครัวตัดสินใจได้เอง
          </p>
          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            {NEXT.map(({ href, icon: Icon, title, text }) => (
              <Link
                key={href}
                href={href}
                className="group flex items-start gap-3 rounded-2xl border border-gray-200 p-4 hover:border-gray-400 transition-colors"
              >
                <span className="flex w-10 h-10 shrink-0 items-center justify-center rounded-xl bg-gray-50">
                  <Icon className="w-5 h-5 text-gray-900" />
                </span>
                <span className="flex-1">
                  <span className="flex items-center gap-1 text-base font-semibold text-gray-900">
                    {title}
                    <ArrowRight className="w-4 h-4 text-gray-900 opacity-0 transition-opacity group-hover:opacity-100" />
                  </span>
                  <span className="mt-0.5 block text-sm text-gray-600">{text}</span>
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
