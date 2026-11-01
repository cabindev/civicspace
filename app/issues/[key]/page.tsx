// app/issues/[key]/page.tsx
// หน้ากลุ่มประเด็น: แสดงทุกประเด็นในกลุ่มเรียงตามลำดับการเล่า พร้อมประโยคเชื่อมระหว่างเรื่อง
// เลือกประเด็นเดียวด้วย ?c=<category id> เพื่อดูเนื้อหาทั้งหมดของประเด็นนั้น
import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { ArrowRight, PlayCircle, FileText } from 'lucide-react';
import Navbar from '../../components/Navbar';
import { Footer } from '../../components/Footer';
import {
  formatThaiDate,
  getCategories,
  getCategoryPosts,
  getCategoryVideos,
  type Category,
} from '@/app/lib/homeData';
import { ISSUE_GROUPS, getIssueGroup } from '@/app/lib/issues';
import ChanFlowerIcon from '@/app/farewell/components/ChanFlowerIcon';
import { FUNERAL_CATEGORY_ID } from '@/app/farewell/journey/content';

export const revalidate = 300;

/** จำนวนชิ้นต่อประเด็นเมื่อดูทั้งกลุ่ม */
const PREVIEW_LIMIT = 8;

interface Item {
  kind: 'post' | 'video';
  id: string | number;
  title: string;
  href: string;
  image?: string;
  date: string;
}

export function generateStaticParams() {
  return ISSUE_GROUPS.map((group) => ({ key: group.key }));
}

export async function generateMetadata({ params }: PageProps<'/issues/[key]'>): Promise<Metadata> {
  const { key } = await params;
  const group = getIssueGroup(key);
  return group ? { title: group.title, description: group.quote } : {};
}

async function getItems(category: Category): Promise<Item[]> {
  if (!category.slug) return [];

  const [posts, videos] = await Promise.all([
    getCategoryPosts(category.slug),
    getCategoryVideos(category.slug),
  ]);

  const items: Item[] = [
    ...videos.map((video) => ({
      kind: 'video' as const,
      id: video.id,
      title: video.title,
      href: `/video/${video.slug}`,
      image: video.thumbnail_url,
      date: (video as { published_at?: string }).published_at || video.created_at,
    })),
    ...posts.map((post) => ({
      kind: 'post' as const,
      id: post.id,
      title: post.title,
      href: `/post/${post.slug}`,
      image: post.featured_image_url,
      date: (post as { published_at?: string }).published_at || post.created_at,
    })),
  ];

  return items.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

function ItemCard({ item }: { item: Item }) {
  const Icon = item.kind === 'video' ? PlayCircle : FileText;

  return (
    <Link href={item.href} className="group block">
      <div className="relative aspect-[4/5] rounded-lg overflow-hidden bg-yellow-50 mb-2">
        {item.image ? (
          <Image
            src={item.image}
            alt={item.title}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 200px"
            className="object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-yellow-600 text-5xl font-bold opacity-30">
            {item.title.charAt(0)}
          </div>
        )}
        <span className="absolute top-2 left-2 inline-flex items-center gap-1 text-[11px] text-white bg-black/40 backdrop-blur-sm px-2 py-0.5 rounded-full">
          <Icon className="w-3 h-3" />
          {item.kind === 'video' ? 'วิดีโอ' : 'โพสต์'}
        </span>
      </div>
      <h4 className="text-xs sm:text-sm text-gray-900 line-clamp-2 leading-snug group-hover:text-yellow-700 transition-colors">
        {item.title}
      </h4>
      <p className="text-[11px] text-gray-500 mt-1">{formatThaiDate(item.date)}</p>
    </Link>
  );
}

export default async function IssueGroupPage({ params, searchParams }: PageProps<'/issues/[key]'>) {
  const { key } = await params;
  const group = getIssueGroup(key);
  if (!group) notFound();

  const { c } = await searchParams;
  const selectedId = typeof c === 'string' ? Number(c) : undefined;

  const allCategories = await getCategories();
  const categories = group.categoryIds
    .map((id) => allCategories.find((category) => category.id === id))
    .filter((category): category is Category => Boolean(category));

  const selected = categories.find((category) => category.id === selectedId);
  const shown = selected ? [selected] : categories;
  const itemsById = new Map(
    await Promise.all(shown.map(async (category) => [category.id, await getItems(category)] as const)),
  );

  const totalCount = categories.reduce((sum, category) => sum + (category.total_count || 0), 0);
  const groupIndex = ISSUE_GROUPS.indexOf(group);
  const nextGroup = ISSUE_GROUPS[groupIndex + 1];

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      {/* สลับกลุ่มประเด็น */}
      <nav className="border-b border-gray-200 bg-yellow-50/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex gap-1 overflow-x-auto">
          <Link href="/issues" className="shrink-0 px-3 py-3 text-xs sm:text-sm text-gray-600 hover:text-gray-900">
            ภาพรวม
          </Link>
          {ISSUE_GROUPS.map((g, i) => (
            <Link
              key={g.key}
              href={`/issues/${g.key}`}
              className={`shrink-0 px-3 py-3 text-xs sm:text-sm border-b-2 transition-colors ${
                g.key === group.key
                  ? 'border-yellow-500 text-gray-900 font-semibold'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              {i + 1}. {g.title}
            </Link>
          ))}
        </div>
      </nav>

      {/* Header */}
      <section className="border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 text-center">
          <p className="text-xs font-medium text-yellow-700 bg-yellow-100 inline-block px-3 py-1 rounded-full mb-4">
            ประเด็นที่ {groupIndex + 1} · ช่วงชีวิต: {group.stage}
          </p>
          <h1 className="text-2xl sm:text-4xl font-bold text-gray-900 mb-3">{group.title}</h1>
          <p className="text-base sm:text-lg text-gray-700 mb-2">“{group.quote}”</p>
          <p className="text-sm text-gray-500">
            {group.question} · {categories.length} เรื่อง · {totalCount.toLocaleString()} ชิ้น
          </p>

          {/* เลือกเรื่องในประเด็น */}
          <div className="flex flex-wrap justify-center gap-2 mt-6">
            <Link
              href={`/issues/${group.key}`}
              className={`px-3 py-1.5 rounded-full text-xs border transition-colors ${
                !selected ? 'bg-gray-900 text-white border-gray-900' : 'border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
            >
              ทุกเรื่อง
            </Link>
            {categories.map((category) => (
              <Link
                key={category.id}
                href={`/issues/${group.key}?c=${category.id}`}
                className={`px-3 py-1.5 rounded-full text-xs border transition-colors ${
                  selected?.id === category.id
                    ? 'bg-gray-900 text-white border-gray-900'
                    : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
              >
                {category.name} ({category.total_count})
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* เรื่องในประเด็น */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-12">
        {shown.map((category, index) => {
          const items = itemsById.get(category.id) ?? [];
          const visible = selected ? items : items.slice(0, PREVIEW_LIMIT);
          const bridge = !selected && index < shown.length - 1 ? group.bridges[category.id] : undefined;

          return (
            <div key={category.id}>
              <article className="mb-10">
                <div className="flex flex-wrap items-end justify-between gap-2 mb-4">
                  <div>
                    <h2 className="text-lg sm:text-xl font-bold text-gray-900">{category.name}</h2>
                    {category.description && (
                      <p className="text-xs sm:text-sm text-gray-600 mt-1 max-w-3xl">{category.description}</p>
                    )}
                  </div>
                  <span className="text-xs text-gray-500">
                    วิดีโอ {category.video_count} · โพสต์ {category.post_count}
                  </span>
                </div>

                {visible.length > 0 ? (
                  <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3 sm:gap-4">
                    {visible.map((item) => (
                      <ItemCard key={`${item.kind}-${item.id}`} item={item} />
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500 py-6">ยังแสดงเนื้อหาของประเด็นนี้ไม่ได้</p>
                )}

                {!selected && items.length > PREVIEW_LIMIT && (
                  <Link
                    href={`/issues/${group.key}?c=${category.id}`}
                    className="inline-flex items-center gap-1 mt-4 text-sm font-medium text-yellow-700 hover:text-yellow-800"
                  >
                    ดูทั้งหมด {items.length} ชิ้น
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                )}
              </article>

              {/* ประเด็นงานศพมีทางออกที่ใช้ได้ทันที: "ส่งด้วยใจ" */}
              {category.id === FUNERAL_CATEGORY_ID && (
                <Link
                  href="/farewell"
                  className="group mb-10 flex items-center gap-4 rounded-2xl bg-gray-900 p-5 sm:p-6 text-white transition hover:bg-gray-800"
                >
                  <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white text-gray-900">
                    <ChanFlowerIcon className="h-7 w-7" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-xs text-yellow-300">ทางออกที่ใช้ได้ทันที</span>
                    <span className="mt-0.5 block text-lg sm:text-xl font-bold">ส่งด้วยใจ</span>
                    <span className="mt-0.5 block text-sm text-gray-300">
                      วางแผนงานศพด้วยตัวเอง เรียบง่าย สมเกียรติ ไม่เป็นหนี้ · พร้อมป้าย “ไม่เลี้ยงเหล้า” พิมพ์ได้
                    </span>
                  </span>
                  <ArrowRight className="h-5 w-5 shrink-0 transition-transform group-hover:translate-x-1" />
                </Link>
              )}

              {bridge && (
                <p className="max-w-3xl mx-auto mb-10 border-l-4 border-yellow-400 bg-yellow-50 px-4 py-3 text-sm text-gray-700 whitespace-pre-line">
                  {bridge}
                </p>
              )}
            </div>
          );
        })}

        {!selected && nextGroup && (
          <Link
            href={`/issues/${nextGroup.key}`}
            className="block max-w-3xl mx-auto mt-6 rounded-xl border border-gray-200 p-5 hover:border-yellow-400 hover:bg-yellow-50/50 transition-colors"
          >
            <p className="text-xs text-gray-500 mb-1">ประเด็นถัดไป · {nextGroup.stage}</p>
            <p className="text-base font-semibold text-gray-900 flex items-center gap-2">
              {nextGroup.title}
              <ArrowRight className="w-4 h-4" />
            </p>
            <p className="text-sm text-gray-600 mt-1">{nextGroup.question}</p>
          </Link>
        )}
      </section>

      <Footer />
    </div>
  );
}
