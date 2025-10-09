// app/post/[slug]/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { Calendar, Eye, ArrowLeft, User, Tag, Download, X, ZoomIn } from 'lucide-react';
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
  const [showImageModal, setShowImageModal] = useState(false);
  const [imageError, setImageError] = useState(false);

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

  const handleDownloadImage = async () => {
    if (!post?.featured_image_url) return;
    
    try {
      // Try direct download first
      const link = document.createElement('a');
      link.href = post.featured_image_url;
      link.download = `${post.slug}-image.jpg`;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Error downloading image:', error);
      // Fallback: open in new tab
      window.open(post.featured_image_url, '_blank');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-50">
        <Navbar showDashboardLink={true}  />
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
        <Navbar showDashboardLink={true}  />
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
      <Navbar showDashboardLink={true}  />
      
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
          {/* Hero Banner - Full Width Cover */}
          {post.featured_image_url && !imageError && (
            <div className="w-full bg-gradient-to-br from-slate-900 via-slate-800 to-slate-700 relative overflow-hidden">
              <div className="relative w-full aspect-[1920/630]">
                <Image
                  src={post.featured_image_url!}
                  alt={post.title}
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 800px, 1200px"
                  className="object-cover w-full h-full opacity-60"
                  priority
                  onError={() => setImageError(true)}
                />
                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-slate-800/40 to-transparent"></div>
                
                {/* Title Overlay */}
                <div className="absolute inset-0 flex items-end">
                  <div className="w-full p-6 md:p-8">
                    <div className="max-w-3xl">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-yellow-500/20 text-yellow-100 border border-yellow-400/30 mb-4">
                        {post.category.name}
                      </span>
                      <h1 className="text-xl md:text-2xl lg:text-3xl font-bold text-white mb-2 leading-tight drop-shadow-lg">
                        {post.title}
                      </h1>
                      <div className="flex flex-wrap items-center gap-4 text-sm text-slate-200">
                        <div className="flex items-center gap-1">
                          <User className="w-4 h-4 text-slate-300" />
                          <span>{post.author}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4 text-slate-300" />
                          <span>{formatDate(post.created_at)}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Eye className="w-4 h-4 text-slate-300" />
                          <span>{post.view_count.toLocaleString()} ครั้ง</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Content Image - Contained */}
          {post.featured_image_url && !imageError && (
            <div className="w-full bg-slate-50 border-t border-slate-200 relative group">
              <div className="relative w-full aspect-[4/3] lg:aspect-[5/3] cursor-pointer" onClick={() => setShowImageModal(true)}>
                <Image
                  src={post.featured_image_url!}
                  alt={`${post.title} - รายละเอียด`}
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 800px, 1200px"
                  className="object-contain w-full h-full transition-opacity group-hover:opacity-80"
                  onError={() => setImageError(true)}
                />
                {/* Hover Overlay */}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300 flex items-center justify-center">
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-white/90 rounded-full p-3">
                    <ZoomIn className="w-6 h-6 text-slate-700" />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Fallback Hero Section (No Image) */}
          {(!post.featured_image_url || imageError) && (
            <div className="w-full bg-gradient-to-br from-slate-900 via-slate-800 to-slate-700 relative overflow-hidden">
              <div className="relative w-full aspect-[1920/630] flex items-end">
                <div className="w-full p-6 md:p-8">
                  <div className="max-w-3xl">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-yellow-500/20 text-yellow-100 border border-yellow-400/30 mb-4">
                      {post.category.name}
                    </span>
                    <h1 className="text-xl md:text-2xl lg:text-3xl font-bold text-white mb-2 leading-tight drop-shadow-lg">
                      {post.title}
                    </h1>
                    <div className="flex flex-wrap items-center gap-4 text-sm text-slate-200">
                      <div className="flex items-center gap-1">
                        <User className="w-4 h-4 text-slate-300" />
                        <span>{post.author}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4 text-slate-300" />
                        <span>{formatDate(post.created_at)}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Eye className="w-4 h-4 text-slate-300" />
                        <span>{post.view_count.toLocaleString()} ครั้ง</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="p-6 md:p-8">
            {/* Reading Time */}
            <div className="mb-6 text-center">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-yellow-50 text-yellow-800 border border-yellow-200">
                อ่าน {post.reading_time} นาที
              </span>
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

      {/* Image Modal */}
      {showImageModal && post?.featured_image_url && !imageError && (
        <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4" onClick={() => setShowImageModal(false)}>
          <div className="relative max-w-7xl max-h-full w-full h-full flex items-center justify-center">
            {/* Close Button */}
            <button
              type="button"
              onClick={() => setShowImageModal(false)}
              className="absolute top-4 right-4 z-10 bg-white/10 hover:bg-white/20 rounded-full p-2 transition-colors"
              aria-label="ปิด"
            >
              <X className="w-6 h-6 text-white" />
            </button>
            
            {/* Download Button */}
            <button
              type="button"
              onClick={handleDownloadImage}
              className="absolute top-4 left-4 z-10 bg-white/10 hover:bg-white/20 rounded-full p-2 transition-colors"
              aria-label="ดาวน์โหลดรูปภาพ"
            >
              <Download className="w-6 h-6 text-white" />
            </button>

            {/* Image Container */}
            <div className="relative w-full h-full flex items-center justify-center" onClick={(e) => e.stopPropagation()}>
              <Image
                src={post.featured_image_url}
                alt={post.title}
                fill
                sizes="100vw"
                className="object-contain"
                priority
              />
            </div>
            
            {/* Image Info */}
            <div className="absolute bottom-4 left-4 right-4 z-10 bg-black/50 rounded-lg p-4 text-white">
              <h3 className="font-semibold text-lg mb-1">{post.title}</h3>
              <p className="text-sm text-slate-300">คลิกที่รูปภาพเพื่อดาวน์โหลด หรือคลิกนอกรูปเพื่อปิด</p>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}