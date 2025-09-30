//app/page.tsx
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Navbar from './components/Navbar';
import { Footer } from './components/Footer';
import Loading from './components/Loading';

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
  thumbnail_url?: string;
  created_at: string;
  view_count: number;
}

interface Category {
  id: number;
  name: string;
  slug: string;
  description: string;
  post_count: number;
}

export default function HomePage() {
  const [allPosts, setAllPosts] = useState<Post[]>([]);
  const [displayedPosts, setDisplayedPosts] = useState<Post[]>([]);
  const [popularPosts, setPopularPosts] = useState<Post[]>([]);
  const [latestVideos, setLatestVideos] = useState<Video[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

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

        // Fetch real data from Next.js API routes
        try {
          const [allPostsRes, popularRes, categoriesRes, videosRes] = await Promise.all([
            fetch(`/api/posts?page=1&page_size=100`),
            fetch(`/api/posts?type=popular&limit=4`),
            fetch(`/api/categories`),
            fetch(`/api/videos?type=latest&limit=6`)
          ]);

          // Parse responses
          const [allPostsData, popularData, categoriesData, videosData] = await Promise.all([
            allPostsRes.ok ? allPostsRes.json() : { results: [], count: 0 },
            popularRes.ok ? popularRes.json() : { results: [] },
            categoriesRes.ok ? categoriesRes.json() : { results: [] },
            videosRes.ok ? videosRes.json() : { results: [] }
          ]);

          // Set data from API
          setAllPosts(allPostsData.results || allPostsData || []);
          setDisplayedPosts(allPostsData.results || allPostsData || []);
          setPopularPosts(popularData.results || popularData || []);
          setCategories(categoriesData.results || categoriesData || []);
          setLatestVideos(videosData.results || videosData || []);

          console.log('API data loaded successfully');
          console.log('Posts:', allPostsData.results?.length || 0);
          console.log('Popular posts:', popularData.results?.length || popularData.length || 0);
          console.log('Categories:', categoriesData.results?.length || 0);
          console.log('Videos:', videosData.results?.length || videosData.length || 0);
        } catch (apiError) {
          console.error('API fetch failed:', apiError);
          // Set empty arrays if API fails
          setAllPosts([]);
          setDisplayedPosts([]);
          setPopularPosts([]);
          setCategories([]);
          setLatestVideos([]);
        }
      } catch (error) {
        console.error('Error in fetchData:', error);
        // Set empty arrays as fallback
        setAllPosts([]);
        setDisplayedPosts([]);
        setPopularPosts([]);
        setCategories([]);
        setLatestVideos([]);
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
        const easeOutQuad = 1 - (1 - progress) * (1 - progress);
        const current = Math.floor(start + difference * easeOutQuad);
        
        setAnimatedStats(prev => ({
          ...prev,
          totalPosts: current
        }));
        
        if (progress < 1) {
          requestAnimationFrame(step);
        } else {
          resolve();
        }
      };
      
      requestAnimationFrame(step);
    });
  };

  // Start counter animation when data is loaded
  useEffect(() => {
    if (!loading && allPosts.length > 0) {
      const animateStats = async () => {
        // Animate total posts
        await animateCounter(0, allPosts.length);
        
        // Animate categories count
        setAnimatedStats(prev => ({ ...prev, categories: categories.length }));
        
        // Animate popular posts count
        setAnimatedStats(prev => ({ ...prev, popularPosts: popularPosts.length }));
        
        // Calculate and animate total views
        const totalViews = allPosts.reduce((sum, post) => sum + post.view_count, 0);
        setAnimatedStats(prev => ({ ...prev, totalViews }));
        
        // Animate total videos
        setAnimatedStats(prev => ({ ...prev, totalVideos: latestVideos.length }));
      };
      
      animateStats();
    }
  }, [loading, allPosts.length, categories.length, popularPosts.length, allPosts, latestVideos.length]);

  if (loading) {
    return <Loading />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-white to-orange-50">
      <Navbar />
      
      {/* Hero Section with Live Statistics */}
      <section className="bg-white text-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
          <div className="text-center">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
              CivicSpace
            </h1>
            <p className="text-xl sm:text-2xl mb-8 text-gray-600 max-w-3xl mx-auto">
              พื้นที่พลเมืองร่วมหาทางออกปัญหาแอลกอฮอล์
            </p>
            
            {/* Live Statistics */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-8 mt-12 max-w-4xl mx-auto">
              <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 sm:p-6 text-center group hover:rotate-3 transition-transform duration-300">
                <div className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
                  {animatedStats.totalPosts.toLocaleString()}
                </div>
                <div className="text-sm sm:text-base text-gray-600">บทความทั้งหมด</div>
              </div>
              <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 sm:p-6 text-center group hover:-rotate-3 transition-transform duration-300">
                <div className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
                  {animatedStats.categories}
                </div>
                <div className="text-sm sm:text-base text-gray-600">หมวดหมู่</div>
              </div>
              <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 sm:p-6 text-center group hover:rotate-2 transition-transform duration-300">
                <div className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
                  {animatedStats.popularPosts}
                </div>
                <div className="text-sm sm:text-base text-gray-600">บทความยอดนิยม</div>
              </div>
              <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 sm:p-6 text-center group hover:-rotate-2 transition-transform duration-300">
                <div className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
                  {animatedStats.totalVideos}
                </div>
                <div className="text-sm sm:text-base text-gray-600">วิดีโอ</div>
              </div>
            </div>
          </div>
        </div>
      </section>


      {/* Latest Articles Section */}
      <section className="py-12 sm:py-16 bg-gradient-to-br from-gray-50 to-yellow-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">บทความล่าสุด</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              ติดตามข้อมูลและองค์ความรู้ใหม่ๆ เกี่ยวกับการแก้ไขปัญหาแอลกอฮอล์
            </p>
          </div>

          {/* Masonry Layout like Unsplash */}
          <div className="columns-1 sm:columns-2 md:columns-3 lg:columns-4 xl:columns-5 gap-4 space-y-4">
            {displayedPosts.map((post, index) => {
              // สร้างความสูงที่แตกต่างกันแบบ Unsplash
              const heights = ['h-64', 'h-80', 'h-72', 'h-96', 'h-60', 'h-88', 'h-52', 'h-76', 'h-56', 'h-84'];
              const randomHeight = heights[index % heights.length];
              
              return (
                <Link 
                  key={post.id} 
                  href={`/posts/${post.slug}`}
                  className="group"
                >
                  <article className="rounded-xl overflow-hidden transition-all duration-300 group-hover:scale-105 hover:shadow-lg break-inside-avoid mb-4 group-hover:rotate-1">
                    {/* Post Image - Full Size Unsplash Style */}
                    <div className={`relative ${randomHeight} overflow-hidden bg-gradient-to-br from-yellow-100 to-yellow-100`}>
                      {post.featured_image_url ? (
                        <Image
                          src={post.featured_image_url}
                          alt={post.title}
                          fill
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                          className="object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-yellow-200 to-yellow-200">
                          <div className="text-yellow-600 text-6xl font-bold opacity-30">
                            {post.title.charAt(0)}
                          </div>
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                      
                      {/* Category Badge */}
                      <div className="absolute top-3 right-3">
                        <button 
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            window.location.href = `/categories/${post.category.slug}`;
                          }}
                          className="text-xs text-white bg-yellow-500/90 backdrop-blur-sm px-2 py-1 rounded-full font-medium hover:bg-yellow-600/90 transition-colors cursor-pointer"
                        >
                          {post.category.name}
                        </button>
                      </div>

                      {/* Date */}
                      <div className="absolute top-3 left-3">
                        <span className="text-xs text-white bg-black/30 backdrop-blur-sm px-2 py-1 rounded-full font-medium">
                          {new Date(post.created_at).toLocaleDateString('th-TH', {
                            day: 'numeric',
                            month: 'short'
                          })}
                        </span>
                      </div>
                      
                      {/* Content Overlay - Bottom */}
                      <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                        <h3 className="text-sm font-medium mb-2 line-clamp-3 leading-tight">
                          {post.title}
                        </h3>
                        
                        {/* Stats */}
                        <div className="flex items-center justify-between mt-3">
                          <div className="flex items-center space-x-2 text-xs opacity-90">
                            <span>{post.view_count.toLocaleString()} views</span>
                          </div>
                          <div className="text-xs bg-white/20 backdrop-blur-sm px-2 py-1 rounded-full">
                            {post.reading_time} นาที
                          </div>
                        </div>
                      </div>
                    </div>
                  </article>
                </Link>
              );
            })}
          </div>

        </div>
      </section>

      {/* Latest Videos Section - Only show if videos are available */}
      {latestVideos.length > 0 && (
        <section className="py-12 sm:py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">วิดีโอล่าสุด</h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                ติดตามคลิปวิดีโอและเนื้อหาล่าสุดจาก CivicSpace
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
              {latestVideos.map((video) => (
                <Link 
                  key={video.id} 
                  href={`/videos/${video.slug}`}
                  className="group bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg transition-all duration-300 hover:scale-105"
                >
                  <div className="aspect-[9/16] bg-gradient-to-br from-yellow-100 to-orange-100 relative overflow-hidden">
                    {video.thumbnail_url ? (
                      <Image 
                        src={video.thumbnail_url} 
                        alt={video.title}
                        fill
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        className="object-cover group-hover:scale-110 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <div className="text-yellow-600 text-4xl font-bold opacity-20">
                          {video.title.charAt(0)}
                        </div>
                      </div>
                    )}
                    {/* Play button overlay */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="bg-black/50 rounded-full p-3 group-hover:bg-black/70 transition-colors">
                        <svg className="w-6 h-6 text-white ml-1" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
                        </svg>
                      </div>
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 group-hover:text-yellow-600 transition-colors">
                      {video.title}
                    </h3>
                    <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                      {video.description}
                    </p>
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span>{video.view_count.toLocaleString()} views</span>
                      <span>{new Date(video.created_at).toLocaleDateString('th-TH')}</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      <Footer />
    </div>
  );
}