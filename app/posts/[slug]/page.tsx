'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { 
  ArrowLeft,
  Calendar,
  User,
  Eye,
  Clock,
  Tag
} from 'lucide-react';
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
  updated_at: string;
  view_count: number;
  reading_time: number;
}

interface PostPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export default function PostPage({ params }: PostPageProps) {
  const [slug, setSlug] = useState<string>('');
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const getSlug = async () => {
      const { slug: paramSlug } = await params;
      setSlug(paramSlug);
    };
    getSlug();
  }, [params]);

  useEffect(() => {
    const fetchPost = async () => {
      if (!slug) return;
      
      try {
        setLoading(true);
        setError(null);
        
        const response = await fetch(`/api/posts/${slug}`);
        
        if (response.ok) {
          const postData = await response.json();
          setPost(postData);
          
          console.log('Post loaded:', postData.title);
        } else {
          console.error('Failed to fetch post:', response.status);
          setError('ไม่พบบทความที่ต้องการ');
          setPost(null);
        }
      } catch (error) {
        console.error('Error fetching post:', error);
        setError('เกิดข้อผิดพลาดในการโหลดบทความ');
        setPost(null);
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [slug]);

  if (loading) {
    return <Loading />;
  }

  if (error || !post) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-white to-orange-50">
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              {error || 'ไม่พบบทความ'}
            </h1>
            <p className="text-gray-600 mb-8">บทความที่ท่านค้นหาไม่มีอยู่ในระบบ</p>
            <Link 
              href="/"
              className="inline-flex items-center px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              กลับหน้าแรก
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-white to-orange-50">
      <Navbar />
      
      {/* Breadcrumb */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <nav className="flex items-center space-x-2 text-sm text-gray-600">
            <Link href="/" className="hover:text-gray-900 transition-colors">
              หน้าแรก
            </Link>
            <span>/</span>
            <Link 
              href={`/categories/${post.category.slug}`}
              className="hover:text-gray-900 transition-colors"
            >
              {post.category.name}
            </Link>
            <span>/</span>
            <span className="text-gray-900 font-medium line-clamp-1">
              {post.title}
            </span>
          </nav>
        </div>
      </div>

      {/* Article Header */}
      <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Featured Image */}
        {post.featured_image_url && (
          <div className="aspect-video rounded-xl overflow-hidden mb-8 bg-gradient-to-br from-yellow-100 to-orange-100">
            <Image
              src={post.featured_image_url}
              alt={post.title}
              width={800}
              height={450}
              className="w-full h-full object-cover"
              priority
            />
          </div>
        )}

        {/* Article Meta */}
        <div className="mb-6">
          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 mb-4">
            <div className="flex items-center">
              <Calendar className="w-4 h-4 mr-1" />
              {new Date(post.created_at).toLocaleDateString('th-TH', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </div>
            <div className="flex items-center">
              <User className="w-4 h-4 mr-1" />
              {post.author}
            </div>
            <div className="flex items-center">
              <Eye className="w-4 h-4 mr-1" />
              {post.view_count.toLocaleString()} views
            </div>
            <div className="flex items-center">
              <Clock className="w-4 h-4 mr-1" />
              {post.reading_time} นาที
            </div>
          </div>

          {/* Category and Tags */}
          <div className="flex flex-wrap items-center gap-2 mb-6">
            <Link
              href={`/categories/${post.category.slug}`}
              className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800 hover:bg-yellow-200 transition-colors"
            >
              {post.category.name}
            </Link>
            {post.tags.map((tag) => (
              <span
                key={tag.id}
                className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800"
              >
                <Tag className="w-3 h-3 mr-1" />
                {tag.name}
              </span>
            ))}
          </div>
        </div>

        {/* Article Title */}
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-8 leading-tight">
          {post.title}
        </h1>

        {/* Article Content */}
        <div className="prose prose-lg prose-gray max-w-none">
          <div 
            className="text-gray-700 leading-relaxed whitespace-pre-wrap"
            dangerouslySetInnerHTML={{ __html: post.content.replace(/\n/g, '<br />') }}
          />
        </div>

        {/* Article Footer */}
        <div className="mt-12 pt-8 border-t border-gray-200">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="text-sm text-gray-600">
              <p>เผยแพร่เมื่อ: {new Date(post.created_at).toLocaleDateString('th-TH')}</p>
              {post.updated_at !== post.created_at && (
                <p>อัปเดตล่าสุด: {new Date(post.updated_at).toLocaleDateString('th-TH')}</p>
              )}
            </div>
            
            <div className="flex items-center space-x-4">
              <Link
                href={`/categories/${post.category.slug}`}
                className="inline-flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                ดูบทความอื่นในหมวด {post.category.name}
              </Link>
              <Link
                href="/"
                className="inline-flex items-center px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                กลับหน้าแรก
              </Link>
            </div>
          </div>
        </div>
      </article>

      <Footer />
    </div>
  );
}