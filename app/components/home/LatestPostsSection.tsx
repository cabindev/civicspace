// app/components/home/LatestPostsSection.tsx — "เรื่องเล่าจากพื้นที่": เลย์เอาต์แบบนิตยสาร
// เรื่องเด่น 1 + เรื่องรอง 4 (bento) แล้วตามด้วยรายการอ่านต่อ 6 เรื่อง
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, Clock, Eye } from 'lucide-react';
import { formatThaiDate, getLatestPosts, type Post } from '@/app/lib/homeData';
import { Reveal } from './Motion';

const BENTO = 5; // เรื่องเด่น + 4
const MORE = 6;

function SectionHeader() {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between mb-10 sm:mb-12">
      <div className="max-w-2xl">
        <p className="text-xs sm:text-sm font-semibold tracking-wide text-yellow-700">เรื่องเล่าจากพื้นที่</p>
        <h2 className="mt-2 text-2xl sm:text-4xl font-bold text-gray-900">บทความล่าสุด</h2>
        <p className="mt-3 text-sm sm:text-base text-gray-600">
          บันทึกจากคนทำงานในชุมชน — ทำอะไร เจออะไร และเปลี่ยนอะไรได้บ้าง
        </p>
      </div>
      <Link
        href="/post"
        className="group inline-flex shrink-0 items-center gap-2 self-start rounded-full border border-stone-300 px-5 py-2.5 text-sm font-medium text-stone-800 transition hover:border-stone-900 hover:bg-stone-900 hover:text-white sm:self-auto"
      >
        ดูบทความทั้งหมด
        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
      </Link>
    </div>
  );
}

function Meta({ post, light = false }: { post: Post; light?: boolean }) {
  const tone = light ? 'text-white/75' : 'text-gray-500';
  return (
    <div className={`flex flex-wrap items-center gap-x-3 gap-y-1 text-xs ${tone}`}>
      <span>{formatThaiDate(post.created_at)}</span>
      {post.reading_time > 0 && (
        <span className="inline-flex items-center gap-1">
          <Clock className="h-3 w-3" />
          {post.reading_time} นาที
        </span>
      )}
      {post.view_count > 0 && (
        <span className="inline-flex items-center gap-1">
          <Eye className="h-3 w-3" />
          {post.view_count.toLocaleString('th-TH')}
        </span>
      )}
    </div>
  );
}

function CategoryChip({ post, light = false }: { post: Post; light?: boolean }) {
  if (!post.category) return null;
  return (
    <span
      className={
        light
          ? 'inline-block max-w-full truncate rounded-full bg-yellow-400 px-2.5 py-0.5 text-[11px] font-semibold text-stone-950'
          : 'inline-block max-w-full truncate rounded-full bg-yellow-100 px-2.5 py-0.5 text-[11px] font-semibold text-yellow-800'
      }
    >
      {post.category.name}
    </span>
  );
}

/** การ์ดภาพเต็ม ตัวหนังสือทับภาพ — ใช้ทั้งเรื่องเด่นและเรื่องรอง */
function OverlayCard({ post, featured = false }: { post: Post; featured?: boolean }) {
  return (
    <Link
      href={`/post/${post.slug}`}
      className={`group relative block h-full overflow-hidden rounded-3xl bg-stone-900 shadow-sm ring-1 ring-black/5 transition duration-500 hover:shadow-xl focus-visible:outline focus-visible:outline-4 focus-visible:outline-yellow-400 ${
        featured ? 'min-h-[22rem] sm:min-h-[28rem]' : 'min-h-[15rem]'
      }`}
    >
      {post.featured_image_url && (
        <Image
          src={post.featured_image_url}
          alt=""
          fill
          sizes={featured ? '(max-width: 1024px) 100vw, 640px' : '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 320px'}
          className="object-cover transition-transform duration-[1200ms] ease-out group-hover:scale-105"
        />
      )}
      {/* ภาพปกบางรูปมีตัวหนังสืออยู่ในภาพ — ส่วนล่างต้องทึบพอให้อ่านชื่อเรื่องได้ */}
      <div className="absolute inset-0 bg-gradient-to-t from-stone-950 from-25% via-stone-950/60 via-55% to-transparent" />

      <div className={`absolute inset-x-0 bottom-0 ${featured ? 'p-6 sm:p-8' : 'p-5'}`}>
        <CategoryChip post={post} light />
        <h3
          className={`mt-3 font-bold text-white leading-[1.5] transition-colors group-hover:text-yellow-300 ${
            featured ? 'text-xl sm:text-3xl line-clamp-3' : 'text-sm sm:text-base line-clamp-2'
          }`}
        >
          {post.title}
        </h3>
        {featured && post.excerpt && (
          <p className="mt-3 hidden sm:block text-sm leading-relaxed text-stone-300 line-clamp-2 max-w-xl">{post.excerpt}</p>
        )}
        <div className="mt-3">
          <Meta post={post} light />
        </div>
      </div>
    </Link>
  );
}

/** รายการอ่านต่อ: ภาพเล็กซ้าย ตัวหนังสือขวา */
function RowCard({ post }: { post: Post }) {
  return (
    <Link
      href={`/post/${post.slug}`}
      className="group flex gap-4 rounded-2xl p-2 -m-2 transition hover:bg-yellow-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-yellow-500"
    >
      <div className="relative h-24 w-28 sm:w-32 shrink-0 overflow-hidden rounded-xl bg-stone-100">
        {post.featured_image_url && (
          <Image
            src={post.featured_image_url}
            alt=""
            fill
            sizes="128px"
            className="object-cover transition-transform duration-700 group-hover:scale-110"
          />
        )}
      </div>
      <div className="min-w-0 flex-1 py-0.5">
        <CategoryChip post={post} />
        <h3 className="mt-1.5 text-sm font-semibold leading-[1.6] text-gray-900 line-clamp-2 transition-colors group-hover:text-yellow-700">
          {post.title}
        </h3>
        <div className="mt-1">
          <Meta post={post} />
        </div>
      </div>
    </Link>
  );
}

export function LatestPostsSkeleton() {
  return (
    <section className="bg-white py-16 sm:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeader />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:grid-rows-2">
          <div className="min-h-[22rem] sm:col-span-2 lg:row-span-2 rounded-3xl bg-stone-100 animate-pulse" />
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="min-h-[15rem] rounded-3xl bg-stone-100 animate-pulse" />
          ))}
        </div>
      </div>
    </section>
  );
}

export default async function LatestPostsSection() {
  const posts = await getLatestPosts(BENTO + MORE);
  if (posts.length === 0) return null;

  // เรื่องเด่นควรมีภาพ — เลือกเรื่องแรกที่มีภาพ ที่เหลือเรียงตามเดิม
  const featuredIndex = Math.max(0, posts.findIndex((p) => p.featured_image_url));
  const featured = posts[featuredIndex];
  const rest = posts.filter((_, i) => i !== featuredIndex);
  const side = rest.slice(0, BENTO - 1);
  const more = rest.slice(BENTO - 1);

  return (
    <section className="bg-white py-16 sm:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Reveal>
          <SectionHeader />
        </Reveal>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:grid-rows-2">
          <Reveal className="sm:col-span-2 lg:row-span-2">
            <OverlayCard post={featured} featured />
          </Reveal>
          {side.map((post, i) => (
            <Reveal key={post.id} delay={0.06 * (i + 1)}>
              <OverlayCard post={post} />
            </Reveal>
          ))}
        </div>

        {more.length > 0 && (
          <div className="mt-12 sm:mt-16 border-t border-stone-200 pt-10">
            <p className="mb-6 text-sm font-semibold text-gray-900">อ่านต่อ</p>
            <ul className="grid gap-x-8 gap-y-6 sm:grid-cols-2 lg:grid-cols-3">
              {more.map((post) => (
                <li key={post.id}>
                  <RowCard post={post} />
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </section>
  );
}
