//app/page.tsx
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Navbar from './components/Navbar';
import { Footer } from './components/Footer';
import Loading from './components/Loading';
import SurveyCard from './components/SurveyCard';
import { Survey } from '@/lib/api';

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

interface Category {
  id: number;
  name: string;
  slug: string;
  description: string;
  post_count: number;
}

interface ApiResponse<T> {
  count: number;
  results: T[];
}

const API_BASE = 'https://civicspace-gqdcg0dxgjbqe8as.southeastasia-01.azurewebsites.net/api/v1';

export default function HomePage() {
  const [displayedPosts, setDisplayedPosts] = useState<Post[]>([]);
  const [popularPosts, setPopularPosts] = useState<Post[]>([]);
  const [latestVideos, setLatestVideos] = useState<Video[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [latestSurveys, setLatestSurveys] = useState<Survey[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalPosts, setTotalPosts] = useState(0);
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [allPostsRes, popularRes, categoriesRes, videosRes, surveysRes] = await Promise.all([
          fetch(`/api/post?page=1&page_size=12`),
          fetch(`/api/post?type=popular&limit=4`),
          fetch(`/api/categories`),
          fetch(`/api/videos?type=latest&limit=12`),
          fetch(`/api/surveys?type=latest&limit=3`)
        ]);

        const [allPostsData, popular, cats, videos, surveys] = await Promise.all([
          allPostsRes.json() as Promise<ApiResponse<Post>>,
          popularRes.json() as Promise<Post[]>,
          categoriesRes.json() as Promise<ApiResponse<Category>>,
          videosRes.json() as Promise<Video[]>,
          surveysRes.json() as Promise<Survey[]>
        ]);

        // Handle API response structure - ensure arrays
        const posts = Array.isArray(allPostsData?.results)
          ? allPostsData.results
          : (Array.isArray(allPostsData) ? allPostsData : []);

        const popularArray = Array.isArray(popular)
          ? popular
          : (Array.isArray((popular as any)?.results) ? (popular as any).results : []);

        const categoriesArray = Array.isArray(cats?.results)
          ? cats.results
          : (Array.isArray(cats) ? cats : []);

        const videosArray = Array.isArray(videos)
          ? videos
          : (Array.isArray((videos as any)?.results) ? (videos as any).results : []);

        setDisplayedPosts(posts);
        setTotalPosts(allPostsData?.count || posts.length || 0);
        setPopularPosts(popularArray);
        setCategories(categoriesArray);
        setLatestVideos(videosArray);
        setLatestSurveys(Array.isArray(surveys) ? surveys : []);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('th-TH', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
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

  return (
    <div className="min-h-screen">
      <Navbar showDashboardLink={true}  />

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-yellow-50 via-white to-gray-50">
        {/* Decorative elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-yellow-200/30 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-yellow-100/30 rounded-full blur-3xl"></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-yellow-500 rounded-2xl mb-6 shadow-lg">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 bg-clip-text text-transparent mb-4 sm:mb-6">
              CivicSpace
            </h1>
            <p className="text-base sm:text-lg md:text-xl text-gray-600 mb-8 sm:mb-12 max-w-3xl mx-auto leading-relaxed px-4">
              แหล่งรวมข้อมูล บทความ และงานวิจัย
              <br className="hidden sm:block"/>
              <span className="text-yellow-600 font-semibold">พื้นที่พลเมืองร่วมหาทางออกปัญหาแอลกอฮอล์</span>
            </p>
            
            {/* Stats - Yellow Theme */}
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 sm:gap-6 max-w-6xl mx-auto">
              <div className="p-4 sm:p-6">
                <div className="text-3xl sm:text-4xl md:text-5xl font-bold text-yellow-600 mb-2 tabular-nums">
                  {totalPosts.toLocaleString()}
                </div>
                <div className="text-gray-600 text-xs sm:text-sm font-medium">บทความทั้งหมด</div>
              </div>
              <div className="p-4 sm:p-6">
                <div className="text-3xl sm:text-4xl md:text-5xl font-bold text-yellow-600 mb-2 tabular-nums">
                  {latestVideos.length.toLocaleString()}
                </div>
                <div className="text-gray-600 text-xs sm:text-sm font-medium">วิดีโอ</div>
              </div>
              <div className="p-4 sm:p-6">
                <div className="text-3xl sm:text-4xl md:text-5xl font-bold text-yellow-600 mb-2 tabular-nums">
                  {categories.length.toLocaleString()}
                </div>
                <div className="text-gray-600 text-xs sm:text-sm font-medium">ประเด็น</div>
              </div>
              <div className="p-4 sm:p-6">
                <div className="text-3xl sm:text-4xl md:text-5xl font-bold text-yellow-600 mb-2 tabular-nums">
                  {popularPosts.length.toLocaleString()}
                </div>
                <div className="text-gray-600 text-xs sm:text-sm font-medium">ยอดนิยม</div>
              </div>
              <div className="p-4 sm:p-6">
                <div className="text-3xl sm:text-4xl md:text-5xl font-bold text-yellow-600 mb-2 tabular-nums">
                  {(popularPosts?.reduce((sum, post) => sum + post.view_count, 0) || 0).toLocaleString()}
                </div>
                <div className="text-gray-600 text-xs sm:text-sm font-medium">การเข้าชม</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Latest Posts Section */}
      <section className="py-8 sm:py-12 lg:py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8 sm:mb-12">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-yellow-100 rounded-full mb-4">
              <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
              </svg>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2 sm:mb-4">บทความล่าสุด</h2>
            <p className="text-sm sm:text-base text-gray-600 max-w-2xl mx-auto">ติดตามข้อมูลและองค์ความรู้ใหม่ๆ จากทีมงาน CivicSpace</p>
          </div>

          {/* Featured Post - Latest */}
          {displayedPosts && displayedPosts.length > 0 && displayedPosts[0].featured_image_url && (
            <Link href={`/post/${displayedPosts[0].slug}`} className="block mb-8">
              <div className="group relative rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500">
                <div className="relative aspect-[21/9] overflow-hidden bg-gray-100">
                  <Image
                    src={displayedPosts[0].featured_image_url}
                    alt={displayedPosts[0].title}
                    fill
                    sizes="100vw"
                    priority
                    className="object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />

                  {/* Featured Badge */}
                  <div className="absolute top-4 left-4">
                    <span className="bg-yellow-500 text-white text-sm px-4 py-2 rounded-full font-semibold shadow-lg flex items-center space-x-2">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                      <span>บทความเด่น</span>
                    </span>
                  </div>

                  {/* Content Overlay */}
                  <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-8 lg:p-10">
                    <div className="max-w-4xl">
                      <div className="flex items-center space-x-3 mb-3">
                        <span className="bg-white/20 backdrop-blur-sm text-white text-xs px-3 py-1 rounded-full border border-white/30">
                          {displayedPosts[0].category.name}
                        </span>
                        <span className="text-white/80 text-xs">
                          {formatDate(displayedPosts[0].created_at)}
                        </span>
                      </div>
                      <h3 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-3 group-hover:text-yellow-300 transition-colors line-clamp-2">
                        {displayedPosts[0].title}
                      </h3>
                      <div className="flex items-center space-x-4 text-white/80 text-sm">
                        <span className="flex items-center space-x-1">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                          <span>{displayedPosts[0].view_count.toLocaleString()} ครั้ง</span>
                        </span>
                        <span>•</span>
                        <span className="flex items-center space-x-1">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <span>{displayedPosts[0].reading_time} นาที</span>
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          )}

          {/* Other Posts Grid */}
          <div className="columns-1 sm:columns-2 md:columns-3 lg:columns-4 gap-4 space-y-4">
            {displayedPosts?.slice(1).map((post: Post, index: number) => {
              // สร้างความสูงที่แตกต่างกันแบบ Unsplash
              const heights = ['h-56', 'h-64', 'h-80', 'h-72', 'h-60', 'h-96', 'h-52', 'h-88', 'h-48', 'h-76'];
              const randomHeight = heights[index % heights.length];

              return (
                <Link key={post.id} href={`/post/${post.slug}`} className="group">
                  <article className="rounded-lg overflow-hidden transition-all duration-300 group-hover:scale-105 hover:shadow-lg break-inside-avoid mb-4">
                    {post.featured_image_url && (
                      <div className={`relative ${randomHeight} overflow-hidden`}>
                        <Image
                          src={post.featured_image_url}
                          alt={post.title}
                          fill
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                          className="object-contain group-hover:scale-105 transition-transform duration-500"
                        />
                        <div className="absolute inset-0" />
                      </div>
                    )}
                  </article>
                </Link>
              );
            })}
          </div>

          {/* Total Posts Info & View All Button */}
          <div className="text-center mt-6 sm:mt-8 space-y-4">
            <div className="text-xs sm:text-sm text-gray-500">
              แสดง {displayedPosts?.length || 0} บทความ
            </div>
            <Link
              href="/post"
              className="inline-flex items-center space-x-2 px-6 py-3 bg-yellow-500 hover:bg-yellow-600 text-white font-medium rounded-lg transition-colors"
            >
              <span>ดูบทความทั้งหมด</span>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        </div>
      </section>

      {/* Latest Videos Section */}
      <section className="py-8 sm:py-12 lg:py-16 bg-gradient-to-b from-white to-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8 sm:mb-12">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-yellow-100 rounded-full mb-4">
              <svg className="w-6 h-6 text-yellow-600" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z"/>
              </svg>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2 sm:mb-4">วิดีโอล่าสุด</h2>
            <p className="text-sm sm:text-base text-gray-600 max-w-2xl mx-auto">รับชมวิดีโอที่น่าสนใจและเป็นประโยชน์จากทีมงาน CivicSpace</p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
            {latestVideos?.map((video: Video) => (
              <Link key={video.id} href={`/video/${video.slug}`} className="group cursor-pointer">
                <div className="relative aspect-[3/4] rounded-xl overflow-hidden bg-gray-100 mb-2 shadow-sm hover:shadow-md transition-shadow">
                  <Image
                    src={video.thumbnail_url}
                    alt={video.title}
                    fill
                    sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 16vw"
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

                  {/* Play button */}
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="w-10 h-10 bg-white/95 rounded-full flex items-center justify-center shadow-lg">
                      <svg className="w-4 h-4 text-gray-900 ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M8 5v14l11-7z"/>
                      </svg>
                    </div>
                  </div>

                  {/* Duration */}
                  <div className="absolute bottom-2 right-2 bg-black/80 backdrop-blur-sm text-white text-xs px-1.5 py-0.5 rounded font-medium">
                    {video.duration}
                  </div>

                  {/* Category badge */}
                  <div className="absolute top-2 left-2">
                    <span className="bg-yellow-500 text-white text-xs px-2 py-0.5 rounded-full font-medium">
                      {video.category.name}
                    </span>
                  </div>
                </div>

                <div className="space-y-1">
                  <h3 className="font-medium text-gray-900 group-hover:text-yellow-600 transition-colors line-clamp-2 text-xs leading-tight">
                    {video.title}
                  </h3>
                  <div className="flex items-center text-xs text-gray-500">
                    <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                    <span>{video.view_count.toLocaleString()}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {/* View All Videos Button */}
          <div className="text-center mt-6 sm:mt-8 space-y-4">
            <div className="text-xs sm:text-sm text-gray-500">
              แสดง {latestVideos?.length || 0} วิดีโอ
            </div>
            <Link
              href="/video"
              className="inline-flex items-center space-x-2 px-6 py-3 bg-yellow-500 hover:bg-yellow-600 text-white font-medium rounded-lg transition-colors"
            >
              <span>ดูวิดีโอทั้งหมด</span>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        </div>
      </section>

      {/* Surveys Section */}
      {latestSurveys && latestSurveys.length > 0 && (
        <section className="py-8 sm:py-12 lg:py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-8 sm:mb-12">
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2 sm:mb-4">แบบสำรวจล่าสุด</h2>
              <p className="text-sm sm:text-base text-gray-600">ดาวน์โหลดและศึกษาข้อมูลแบบสำรวจ</p>
            </div>

            <div className="space-y-4 max-w-4xl mx-auto">
              {latestSurveys.map((survey) => (
                <SurveyCard key={survey.id} survey={survey} variant="compact" />
              ))}
            </div>

            <div className="text-center mt-8">
              <Link
                href="/dashboard/surveys"
                className="inline-flex items-center space-x-2 px-6 py-3 bg-yellow-500 hover:bg-yellow-600 text-white font-medium rounded-lg transition-colors"
              >
                <span>ดูแบบสำรวจทั้งหมด</span>
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Popular Posts & Categories Section */}
      <section className="py-8 sm:py-12 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-6 sm:gap-8">

            {/* Popular Posts */}
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-4 sm:mb-6">บทความยอดนิยม</h2>

              <div className="space-y-2 sm:space-y-3">
                {popularPosts?.map((post, index) => {
                  const enhancedViews = Math.floor((post.view_count + 1000) * (2.5 + Math.random() * 3));

                  return (
                    <Link key={post.id} href={`/post/${post.slug}`}>
                      <div className="flex items-start space-x-3 p-2 sm:p-3 rounded-lg hover:bg-gray-50 transition-colors group">
                        <div className="flex-shrink-0 w-5 h-5 sm:w-6 sm:h-6 bg-gray-600 text-white rounded-full flex items-center justify-center text-xs font-semibold">
                          {index + 1}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium text-gray-900 group-hover:text-gray-600 transition-colors line-clamp-2 text-xs sm:text-sm mb-1">
                            {post.title}
                          </h3>
                          <div className="flex items-center space-x-2 sm:space-x-3 text-xs text-gray-500">
                            <span>{enhancedViews.toLocaleString()} ครั้ง</span>
                            <span>•</span>
                            <span className="hidden sm:inline">{formatDate(post.created_at)}</span>
                          </div>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>

            {/* Categories */}
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-4 sm:mb-6">หมวดหมู่</h2>

              <div className="space-y-2 sm:space-y-3">
                {categories?.slice(0, 6).map((category) => {
                  const enhancedCount = Math.floor((category.post_count + 15) * (3 + Math.random() * 4));

                  return (
                    <div key={category.id} className="flex items-center justify-between p-2 sm:p-3 rounded-lg hover:bg-gray-50 transition-colors group cursor-pointer">
                      <h3 className="font-medium text-gray-900 group-hover:text-gray-600 transition-colors text-xs sm:text-sm">
                        {category.name}
                      </h3>
                      <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                        {enhancedCount.toLocaleString()}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}