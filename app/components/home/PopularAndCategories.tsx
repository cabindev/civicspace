// app/components/home/PopularAndCategories.tsx — "คนอ่านมากที่สุด" + "ทุกพื้นที่" + แถบปิดท้าย
import Link from 'next/link';
import { ArrowRight, ArrowUpRight } from 'lucide-react';
import { formatThaiDate, getCategories, getPopularPosts } from '@/app/lib/homeData';
import { Reveal } from './Motion';

function ClosingCta() {
  return (
    <Reveal>
      <div className="relative isolate mt-16 sm:mt-24 overflow-hidden rounded-[2rem] bg-yellow-400 px-6 py-12 sm:px-12 sm:py-16 text-center">
        {/* วงกลมตกแต่ง */}
        <div aria-hidden className="pointer-events-none absolute -z-10 inset-0">
          <div className="absolute -left-16 -top-16 h-64 w-64 rounded-full border-[2.5rem] border-yellow-300/70" />
          <div className="absolute -bottom-24 -right-10 h-72 w-72 rounded-full bg-amber-500/30 blur-2xl" />
        </div>
        <h2 className="text-2xl sm:text-4xl font-bold leading-[1.35] text-stone-950">
          ชุมชนของคุณ
          <br className="sm:hidden" /> ก็เป็นทางออกได้
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-sm sm:text-base text-stone-800">
          ดูว่าพื้นที่อื่นเริ่มจากอะไร แล้วหยิบไปปรับใช้กับงานบุญ ประเพณี หรือเด็ก ๆ ในบ้านคุณ
        </p>
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href="/issues"
            className="group inline-flex items-center gap-2 rounded-full bg-stone-950 px-6 py-3 text-sm sm:text-base font-semibold text-white shadow-lg transition hover:bg-stone-800"
          >
            เริ่มจากประเด็นที่ใกล้ตัว
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
          <Link
            href="/video"
            className="inline-flex items-center gap-2 rounded-full border border-stone-950/20 px-6 py-3 text-sm sm:text-base font-medium text-stone-950 transition hover:bg-stone-950/5"
          >
            ดูวิดีโอทั้งหมด
          </Link>
        </div>
      </div>
    </Reveal>
  );
}

export default async function PopularAndCategories() {
  const [popularPosts, categories] = await Promise.all([getPopularPosts(5), getCategories()]);

  // แสดงเฉพาะพื้นที่ที่มีเนื้อหา เรียงจากมากไปน้อย
  const places = categories
    .filter((c) => (c.total_count || 0) > 0)
    .sort((a, b) => (b.total_count || 0) - (a.total_count || 0));

  return (
    <section className="bg-white py-16 sm:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid gap-14 lg:grid-cols-5 lg:gap-16">
          {/* คนอ่านมากที่สุด */}
          {popularPosts.length > 0 && (
            <div className="lg:col-span-2">
              <Reveal>
                <p className="text-xs sm:text-sm font-semibold tracking-wide text-yellow-700">คนอ่านมากที่สุด</p>
                <h2 className="mt-2 text-2xl sm:text-3xl font-bold text-gray-900">บทความยอดนิยม</h2>
              </Reveal>
              <ol className="mt-8 divide-y divide-stone-200">
                {popularPosts.map((post, index) => (
                  <li key={post.id}>
                    <Link href={`/post/${post.slug}`} className="group flex items-start gap-5 py-4">
                      <span
                        aria-hidden
                        className="w-12 shrink-0 text-4xl font-bold leading-none tabular-nums text-transparent [-webkit-text-stroke:1.5px_#a8a29e] transition-colors group-hover:[-webkit-text-stroke-color:#f59e0b]"
                      >
                        {String(index + 1).padStart(2, '0')}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block text-sm sm:text-base font-semibold leading-[1.6] text-gray-900 line-clamp-2 transition-colors group-hover:text-yellow-700">
                          {post.title}
                        </span>
                        <span className="mt-1 block text-xs text-gray-500">
                          อ่าน {post.view_count.toLocaleString('th-TH')} ครั้ง · {formatThaiDate(post.created_at)}
                        </span>
                      </span>
                    </Link>
                  </li>
                ))}
              </ol>
            </div>
          )}

          {/* ทุกพื้นที่ */}
          {places.length > 0 && (
            <div className={popularPosts.length > 0 ? 'lg:col-span-3' : 'lg:col-span-5'}>
              <Reveal>
                <p className="text-xs sm:text-sm font-semibold tracking-wide text-yellow-700">ทุกพื้นที่</p>
                <h2 className="mt-2 text-2xl sm:text-3xl font-bold text-gray-900">สำรวจตามประเด็น</h2>
              </Reveal>
              <ul className="mt-8 grid gap-3 sm:grid-cols-2">
                {places.map((c, i) => (
                  <li key={c.id}>
                    <Reveal delay={Math.min(i, 8) * 0.04} className="h-full">
                      <Link
                        href={`/categories/${encodeURIComponent(c.slug)}`}
                        className="group flex h-full items-center justify-between gap-3 rounded-2xl border border-stone-200 bg-stone-50/60 px-4 py-3.5 transition hover:border-yellow-400 hover:bg-yellow-50"
                      >
                        <span className="min-w-0">
                          <span className="block truncate text-sm font-semibold text-gray-900">{c.name}</span>
                          <span className="mt-0.5 block text-xs text-gray-500">
                            {[
                              c.post_count > 0 && `${c.post_count} บทความ`,
                              c.video_count > 0 && `${c.video_count} วิดีโอ`,
                              c.survey_count > 0 && `${c.survey_count} แบบสำรวจ`,
                            ]
                              .filter(Boolean)
                              .join(' · ')}
                          </span>
                        </span>
                        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white text-stone-500 ring-1 ring-stone-200 transition group-hover:bg-yellow-400 group-hover:text-stone-950 group-hover:ring-yellow-400">
                          <ArrowUpRight className="h-4 w-4" />
                        </span>
                      </Link>
                    </Reveal>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <ClosingCta />
      </div>
    </section>
  );
}
