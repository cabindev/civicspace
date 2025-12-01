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
  const [allPosts, setAllPosts] = useState<Post[]>([]);
  const [displayedPosts, setDisplayedPosts] = useState<Post[]>([]);
  const [popularPosts, setPopularPosts] = useState<Post[]>([]);
  const [latestVideos, setLatestVideos] = useState<Video[]>([]);
  const [allVideos, setAllVideos] = useState<Video[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [latestSurveys, setLatestSurveys] = useState<Survey[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalPosts, setTotalPosts] = useState(0);
  const [showAllPosts, setShowAllPosts] = useState(false);
  const [showAllVideos, setShowAllVideos] = useState(false);
  const [loadingAllPosts, setLoadingAllPosts] = useState(false);
  const [loadingAllVideos, setLoadingAllVideos] = useState(false);
  const [animatedStats, setAnimatedStats] = useState({
    totalPosts: 0,
    categories: 0,
    popularPosts: 0,
    totalViews: 0,
    totalVideos: 0
  });
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [allPostsRes, popularRes, categoriesRes, videosRes, surveysRes] = await Promise.all([
          fetch(`/api/post?page=1&page_size=12`),
          fetch(`/api/post?type=popular&limit=4`),
          fetch(`/api/categories`),
          fetch(`/api/videos?type=latest&limit=8`),
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

        setAllPosts(posts);
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


  // Counter animation function
  const animateCounter = (start: number, end: number, duration: number = 2000) => {
    return new Promise<void>((resolve) => {
      const startTime = Date.now();
      const difference = end - start;
      
      const step = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        // Easing function for smooth animation
        const easeOutCubic = 1 - Math.pow(1 - progress, 3);
        const current = Math.floor(start + difference * easeOutCubic);
        
        return { current, completed: progress >= 1 };
      };
      
      const animate = () => {
        const { current, completed } = step();
        
        if (completed) {
          resolve();
        } else {
          requestAnimationFrame(animate);
        }
      };
      
      animate();
    });
  };

  // Animate stats when data loads
  useEffect(() => {
    if (!loading && totalPosts > 0) {
      const totalViews = popularPosts?.reduce((sum, post) => sum + post.view_count, 0) || 0;

      // Animate all counters simultaneously
      const animateStats = async () => {
        const duration = 2000;
        const startTime = Date.now();

        const animate = () => {
          const elapsed = Date.now() - startTime;
          const progress = Math.min(elapsed / duration, 1);
          const easeOutCubic = 1 - Math.pow(1 - progress, 3);

          setAnimatedStats({
            totalPosts: Math.floor(totalPosts * easeOutCubic),
            categories: Math.floor((categories?.length || 0) * easeOutCubic),
            popularPosts: Math.floor((popularPosts?.length || 0) * easeOutCubic),
            totalViews: Math.floor(totalViews * easeOutCubic),
            totalVideos: Math.floor((latestVideos?.length || 0) * easeOutCubic)
          });

          if (progress < 1) {
            requestAnimationFrame(animate);
          }
        };

        animate();
      };

      // Start animation after a short delay
      setTimeout(animateStats, 300);
    }
  }, [loading, totalPosts, categories?.length, popularPosts?.length, latestVideos?.length]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('th-TH', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const loadAllPosts = async () => {
    if (showAllPosts) {
      setShowAllPosts(false);
      setDisplayedPosts(allPosts.slice(0, 12));
      return;
    }

    setLoadingAllPosts(true);
    try {
      const response = await fetch('/api/post?page=1&page_size=100');
      const data = await response.json() as ApiResponse<Post>;
      const posts = Array.isArray(data?.results) ? data.results : (Array.isArray(data) ? data : []);

      setAllPosts(posts);
      setDisplayedPosts(posts);
      setShowAllPosts(true);
    } catch (error) {
      console.error('Error loading all posts:', error);
    } finally {
      setLoadingAllPosts(false);
    }
  };

  const loadAllVideos = async () => {
    if (showAllVideos) {
      setShowAllVideos(false);
      return;
    }

    setLoadingAllVideos(true);
    try {
      const response = await fetch('/api/videos?page=1&page_size=100');
      const data = await response.json();
      const videos = Array.isArray(data) ? data : (Array.isArray((data as any)?.results) ? (data as any).results : []);

      setAllVideos(videos);
      setShowAllVideos(true);
    } catch (error) {
      console.error('Error loading all videos:', error);
    } finally {
      setLoadingAllVideos(false);
    }
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
      <section className="relative overflow-hidden bg-gradient-to-br from-white to-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20">
          <div className="text-center">
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-4 sm:mb-6">
              CivicSpace
            </h1>
            <p className="text-base sm:text-lg md:text-xl text-gray-600 mb-8 sm:mb-12 max-w-3xl mx-auto leading-relaxed px-4">
              แหล่งรวมข้อมูล บทความ และงานวิจัยเพื่อสนับสนุนการทำงานของเจ้าหน้าที่
              <br className="hidden sm:block"/>
              พื้นที่พลเมืองร่วมหาทางออกปัญหาแอลกอฮอล์
            </p>
            
            {/* Stats - Yellow Theme */}
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-6 sm:gap-8 md:gap-12 max-w-6xl mx-auto mb-8 sm:mb-12">
              <div className="text-center">
                <div className="text-4xl sm:text-5xl md:text-6xl font-bold text-yellow-500 mb-2 tabular-nums">
                  {animatedStats.totalPosts.toLocaleString()}
                </div>
                <div className="text-gray-500 text-xs sm:text-sm font-light tracking-wide">บทความทั้งหมด</div>
              </div>
              <div className="text-center">
                <div className="text-4xl sm:text-5xl md:text-6xl font-bold text-yellow-500 mb-2 tabular-nums">
                  {animatedStats.totalVideos.toLocaleString()}
                </div>
                <div className="text-gray-500 text-xs sm:text-sm font-light tracking-wide">วิดีโอ</div>
              </div>
              <div className="text-center">
                <div className="text-4xl sm:text-5xl md:text-6xl font-bold text-yellow-500 mb-2 tabular-nums">
                  {animatedStats.categories.toLocaleString()}
                </div>
                <div className="text-gray-500 text-xs sm:text-sm font-light tracking-wide">หมวดหมู่</div>
              </div>
              <div className="text-center">
                <div className="text-4xl sm:text-5xl md:text-6xl font-bold text-yellow-500 mb-2 tabular-nums">
                  {animatedStats.popularPosts.toLocaleString()}
                </div>
                <div className="text-gray-500 text-xs sm:text-sm font-light tracking-wide">บทความยอดนิยม</div>
              </div>
              <div className="text-center">
                <div className="text-4xl sm:text-5xl md:text-6xl font-bold text-yellow-500 mb-2 tabular-nums">
                  {animatedStats.totalViews.toLocaleString()}
                </div>
                <div className="text-gray-500 text-xs sm:text-sm font-light tracking-wide">การเข้าชม</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Latest Posts Section */}
      <section className="py-8 sm:py-12 lg:py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2 sm:mb-4">บทความล่าสุด</h2>
            <p className="text-sm sm:text-base text-gray-600">ติดตามข้อมูลและองค์ความรู้ใหม่ๆ</p>
          </div>

          <div className="columns-1 sm:columns-2 md:columns-3 lg:columns-4 gap-4 space-y-4">
            {displayedPosts?.map((post: Post, index: number) => {
              // สร้างความสูงที่แตกต่างกันแบบ Unsplash
              const heights = ['h-56', 'h-64', 'h-80', 'h-72', 'h-60', 'h-96', 'h-52', 'h-88', 'h-48', 'h-76'];
              const randomHeight = heights[index % heights.length];
              
              return (
                <Link key={post.id} href={`/post/${post.slug}`} className="group">
                  <article className="rounded-lg overflow-hidden transition-all duration-300 group-hover:scale-105 hover:shadow-lg break-inside-avoid mb-4">
                    {/* Image */}
                    {post.featured_image_url && (
                      <div className={`relative ${randomHeight} overflow-hidden`}>
                        <Image
                          src={post.featured_image_url}
                          alt={post.title}
                          fill
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                          className="object-contain group-hover:scale-105 transition-transform duration-500"
                        />
                        <div className="absolute inset-0 " />
                        
                        {/* Overlay content */}
                        {/* <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                          <h3 className="text-sm font-semibold mb-2 line-clamp-2">
                            {post.title}
                          </h3>
                          
                          <p className="text-xs opacity-90 line-clamp-2">
                            {truncateContent(post.content, 80)}
                          </p>
                        </div> */}
                      </div>
                    )}
                    
                    {/* Content for posts without images */}
                    {/* {!post.featured_image_url && (
                      <div className="p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-3 group-hover:text-gray-600 transition-colors line-clamp-2">
                          {post.title}
                        </h3>

                        <p className="text-gray-600 text-sm line-clamp-4">
                          {truncateContent(post.content, 150)}
                        </p>
                      </div>
                    )} */}
                  </article>
                </Link>
              );
            })}
          </div>

          {/* Total Posts Info & Load More Button */}
          <div className="text-center mt-6 sm:mt-8 space-y-4">
            <div className="text-xs sm:text-sm text-gray-500">
              แสดง {displayedPosts?.length || 0} {showAllPosts ? 'จากทั้งหมด' : 'บทความ'}
            </div>
            <button
              type="button"
              onClick={loadAllPosts}
              disabled={loadingAllPosts}
              className="inline-flex items-center space-x-2 px-6 py-3 bg-yellow-500 hover:bg-yellow-600 disabled:bg-gray-300 text-white font-medium rounded-lg transition-colors"
            >
              {loadingAllPosts ? (
                <>
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  <span>กำลังโหลด...</span>
                </>
              ) : (
                <span>{showAllPosts ? 'แสดงน้อยลง' : 'ดูบทความทั้งหมด'}</span>
              )}
            </button>
          </div>
        </div>
      </section>

      {/* Latest Videos Section */}
      <section className="py-8 sm:py-12 lg:py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2 sm:mb-4">วิดีโอล่าสุด</h2>
            <p className="text-sm sm:text-base text-gray-600">รับชมวิดีโอที่น่าสนใจและเป็นประโยชน์</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {(showAllVideos ? allVideos : latestVideos)?.map((video: Video) => (
              <div key={video.id} className="group cursor-pointer">
                <div className="relative aspect-[9/16] rounded-lg overflow-hidden bg-gray-100 mb-3">
                  <Image
                    src={video.thumbnail_url}
                    alt={video.title}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors" />
                  
                  {/* Play button */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-12 h-12 sm:w-16 sm:h-16 bg-white/90 rounded-full flex items-center justify-center group-hover:bg-white group-hover:scale-110 transition-all">
                      <svg className="w-5 h-5 sm:w-6 sm:h-6 text-gray-900 ml-1" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M8 5v14l11-7z"/>
                      </svg>
                    </div>
                  </div>
                  
                  {/* Duration */}
                  <div className="absolute bottom-2 right-2 bg-black/75 text-white text-xs px-2 py-1 rounded">
                    {video.duration}
                  </div>
                </div>
                
                <div className="space-y-2">
                  <h3 className="font-semibold text-gray-900 group-hover:text-gray-600 transition-colors line-clamp-2 text-sm sm:text-base">
                    {video.title}
                  </h3>
                  <p className="text-gray-600 text-xs sm:text-sm line-clamp-2">
                    {video.description}
                  </p>
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span className="bg-gray-100 px-2 py-1 rounded-full">{video.category.name}</span>
                    <div className="flex items-center space-x-2">
                      <span>{video.view_count.toLocaleString()} ครั้ง</span>
                      <span>•</span>
                      <span>{formatDate(video.created_at)}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Load All Videos Button */}
          <div className="text-center mt-6 sm:mt-8 space-y-4">
            <div className="text-xs sm:text-sm text-gray-500">
              แสดง {(showAllVideos ? allVideos : latestVideos)?.length || 0} วิดีโอ
            </div>
            <button
              type="button"
              onClick={loadAllVideos}
              disabled={loadingAllVideos}
              className="inline-flex items-center space-x-2 px-6 py-3 bg-yellow-500 hover:bg-yellow-600 disabled:bg-gray-300 text-white font-medium rounded-lg transition-colors"
            >
              {loadingAllVideos ? (
                <>
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  <span>กำลังโหลด...</span>
                </>
              ) : (
                <span>{showAllVideos ? 'แสดงน้อยลง' : 'ดูวิดีโอทั้งหมด'}</span>
              )}
            </button>
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