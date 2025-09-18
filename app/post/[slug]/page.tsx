// app/post/[slug]/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { Calendar, Eye, ArrowLeft, User, Tag } from 'lucide-react';
import Navbar from '../../components/Navbar';
import { Footer } from '../../components/Footer';
import Loading from '../../components/Loading';

interface Post {
  id: number;
  title: string;
  slug: string;
  content: string;
  author: string;
  category: {
    id: number;
    name: string;
    slug: string;
  };
  tags: Array<{
    id: number;
    name: string;
    slug: string;
  }>;
  featured_image_url?: string;
  created_at: string;
  view_count: number;
  reading_time: number;
}

export default function PostPage() {
  const params = useParams();
  const router = useRouter();
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPost = async () => {
      if (!params.slug) return;
      
      try {
        const response = await fetch(`/api/post/${params.slug}`);
        
        if (!response.ok) {
          throw new Error('ไม่พบบทความที่ต้องการ');
        }
        
        const data = await response.json();
        setPost(data);
      } catch (error: any) {
        console.error('Error fetching post:', error);
        setError(error.message || 'เกิดข้อผิดพลาดในการโหลดบทความ');
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [params.slug]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('th-TH', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-50">
        <Navbar showDashboardLink={true} />
        <div className="min-h-96 flex items-center justify-center">
          <Loading size="lg" className="min-h-96" />
        </div>
        <Footer />
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="min-h-screen bg-neutral-50">
        <Navbar showDashboardLink={true} />
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <h1 className="text-2xl font-semibold text-slate-900 mb-3">ไม่พบบทความที่ต้องการ</h1>
            <p className="text-sm text-slate-600 mb-8">{error}</p>
            <Link
              href="/"
              aria-label="กลับหน้าหลัก"
              className="inline-flex items-center px-4 py-2 border border-slate-200 text-sm font-medium rounded-md text-slate-800 bg-white hover:bg-slate-50 transition"
            >
              <ArrowLeft className="w-4 h-4 mr-2 text-slate-600" />
              กลับหน้าหลัก
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50 text-slate-800">
      <Navbar showDashboardLink={true} />
      
      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Back Button */}
        <div className="mb-6">
          <button
            onClick={() => router.back()}
            className="inline-flex items-center text-sm text-slate-700 hover:text-slate-900 transition-colors"
            aria-label="ย้อนกลับ"
          >
            <ArrowLeft className="w-4 h-4 mr-1 text-slate-600" />
            ย้อนกลับ
          </button>
        </div>

        <article className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          {/* Featured Image */}
          {post.featured_image_url && (
            <div className="w-full bg-slate-100">
              <div className="relative w-full aspect-video">
              <Image
                src={post.featured_image_url!}
                alt={post.title}
                fill
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 800px, 1200px"
                className="object-cover w-full h-full"
                priority
              />
              </div>
            </div>
          )}

          <div className="p-6 md:p-8">
            {/* Category Badge */}
            <div className="mb-3">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-200 text-slate-800">
                {post.category.name}
              </span>
            </div>

            {/* Title */}
            <h1 className="text-xl md:text-3xl font-semibold text-slate-900 mb-4 leading-snug">
              {post.title}
            </h1>

            {/* Meta Information */}
            <div className="flex flex-wrap items-center gap-4 mb-6 text-xs text-slate-600">
              <div className="flex items-center gap-1">
                <User className="w-4 h-4 text-slate-500" />
                <span className="leading-none">{post.author}</span>
              </div>
              <div className="flex items-center gap-1">
                <Calendar className="w-4 h-4 text-slate-500" />
                <span className="leading-none">{formatDate(post.created_at)}</span>
              </div>
              <div className="flex items-center gap-1">
                <Eye className="w-4 h-4 text-slate-500" />
                <span className="leading-none">{post.view_count.toLocaleString()} ครั้ง</span>
              </div>
              <div className="text-slate-500">
                อ่าน {post.reading_time} นาที
              </div>
            </div>

            {/* Content (small, clean) */}
            <div
              className="prose prose-sm max-w-none text-slate-800 leading-relaxed prose-a:text-slate-700 prose-a:underline-offset-2 prose-img:rounded-md"
              style={{ fontSize: '0.92rem', lineHeight: 1.75 }}
              dangerouslySetInnerHTML={{ __html: post.content }}
            />

            {/* Tags */}
            {post.tags && post.tags.length > 0 && (
              <div className="mt-8 pt-6 border-t border-slate-100">
                <div className="flex flex-wrap items-center gap-2">
                  <Tag className="w-4 h-4 text-slate-500" />
                  <span className="text-sm font-medium text-slate-900 mr-2">แท็ก:</span>
                  {post.tags.map((tag) => (
                    <span
                      key={tag.id}
                      className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-800"
                    >
                      {tag.name}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </article>
      </main>

      <Footer />
    </div>
  );
}