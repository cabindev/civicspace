// app/components/home/LifeJourney.tsx — "เส้นทางชีวิต": 3 ประเด็นตามช่วงชีวิต (ISSUE_GROUPS)
// ภาพปะติดบนการ์ดคือรูปปกวิดีโอจริงของประเด็นนั้น — ไม่มีรูปประกอบปลอม
import Link from 'next/link';
import Image from 'next/image';
import { ArrowUpRight } from 'lucide-react';
import { ISSUE_GROUPS } from '@/app/lib/issues';
import { getCategories, getCategoryVideos, type Video } from '@/app/lib/homeData';
import { Reveal } from './Motion';

const COLLAGE_SIZE = 4;

function SectionHeader() {
  return (
    <div className="max-w-2xl mx-auto text-center mb-10 sm:mb-14">
      <p className="text-xs sm:text-sm font-semibold tracking-wide text-yellow-700">เส้นทางชีวิต</p>
      <h2 className="mt-2 text-2xl sm:text-4xl font-bold text-gray-900">เหล้าอยู่ตรงไหนในชีวิตคนหนึ่งคน</h2>
      <p className="mt-3 text-sm sm:text-base text-gray-600">
        เลือกช่วงชีวิต แล้วดูว่าแต่ละพื้นที่หาทางออกกันอย่างไร
      </p>
    </div>
  );
}

export function LifeJourneySkeleton() {
  return (
    <section className="bg-[#fffbeb] py-16 sm:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeader />
        <div className="grid gap-6 md:grid-cols-3">
          {ISSUE_GROUPS.map((g) => (
            <div key={g.key} className="h-[26rem] rounded-3xl bg-yellow-100/70 animate-pulse" />
          ))}
        </div>
      </div>
    </section>
  );
}

export default async function LifeJourney() {
  const categories = await getCategories();

  const groups = await Promise.all(
    ISSUE_GROUPS.map(async (group) => {
      const cats = group.categoryIds
        .map((id) => categories.find((c) => c.id === id))
        .filter((c): c is NonNullable<typeof c> => Boolean(c));
      // เอารูปปกจากทุกประเด็นย่อยมาสลับกัน เพื่อให้ภาพปะติดมีหลายพื้นที่ ไม่ใช่ที่เดียว
      const lists = await Promise.all(cats.map((c) => (c.slug ? getCategoryVideos(c.slug) : Promise.resolve([] as Video[]))));
      const thumbs: Video[] = [];
      for (let i = 0; thumbs.length < COLLAGE_SIZE && lists.some((l) => i < l.length); i++) {
        for (const list of lists) {
          const v = list[i];
          if (v?.thumbnail_url && thumbs.length < COLLAGE_SIZE) thumbs.push(v);
        }
      }
      return {
        group,
        total: cats.reduce((sum, c) => sum + (c.total_count || 0), 0),
        places: cats.map((c) => c.name),
        thumbs,
      };
    }),
  );

  return (
    <section className="relative bg-[#fffbeb] py-16 sm:py-24 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Reveal>
          <SectionHeader />
        </Reveal>

        <div className="relative">
          {/* เส้นเวลาเชื่อม 3 ช่วง (จอใหญ่) */}
          <div
            aria-hidden
            className="hidden md:block absolute left-[16%] right-[16%] top-7 h-px bg-[repeating-linear-gradient(90deg,#f59e0b_0_8px,transparent_8px_16px)]"
          />

          <ol className="relative grid gap-8 md:gap-6 md:grid-cols-3">
            {groups.map(({ group, total, places, thumbs }, index) => (
              <li key={group.key}>
                <Reveal delay={index * 0.12}>
                  <div className="flex justify-center mb-4">
                    <span className="relative z-10 flex h-14 w-14 items-center justify-center rounded-full bg-stone-950 text-xl font-bold text-yellow-400 ring-8 ring-[#fffbeb]">
                      {index + 1}
                    </span>
                  </div>

                  <Link
                    href={`/issues/${group.key}`}
                    className="group relative block h-[26rem] overflow-hidden rounded-3xl bg-stone-900 shadow-lg shadow-yellow-900/10 ring-1 ring-black/5 transition duration-500 hover:-translate-y-1.5 hover:shadow-2xl hover:shadow-yellow-700/25 focus-visible:outline focus-visible:outline-4 focus-visible:outline-yellow-400"
                  >
                    {/* ภาพปะติด 2×2 */}
                    <div className="absolute inset-0 grid grid-cols-2 grid-rows-2 gap-0.5 transition-transform duration-[1200ms] ease-out group-hover:scale-110">
                      {thumbs.map((v) => (
                        <div key={v.id} className="relative">
                          <Image
                            src={v.thumbnail_url}
                            alt=""
                            fill
                            sizes="(max-width: 768px) 50vw, 200px"
                            className="object-cover"
                          />
                        </div>
                      ))}
                    </div>
                    {/* ส่วนล่างต้องทึบพอ — รูปปกหลายรูปมีตัวหนังสือในภาพ จะทะลุมาทับชื่อเรื่อง */}
                    <div className="absolute inset-0 bg-gradient-to-t from-stone-950 from-40% via-stone-950/85 via-60% to-stone-950/5" />

                    <div className="absolute inset-x-0 bottom-0 p-6">
                      <p className="text-xs font-semibold text-yellow-400">{group.stage}</p>
                      <h3 className="mt-1 text-xl sm:text-2xl font-bold leading-snug text-white">{group.title}</h3>
                      <p className="mt-3 text-sm leading-relaxed text-stone-200">“{group.quote}”</p>

                      <div className="mt-4 flex flex-wrap gap-1.5">
                        {places.map((name) => (
                          <span key={name} className="rounded-full bg-white/10 px-2.5 py-0.5 text-[11px] text-stone-200 backdrop-blur-sm">
                            {name}
                          </span>
                        ))}
                      </div>

                      <div className="mt-5 flex items-center justify-between border-t border-white/10 pt-4">
                        {total > 0 && (
                          <span className="text-sm text-stone-300">
                            <span className="font-semibold text-white">{total.toLocaleString('th-TH')}</span> เรื่องจากพื้นที่
                          </span>
                        )}
                        <span className="ml-auto flex h-9 w-9 items-center justify-center rounded-full bg-yellow-400 text-stone-950 transition group-hover:rotate-45">
                          <ArrowUpRight className="h-4 w-4" />
                        </span>
                      </div>
                    </div>
                  </Link>
                </Reveal>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
