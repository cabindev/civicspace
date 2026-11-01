// app/farewell/related.ts — เรื่องเล่างานศพจาก CivicSpace API (ประเด็น "เปลี่ยนค่านิยมงานศพ")
// ใช้ทั้งหน้า "ส่งด้วยใจ" และหน้า 3D — ข้อมูลของ civicspace เท่านั้น
import { getCategories, getCategoryPosts, getCategoryVideos } from '@/app/lib/homeData';
import { FUNERAL_CATEGORY_ID } from './journey/content';

export interface RelatedItem {
  kind: 'video' | 'post';
  id: string;
  title: string;
  href: string;
  image?: string;
  date: string;
}

export async function getFuneralStories(limit: number): Promise<RelatedItem[]> {
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
    .slice(0, limit);
}
