// app/post/[slug]/page.tsx  ← Server Component (no 'use client')
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import PostContent from './PostContent';

const API_BASE = 'https://civicspace-gqdcg0dxgjbqe8as.southeastasia-01.azurewebsites.net/api/v1';
const SITE_URL = process.env.NEXTAUTH_URL || 'https://civicspace.sdnthailand.com';

interface Post {
  id: number;
  title: string;
  slug: string;
  content: string;
  author: string;
  excerpt?: string;
  category: { id: number; name: string; slug: string };
  tags: Array<{ id: number; name: string; slug: string }>;
  featured_image_url?: string;
  created_at: string;
  updated_at?: string;
  view_count: number;
  reading_time: number;
}

async function getPost(slug: string): Promise<Post | null> {
  try {
    const res = await fetch(`${API_BASE}/posts/${slug}/`, {
      next: { revalidate: 3600 },
    });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

// ทำให้ Google เห็น title/description/OG image ของแต่ละบทความ
export async function generateMetadata(
  { params }: { params: { slug: string } }
): Promise<Metadata> {
  const post = await getPost(params.slug);
  if (!post) {
    return { title: 'ไม่พบบทความ' };
  }

  const description = post.excerpt
    || post.content.replace(/<[^>]+>/g, '').slice(0, 160);

  return {
    title: post.title,
    description,
    keywords: post.tags?.map((t) => t.name),
    alternates: { canonical: `${SITE_URL}/post/${post.slug}` },
    openGraph: {
      type: 'article',
      title: post.title,
      description,
      url: `${SITE_URL}/post/${post.slug}`,
      siteName: 'CivicSpace',
      locale: 'th_TH',
      publishedTime: post.created_at,
      modifiedTime: post.updated_at,
      authors: [post.author],
      section: post.category.name,
      images: post.featured_image_url
        ? [{ url: post.featured_image_url, alt: post.title }]
        : [],
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description,
      images: post.featured_image_url ? [post.featured_image_url] : [],
    },
  };
}

export default async function PostPage({ params }: { params: { slug: string } }) {
  const post = await getPost(params.slug);
  if (!post) notFound();

  return <PostContent post={post} />;
}
