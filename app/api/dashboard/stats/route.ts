// app/api/dashboard/stats/route.ts — สรุปสถิติสำหรับหน้าแดชบอร์ด (ADMIN / SUPER_ADMIN)
//
// เดิมหน้าแดชบอร์ดดึงข้อมูลดิบ 7 ตัว (โพสต์ 1,000 รายการ ~170KB) จากเบราว์เซอร์ทุกครั้งที่เปิด
// แล้วรอครบทุกตัวก่อนแสดงผล — API ภายนอกตอบโพสต์ทั้งหมดช้า ~3.5 วินาที และตื่นช้า 8–20 วินาทีหลังว่าง
// ที่นี่ดึงฝั่ง server ครั้งเดียว เก็บผลแต่ละตัวไว้ 5 นาที (Next data cache, เก็บเฉพาะ 200)
// แล้วส่งกลับแค่ตัวเลขสรุป + 10 รายการล่าสุด/ยอดนิยม
//
// ห้ามใช้ `export const revalidate` ที่ระดับ route — จะถูก prerender ตอน build (เรียก API ภายนอกตอน build)
// การเช็ค session ทำให้ route นี้ dynamic อยู่แล้ว ส่วน cache อยู่ที่ระดับ fetch แต่ละตัว
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import authOptions from '@/app/lib/configs/auth/authOptions';
import { isAdminRole } from '@/app/lib/roles';
import { dedupeVideos } from '@/app/lib/dedupeVideos';

const API_BASE = 'https://civicspace-gqdcg0dxgjbqe8as.southeastasia-01.azurewebsites.net/api/v1';
const CACHE_SECONDS = 300;

type Item = { view_count?: number; response_count?: number } & Record<string, unknown>;

async function getJson(path: string) {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { Accept: 'application/json' },
    next: { revalidate: CACHE_SECONDS },
    signal: AbortSignal.timeout(30000),
  });
  if (!res.ok) throw new Error(`${path} -> ${res.status}`);
  return res.json();
}

// API ตอบได้ทั้ง array ตรง ๆ และ { count, results }
const listOf = (data: unknown): Item[] =>
  Array.isArray(data) ? data : Array.isArray((data as { results?: unknown })?.results) ? (data as { results: Item[] }).results : [];
const countOf = (data: unknown, list: Item[]) =>
  typeof (data as { count?: unknown })?.count === 'number' ? (data as { count: number }).count : list.length;
const sumOf = (list: Item[], key: 'view_count' | 'response_count') => list.reduce((s, x) => s + (x[key] || 0), 0);

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!isAdminRole(session?.user?.role)) {
    return NextResponse.json({ error: 'เฉพาะผู้ดูแลระบบ' }, { status: 403 });
  }

  try {
    const [postsData, videosData, surveysData, categoriesData, popularPosts, popularSurveys] =
      await Promise.all([
        getJson('/posts/?page=1&page_size=1000'),
        getJson('/videos/?page=1&page_size=1000'),
        getJson('/surveys/latest/?limit=1000'),
        getJson('/categories/'),
        getJson('/posts/popular/?limit=10'),
        getJson('/surveys/popular/?limit=10'),
      ]);

    const posts = listOf(postsData);
    const videos = dedupeVideos(listOf(videosData) as Array<Item & { id: number; video_url?: string }>);
    const surveys = listOf(surveysData);
    const categories = listOf(categoriesData);

    return NextResponse.json({
      posts: {
        total: countOf(postsData, posts),
        totalViews: sumOf(posts, 'view_count'),
        popular: listOf(popularPosts).slice(0, 10),
        recent: posts.slice(0, 10),
      },
      videos: {
        total: countOf(videosData, videos),
        totalViews: sumOf(videos, 'view_count'),
        // API ไม่มี popular ของวิดีโอ — /api/videos?type=popular เดิมตกไปที่หน้า 1 ของรายการ = 10 ตัวแรกชุดเดียวกัน
        popular: videos.slice(0, 10),
        recent: videos.slice(0, 10),
      },
      surveys: {
        total: surveys.length,
        totalViews: sumOf(surveys, 'view_count'),
        totalResponses: sumOf(surveys, 'response_count'),
        popular: listOf(popularSurveys).slice(0, 10),
        recent: surveys.slice(0, 10),
      },
      categories: {
        total: countOf(categoriesData, categories),
        list: categories.slice(0, 12),
      },
    });
  } catch (error) {
    console.error('Error building dashboard stats:', error);
    return NextResponse.json({ error: 'ไม่สามารถดึงข้อมูลจาก CivicSpace API ได้' }, { status: 500 });
  }
}
