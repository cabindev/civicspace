// app/lib/homeData.ts
// ดึงข้อมูลหน้าแรกฝั่งเซิร์ฟเวอร์ + แคชด้วย Data Cache ของ Next
// (เดิมหน้าแรกยิง fetch จากเบราว์เซอร์ผ่าน /api/* ทำให้ผู้ใช้ต้องรอ waterfall ทุกครั้ง)
import type { Survey } from '@/lib/api';

const API_BASE =
  'https://civicspace-gqdcg0dxgjbqe8as.southeastasia-01.azurewebsites.net/api/v1';

// ข้อมูลหน้าแรกเปลี่ยนไม่บ่อย แคชไว้ 5 นาทีก็เพียงพอ
const REVALIDATE = 300;

export interface Post {
  id: number;
  title: string;
  slug: string;
  excerpt?: string;
  author: string;
  category: { id: number; name: string; slug: string } | null;
  tags: Array<{ id: number; name: string; slug: string }>;
  featured_image_url?: string;
  created_at: string;
  view_count: number;
  reading_time: number;
}

export interface Video {
  id: number;
  title: string;
  slug: string;
  description: string;
  video_url: string;
  thumbnail_url: string;
  category: { id: number; name: string; slug: string } | null;
  created_at: string;
  view_count: number;
  duration: string;
}

export interface Category {
  id: number;
  name: string;
  slug: string;
  description: string;
  post_count: number;
  video_count: number;
  survey_count: number;
  total_count: number;
}

export interface SiteStats {
  posts: number;
  videos: number;
  categories: number;
  surveys: number;
}

/**
 * API ตัวนี้ตอบได้ทั้งแบบ array ตรงๆ และแบบ {count, results}
 * แปลงให้เหลือรูปแบบเดียวเสมอ
 */
function toArray<T>(data: unknown): T[] {
  if (Array.isArray(data)) return data as T[];
  if (data && typeof data === 'object' && Array.isArray((data as any).results)) {
    return (data as any).results as T[];
  }
  return [];
}

async function fetchJson(path: string, tag: string): Promise<unknown> {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { Accept: 'application/json' },
    // แคชผลลัพธ์ไว้ ผู้ใช้คนถัดไปจะได้ข้อมูลจากแคชทันทีโดยไม่ต้องรอ API ปลายทาง
    next: { revalidate: REVALIDATE, tags: ['civicspace', tag] },
    signal: AbortSignal.timeout(15000),
  });

  if (!res.ok) {
    throw new Error(`CivicSpace API ${path} -> ${res.status} ${res.statusText}`);
  }

  return res.json();
}

/**
 * ส่วนไหนของหน้าแรกที่ดึงข้อมูลไม่สำเร็จ ให้แสดงเป็นว่างแทนที่จะพังทั้งหน้า
 */
async function fetchList<T>(path: string, tag: string): Promise<T[]> {
  try {
    return toArray<T>(await fetchJson(path, tag));
  } catch (error) {
    console.error('[homeData]', error);
    return [];
  }
}

export function getLatestPosts(limit = 12) {
  return fetchList<Post>(`/posts/latest/?limit=${limit}`, 'posts');
}

export function getPopularPosts(limit = 4) {
  return fetchList<Post>(`/posts/popular/?limit=${limit}`, 'posts');
}

export function getLatestVideos(limit = 12) {
  return fetchList<Video>(`/videos/latest/?limit=${limit}`, 'videos');
}

export function getLatestSurveys(limit = 3) {
  return fetchList<Survey>(`/surveys/latest/?limit=${limit}`, 'surveys');
}

export function getCategories() {
  return fetchList<Category>('/categories/', 'categories');
}

/**
 * ยอดรวมทั้งหมดคำนวณจาก /categories/ ซึ่งมี post_count / video_count / survey_count
 * มาให้ครบอยู่แล้ว (~0.5 วินาที, 3 KB)
 *
 * ของเดิมยิง /posts/?page_size=1000 (~5 วินาที, 100 KB) และ /videos/?page_size=1
 * (~1.5 วินาที, 35 KB) เพียงเพื่อเอาตัวเลขนับ ทั้งที่ API ไม่รองรับ page_size
 * จึงส่งข้อมูลกลับมาทั้งชุดทุกครั้ง
 */
export async function getSiteStats(): Promise<SiteStats> {
  const categories = await getCategories();

  return {
    posts: categories.reduce((sum, c) => sum + (c.post_count || 0), 0),
    videos: categories.reduce((sum, c) => sum + (c.video_count || 0), 0),
    surveys: categories.reduce((sum, c) => sum + (c.survey_count || 0), 0),
    categories: categories.length,
  };
}

export function formatThaiDate(dateString: string) {
  return new Date(dateString).toLocaleDateString('th-TH', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}
