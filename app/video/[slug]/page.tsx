'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Navbar from '../../components/Navbar';
import { Footer } from '../../components/Footer';
import Loading from '../../components/Loading';
import { Calendar, Eye, Clock } from 'lucide-react';

interface Video {
  id: number;
  title: string;
  slug: string;
  description: string;
  video_url: string;
  thumbnail_url: string;
  category: {
    id: number;
    name: string;
    slug: string;
  };
  created_at: string;
  view_count: number;
  duration: string;
}

export default function VideoDetailPage() {
  const params = useParams();
  const slug = params?.slug as string;
  const [video, setVideo] = useState<Video | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (slug) {
      fetchVideo();
    }
  }, [slug]);

  const fetchVideo = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/videos/${slug}`);

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();
      setVideo(data);
      setError(false);
    } catch (error) {
      console.error('Error fetching video:', error);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('th-TH', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const isEmbeddable = (url: string) => {
    // Check if URL is YouTube or other embeddable video
    return url.includes('youtube.com') || url.includes('youtu.be') || url.includes('vimeo.com');
  };

  const getEmbedUrl = (url: string) => {
    // Convert YouTube URL to embed format
    if (url.includes('youtube.com/watch')) {
      const videoId = url.split('v=')[1]?.split('&')[0];
      return `https://www.youtube.com/embed/${videoId}`;
    } else if (url.includes('youtu.be/')) {
      const videoId = url.split('youtu.be/')[1]?.split('?')[0];
      return `https://www.youtube.com/embed/${videoId}`;
    }
    return url;
  };

  if (loading) {
    return (
      <div className="min-h-screen">
        <Navbar showDashboardLink={true} />
        <div className="min-h-96">
          <Loading size="lg" className="min-h-96" />
        </div>
        <Footer />
      </div>
    );
  }

  if (error || !video) {
    return (
      <div className="min-h-screen">
        <Navbar showDashboardLink={true} />
        <div className="max-w-4xl mx-auto px-4 py-16 text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">ไม่พบวิดีโอ</h1>
          <p className="text-gray-600 mb-8">ขออภัย ไม่พบวิดีโอที่คุณกำลังค้นหา</p>
          <Link
            href="/video"
            className="inline-flex items-center space-x-2 px-6 py-3 bg-yellow-500 hover:bg-yellow-600 text-white font-medium rounded-lg transition-colors"
          >
            <span>กลับไปหน้าวิดีโอทั้งหมด</span>
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar showDashboardLink={true} />

      {/* Breadcrumb */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <nav className="flex items-center space-x-2 text-sm">
            <Link href="/" className="text-gray-500 hover:text-yellow-600">หน้าแรก</Link>
            <span className="text-gray-400">/</span>
            <Link href="/video" className="text-gray-500 hover:text-yellow-600">วิดีโอทั้งหมด</Link>
            <span className="text-gray-400">/</span>
            <span className="text-gray-900 font-medium line-clamp-1">{video.title}</span>
          </nav>
        </div>
      </div>

      {/* Video Content */}
      <article className="py-8 sm:py-12 lg:py-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Video Header */}
          <div className="mb-6">
            <Link
              href={`/categories/${video.category.slug}`}
              className="inline-block bg-yellow-100 text-yellow-800 text-sm px-3 py-1 rounded-full font-medium hover:bg-yellow-200 transition-colors mb-4"
            >
              {video.category.name}
            </Link>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
              {video.title}
            </h1>

            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
              <div className="flex items-center space-x-2">
                <Calendar className="w-4 h-4" />
                <span>{formatDate(video.created_at)}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Eye className="w-4 h-4" />
                <span>{video.view_count.toLocaleString()} ครั้ง</span>
              </div>
              <div className="flex items-center space-x-2">
                <Clock className="w-4 h-4" />
                <span>{video.duration}</span>
              </div>
            </div>
          </div>

          {/* Video Player */}
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden mb-8">
            {isEmbeddable(video.video_url) ? (
              <div className="relative aspect-video bg-gray-900">
                <iframe
                  src={getEmbedUrl(video.video_url)}
                  title={video.title}
                  className="absolute inset-0 w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            ) : (
              <div className="relative aspect-video bg-gradient-to-br from-gray-900 to-gray-800 flex items-center justify-center">
                <div className="text-center p-8">
                  <div className="mb-6">
                    <svg className="w-20 h-20 mx-auto text-yellow-500" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M8 5v14l11-7z"/>
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-4">
                    ดูวิดีโอนี้ใน Facebook
                  </h3>
                  <p className="text-gray-300 mb-6">
                    วิดีโอนี้อยู่บน Facebook กรุณาคลิกปุ่มด้านล่างเพื่อรับชม
                  </p>
                  <a
                    href={video.video_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center space-x-2 px-6 py-3 bg-yellow-500 hover:bg-yellow-600 text-white font-medium rounded-lg transition-colors"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                    </svg>
                    <span>เปิดวิดีโอใน Facebook</span>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </a>
                </div>
              </div>
            )}
          </div>

          {/* Video Description */}
          {video.description && (
            <div className="bg-white rounded-2xl shadow-sm p-6 sm:p-8">
              <h2 className="text-xl font-bold text-gray-900 mb-4">รายละเอียด</h2>
              <div className="prose prose-lg max-w-none">
                <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                  {video.description}
                </p>
              </div>
            </div>
          )}

          {/* Back Button */}
          <div className="mt-8 text-center">
            <Link
              href="/video"
              className="inline-flex items-center space-x-2 px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              <span>กลับไปหน้าวิดีโอทั้งหมด</span>
            </Link>
          </div>
        </div>
      </article>

      <Footer />
    </div>
  );
}
