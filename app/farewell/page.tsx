// app/farewell/page.tsx — "ส่งด้วยใจ" ทางออกของประเด็นงานศพใน CivicSpace (สาธารณะ ไม่ต้อง login)
// หน้าตาและเครื่องมือตามแบบ stopdrinknetwork (/farewell) — แต่ข้อมูลทั้งหมดเป็นของ civicspace:
//   เครื่องมือวางแผน/ป้าย ทำงานในเครื่องผู้ใช้ (planStore) · เรื่องเล่าดึงจาก CivicSpace API ประเด็นงานศพ
//   ไม่มี "ข้อตกลงในพื้นที่"/แผนที่ตำบล เพราะเป็นฐานข้อมูลของ stopdrinknetwork
import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, ClipboardList, FileText, MapPin, Megaphone, PlayCircle, ShieldCheck, Sparkles } from 'lucide-react';
import ChanFlowerIcon from './components/ChanFlowerIcon';
import StartButton from './components/StartButton';
import { JOURNEY_PUBLIC, SITE_NAME, SITE_TAGLINE } from './content';
import { AREAS } from './journey/content';
import { getFuneralStories } from './related';
import { formatThaiDate } from '@/app/lib/homeData';
import fontStyles from './farewell.module.css';

export const revalidate = 300;

export const metadata: Metadata = {
  title: `${SITE_NAME} — วางแผนงานศพด้วยตัวเอง`,
  description:
    'เครื่องมือให้ครอบครัววางแผนงานศพทีละเรื่อง พร้อมเรื่องจริงจากพื้นที่ที่จัดงานศพเรียบง่าย ประหยัด ไม่เลี้ยงเหล้า และป้ายหน้างานพิมพ์ได้',
  alternates: { canonical: '/farewell' },
};

const TOOLS = [
  {
    href: '/farewell/plan',
    icon: ClipboardList,
    title: 'วางแผนทีละขั้น',
    text: 'ตอบทีละเรื่อง ข้ามได้ทุกข้อ แต่ละข้อมีข้อมูลประกอบการตัดสินใจ แล้วได้สรุปแผนไว้พิมพ์หรือส่งให้ญาติ',
  },
  {
    href: '/farewell/signs',
    icon: Megaphone,
    title: 'ป้ายหน้างาน',
    text: 'ป้าย “เจ้าภาพขออภัย ไม่เลี้ยงเหล้าในงาน” ใส่ชื่อผู้วายชนม์ ดาวน์โหลดไปพิมพ์ได้ทันที',
  },
];

// ตัวเลขจากกรณีศึกษางานศพ Civic Space 2569 (ชุดเดียวกับ content.ts / journey/content.ts) — ห้ามแต่งเพิ่ม
const FACTS = [
  { value: '35,000 บาท', text: 'งบทั้งงานของเจ้าภาพที่จัดงานศพแม่แบบวันเดียวเผา' },
  { value: '990,000 บาท', text: 'ค่าเหล้าที่ อ.น้ำยืน จ.อุบลราชธานี ประหยัดได้ในงานศพภายใน 1 ปี' },
  { value: '40 จาก 60', text: 'คอมเมนต์ยอดนิยมเห็นด้วยกับการจัดงานให้เรียบง่ายและประหยัด' },
];

export default async function FarewellPage() {
  const stories = await getFuneralStories(6);

  return (
    <main className={`${fontStyles.sao} bg-white pt-6 sm:pt-8 pb-8 px-4`}>
      <div className="max-w-3xl mx-auto">
        {/* เปิดหน้า */}
        <section className="pt-4 sm:pt-10">
          <span className="flex w-12 h-12 rounded-2xl bg-gray-50 border border-gray-200 items-center justify-center">
            <ChanFlowerIcon className="w-7 h-7 text-gray-900" />
          </span>
          <p className="mt-5 text-sm text-yellow-700">ทางออกของประเด็นงานศพ · CivicSpace</p>
          <h1 className="mt-1 text-3xl sm:text-4xl font-bold text-gray-900">{SITE_NAME}</h1>
          <p className="mt-2 text-lg text-gray-700">{SITE_TAGLINE}</p>
          <p className="mt-5 max-w-2xl text-base leading-relaxed text-gray-600">
            ขอแสดงความเสียใจกับการสูญเสียของคุณ ช่วงนี้มีเรื่องต้องตัดสินใจหลายเรื่องในเวลาสั้น ๆ
            เครื่องมือนี้ช่วยให้ครอบครัวคิดทีละเรื่อง เห็นข้อมูลก่อนตัดสินใจ และเลือกงานที่สมเกียรติโดยไม่ต้องเป็นหนี้
          </p>
          <div className="mt-6">
            <StartButton />
          </div>
          <p className="mt-4 inline-flex items-center gap-1.5 text-xs text-gray-500">
            <ShieldCheck className="w-4 h-4 text-gray-900" />
            ไม่ต้องสมัครสมาชิก ชื่อและตัวเลขในแผนเก็บในเครื่องนี้เท่านั้น
          </p>
        </section>

        {/* เครื่องมือ */}
        <section aria-label="เครื่องมือ" className="mt-12 grid gap-3 sm:grid-cols-2">
          {TOOLS.map(({ href, icon: Icon, title, text }) => (
            <Link
              key={href}
              href={href}
              className="flex items-start gap-3 rounded-2xl border border-gray-200 p-5 hover:border-gray-400 transition-colors"
            >
              <span className="flex w-10 h-10 shrink-0 items-center justify-center rounded-xl bg-gray-50">
                <Icon className="w-5 h-5 text-gray-900" />
              </span>
              <span>
                <span className="block text-base font-semibold text-gray-900">{title}</span>
                <span className="mt-1 block text-sm leading-relaxed text-gray-600">{text}</span>
              </span>
            </Link>
          ))}
        </section>

        {/* ข้อมูลจากพื้นที่จริง */}
        <section className="mt-14">
          <h2 className="text-xl font-bold text-gray-900">ความอาลัยไม่เคยแพง แต่ค่านิยมต่างหากที่ทำให้มันแพง</h2>
          <p className="mt-2 text-sm sm:text-base leading-relaxed text-gray-600">
            หลายครอบครัวไม่ได้อยากจัดใหญ่ แต่กลัวสายตาคน พื้นที่ที่เปลี่ยนได้สำเร็จทุกแห่งมีข้อตกลงร่วมของชุมชน
            และมีผู้นำที่เริ่มทำก่อน
          </p>
          <dl className="mt-6 grid gap-3 sm:grid-cols-3">
            {FACTS.map((f) => (
              <div key={f.value} className="flex flex-col-reverse rounded-2xl bg-gray-50 p-4">
                <dd className="mt-1 text-sm leading-relaxed text-gray-700">{f.text}</dd>
                <dt className="text-2xl font-bold text-gray-900">{f.value}</dt>
              </div>
            ))}
          </dl>
          <p className="mt-3 text-xs text-gray-500">
            ที่มา: กรณีศึกษางานศพ Civic Space 2569 · การจัดกลุ่มคอมเมนต์เป็นการตีความของทีม ไม่ใช่ตัวเลขจาก Facebook
          </p>
        </section>

        {/* ชุมชนที่ทำได้จริง */}
        <section className="mt-14">
          <h2 className="text-xl font-bold text-gray-900">ชุมชนที่ทำได้จริง</h2>
          <ul className="mt-5 divide-y divide-gray-100 border-y border-gray-100">
            {AREAS.map((area) => (
              <li key={area.place} className="py-5">
                <p className="inline-flex items-start gap-1.5 text-xs text-gray-500">
                  <MapPin className="w-3.5 h-3.5 mt-0.5 shrink-0 text-gray-900" />
                  {area.place}
                </p>
                <h3 className="mt-1 text-base font-semibold text-gray-900">{area.headline}</h3>
                <p className="mt-1 text-sm leading-relaxed text-gray-600">{area.body}</p>
              </li>
            ))}
          </ul>
        </section>

        {/* เรื่องเล่าจาก CivicSpace */}
        <section id="stories" className="mt-14 scroll-mt-6">
          <div className="flex items-end justify-between gap-4">
            <h2 className="text-xl font-bold text-gray-900">เรื่องเล่าจากพื้นที่</h2>
            <Link
              href="/issues/life-rituals?c=16"
              className="inline-flex shrink-0 items-center gap-1 min-h-10 text-sm font-medium text-gray-900 hover:text-gray-600"
            >
              ดูทั้งหมด <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          {stories.length > 0 ? (
            <ul className="mt-5 grid grid-cols-2 sm:grid-cols-3 gap-4">
              {stories.map((item) => {
                const Icon = item.kind === 'video' ? PlayCircle : FileText;
                return (
                  <li key={item.id}>
                    <Link href={item.href} className="group block">
                      <div className="relative aspect-[4/5] overflow-hidden rounded-xl bg-gray-100">
                        {item.image && (
                          <Image
                            src={item.image}
                            alt=""
                            fill
                            sizes="(max-width: 640px) 50vw, 240px"
                            className="object-cover transition-transform duration-500 group-hover:scale-105"
                          />
                        )}
                        <span className="absolute left-2 top-2 inline-flex items-center gap-1 rounded-full bg-black/50 px-2 py-0.5 text-[11px] text-white backdrop-blur-sm">
                          <Icon className="w-3 h-3" />
                          {item.kind === 'video' ? 'วิดีโอ' : 'บทความ'}
                        </span>
                      </div>
                      <h3 className="mt-2 text-sm leading-[1.6] text-gray-900 line-clamp-2 group-hover:text-gray-600">{item.title}</h3>
                      <p className="mt-0.5 text-xs text-gray-500">{formatThaiDate(item.date)}</p>
                    </Link>
                  </li>
                );
              })}
            </ul>
          ) : (
            <p className="mt-4 text-sm text-gray-500">
              ยังโหลดเรื่องเล่าไม่ได้ในตอนนี้ ดูได้ที่{' '}
              <Link href="/issues/life-rituals" className="underline">
                ประเด็นพิธีกรรมชีวิต
              </Link>
            </p>
          )}
        </section>

        {/* สื่อรณรงค์ — แยกจากเครื่องมือของครอบครัว: ภาพหีบเข้าเตาเผาอาจกระทบใจคนที่เพิ่งสูญเสีย */}
        {JOURNEY_PUBLIC && (
          <section className="mt-14 border-t border-gray-100 pt-8">
            <Link
              href="/farewell/journey"
              className="group flex items-center gap-4 rounded-2xl bg-gray-900 p-5 sm:p-6 text-white transition hover:bg-gray-800"
            >
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white/10">
                <Sparkles className="w-5 h-5 text-yellow-300" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-xs text-gray-400">สื่อรณรงค์สำหรับคนทั่วไป · ภาพ 3D</span>
                <span className="mt-0.5 block text-base sm:text-lg font-semibold">เส้นทางสุดท้าย</span>
                <span className="mt-0.5 block text-sm text-gray-300">เดินไปส่งหีบหนึ่งใบตั้งแต่ปิดฝาจนเข้าเตา พร้อมบทเรียนงานศพที่เรียบง่าย</span>
              </span>
              <ArrowRight className="w-5 h-5 shrink-0 transition-transform group-hover:translate-x-1" />
            </Link>
          </section>
        )}
      </div>
    </main>
  );
}
