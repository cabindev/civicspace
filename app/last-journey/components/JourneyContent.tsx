// app/last-journey/components/JourneyContent.tsx
// เนื้อหาเรียนรู้ด้านล่างภาพ 3D (เลื่อนอ่านตามปกติ)
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, MapPin, PlayCircle, FileText } from 'lucide-react';
import { formatThaiDate, getCategories, getCategoryPosts, getCategoryVideos } from '@/app/lib/homeData';
import { AREAS, COST_ITEMS, FUNERAL_CATEGORY_ID, HOST_TOOLS, START_STEPS, VOICES } from '../content';

const RELATED_LIMIT = 4;

async function getRelated() {
  const category = (await getCategories()).find((c) => c.id === FUNERAL_CATEGORY_ID);
  if (!category?.slug) return [];
  const [posts, videos] = await Promise.all([getCategoryPosts(category.slug), getCategoryVideos(category.slug)]);
  return [
    ...videos.map((v) => ({
      kind: 'video' as const,
      id: `v${v.id}`,
      title: v.title,
      href: `/video/${v.slug}`,
      image: v.thumbnail_url,
      date: (v as { published_at?: string }).published_at || v.created_at,
    })),
    ...posts.map((p) => ({
      kind: 'post' as const,
      id: `p${p.id}`,
      title: p.title,
      href: `/post/${p.slug}`,
      image: p.featured_image_url,
      date: (p as { published_at?: string }).published_at || p.created_at,
    })),
  ]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, RELATED_LIMIT);
}

function SectionTitle({ eyebrow, title }: { eyebrow: string; title: string }) {
  return (
    <div className="mb-5 sm:mb-6">
      <p className="text-xs font-medium text-yellow-700 mb-1">{eyebrow}</p>
      <h2 className="text-xl sm:text-2xl font-bold text-gray-900">{title}</h2>
    </div>
  );
}

export default async function JourneyContent() {
  const related = await getRelated();

  return (
    <div id="learn" className="bg-white scroll-mt-4">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 space-y-14 sm:space-y-20">
        {/* 1. ค่าใช้จ่าย */}
        <section>
          <SectionTitle eyebrow="บทเรียนที่ 1" title="ค่าใช้จ่ายงานศพมาจากไหน" />
          <p className="text-sm sm:text-base text-gray-700 leading-relaxed max-w-3xl mb-5">
            หลายครอบครัวไม่ได้อยากจัดใหญ่ แต่ “จำเป็นต้องจัด” เพราะกลัวสายตาคน กลัวคำว่าไม่สมเกียรติ
            สุดท้ายความสูญเสียครั้งเดียวกลายเป็นหนี้ที่คนอยู่ต้องแบกต่ออีกหลายปี
          </p>
          <ul className="flex flex-wrap gap-2">
            {COST_ITEMS.map((item) => (
              <li
                key={item.label}
                className={`px-3 py-1.5 rounded-full text-sm border ${
                  item.cuttable
                    ? 'border-yellow-500 bg-yellow-50 text-gray-900 font-medium'
                    : 'border-gray-200 text-gray-700'
                }`}
              >
                {item.label}
                {item.cuttable && <span className="ml-1 text-yellow-800">· ตัดได้ทันที</span>}
              </li>
            ))}
          </ul>
          <p className="text-xs text-gray-500 mt-4 max-w-3xl">
            เหล้าเพิ่มทั้งค่าใช้จ่าย เหตุทะเลาะวิวาท และความเสี่ยงอุบัติเหตุของแขกที่ขับรถกลับบ้าน
          </p>
        </section>

        {/* 2. พื้นที่ต้นแบบ */}
        <section>
          <SectionTitle eyebrow="บทเรียนที่ 2" title="4 พื้นที่ที่ทำได้จริง" />
          <div className="grid gap-4 sm:grid-cols-2">
            {AREAS.map((area) => (
              <article key={area.place} className="rounded-xl border border-gray-200 p-5 hover:border-yellow-300 transition-colors">
                <p className="inline-flex items-start gap-1.5 text-xs text-gray-500 mb-2">
                  <MapPin className="w-3.5 h-3.5 mt-0.5 shrink-0 text-yellow-600" />
                  {area.place}
                </p>
                <h3 className="text-base font-semibold text-gray-900 mb-2">{area.headline}</h3>
                <p className="text-sm text-gray-700 leading-relaxed">{area.body}</p>
              </article>
            ))}
          </div>
        </section>

        {/* 3. เครื่องมือ */}
        <section>
          <SectionTitle eyebrow="บทเรียนที่ 3" title="เครื่องมือสำหรับเจ้าภาพ" />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {HOST_TOOLS.map((tool) => (
              <div key={tool.title} className="rounded-xl bg-yellow-50/70 border border-yellow-100 p-5">
                <h3 className="text-sm font-semibold text-gray-900 mb-2">{tool.title}</h3>
                <ul className="space-y-1.5">
                  {tool.items.map((item) => (
                    <li key={item} className="text-sm text-gray-700 leading-relaxed">
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>

        {/* 4. เสียงผู้ชม */}
        <section>
          <SectionTitle eyebrow="บทเรียนที่ 4" title="คนพร้อมเปลี่ยนมากกว่าที่คิด" />
          <div className="grid gap-6 md:grid-cols-[auto,1fr] md:items-center">
            <div className="flex items-baseline gap-2">
              <span className="text-5xl sm:text-6xl font-bold text-gray-900">{VOICES.agree}</span>
              <span className="text-lg text-gray-500">จาก {VOICES.sample}</span>
            </div>
            <div className="space-y-3 text-sm sm:text-base text-gray-700 leading-relaxed">
              <p>
                คอมเมนต์ยอดนิยมเห็นด้วยกับการจัดงานให้เรียบง่ายและประหยัด และในนั้น {VOICES.didIt} คนเล่าว่าทำมาแล้วเอง
                หรือสั่งลูกหลานไว้แล้ว
              </p>
              <p>{VOICES.hostNotTradition}</p>
              <p className="text-xs text-gray-500">{VOICES.note}</p>
            </div>
          </div>
        </section>

        {/* 5. เริ่มในพื้นที่ */}
        <section>
          <SectionTitle eyebrow="ถ้าจะเริ่มในพื้นที่ของคุณ" title="เริ่มได้ 4 ขั้น" />
          <ol className="grid gap-3 sm:grid-cols-2">
            {START_STEPS.map((step, index) => (
              <li key={step} className="flex gap-3 rounded-xl border border-gray-200 p-4">
                <span className="w-7 h-7 shrink-0 rounded-full bg-gray-900 text-white text-sm flex items-center justify-center">
                  {index + 1}
                </span>
                <span className="text-sm text-gray-700 leading-relaxed pt-0.5">{step}</span>
              </li>
            ))}
          </ol>
          <p className="mt-6 text-sm sm:text-base text-gray-800 leading-relaxed max-w-3xl">
            การเปลี่ยนค่านิยมงานศพไม่ใช่การลดความอาลัย แต่คือการคืนความหมายของงานบุญ
            สิ่งที่ต้องทำต่อคือทำให้เสียงส่วนใหญ่ที่เห็นด้วยอยู่แล้ว กลายเป็นข้อตกลงของชุมชน
          </p>
        </section>

        {/* 6. อ่านต่อ */}
        <section>
          <div className="flex items-end justify-between gap-4 mb-5">
            <SectionTitle eyebrow="อ่านต่อ" title="เรื่องเล่างานศพจาก CivicSpace" />
            <Link
              href="/issues/life-rituals"
              className="shrink-0 inline-flex items-center gap-1 text-sm text-gray-700 hover:text-gray-900 mb-6"
            >
              ดูทั้งประเด็น
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          {related.length > 0 ? (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {related.map((item) => {
                const Icon = item.kind === 'video' ? PlayCircle : FileText;
                return (
                  <Link key={item.id} href={item.href} className="group block">
                    <div className="relative aspect-[4/5] rounded-lg overflow-hidden bg-yellow-50 mb-2">
                      {item.image ? (
                        <Image
                          src={item.image}
                          alt={item.title}
                          fill
                          sizes="(max-width: 1024px) 50vw, 240px"
                          className="object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      ) : null}
                      <span className="absolute top-2 left-2 inline-flex items-center gap-1 text-[11px] text-white bg-black/40 backdrop-blur-sm px-2 py-0.5 rounded-full">
                        <Icon className="w-3 h-3" />
                        {item.kind === 'video' ? 'วิดีโอ' : 'โพสต์'}
                      </span>
                    </div>
                    <h3 className="text-xs sm:text-sm text-gray-900 line-clamp-2 leading-snug group-hover:text-yellow-700 transition-colors">
                      {item.title}
                    </h3>
                    <p className="text-[11px] text-gray-500 mt-1">{formatThaiDate(item.date)}</p>
                  </Link>
                );
              })}
            </div>
          ) : (
            <p className="text-sm text-gray-500">
              ยังโหลดเรื่องเล่าไม่ได้ในตอนนี้ ดูทั้งหมดได้ที่{' '}
              <Link href="/issues/life-rituals" className="underline">
                ประเด็นพิธีกรรมชีวิต
              </Link>
            </p>
          )}
        </section>

        <p className="text-xs text-gray-400 border-t border-gray-100 pt-6">
          แหล่งข้อมูล: เพจ CivicSpace (เนื้อหางานศพ 26 ชิ้น 9 ก.พ.–24 ส.ค. 2569), เด็ค “จักรวาลงานศพ” ทีม Civic Space,
          The Active, เพจภาคีในพื้นที่ (ผลการดำเนินงานอำเภอน้ำยืน)
        </p>
      </div>
    </div>
  );
}
