//app/page.tsx
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { 
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
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
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPosts, setTotalPosts] = useState(0);
  const [animatedStats, setAnimatedStats] = useState({
    totalPosts: 0,
    categories: 0,
    popularPosts: 0,
    totalViews: 0
  });
  const postsPerPage = 20;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [allPostsRes, popularRes, categoriesRes] = await Promise.all([
          fetch(`${API_BASE}/posts/?page=${currentPage}&page_size=${postsPerPage}`),
          fetch(`${API_BASE}/posts/popular/?limit=4`),
          fetch(`${API_BASE}/categories/`)
        ]);

        const [allPostsData, popular, cats] = await Promise.all([
          allPostsRes.json() as Promise<ApiResponse<Post>>,
          popularRes.json() as Promise<Post[]>,
          categoriesRes.json() as Promise<ApiResponse<Category>>
        ]);

        setAllPosts(allPostsData.results);
        setDisplayedPosts(allPostsData.results);
        setTotalPosts(allPostsData.count);
        setPopularPosts(popular);
        setCategories(cats.results);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [currentPage]);

  const totalPages = Math.ceil(totalPosts / postsPerPage);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    setLoading(true);
  };

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
      const totalViews = popularPosts.reduce((sum, post) => sum + post.view_count, 0);
      
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
            categories: Math.floor(categories.length * easeOutCubic),
            popularPosts: Math.floor(popularPosts.length * easeOutCubic),
            totalViews: Math.floor(totalViews * easeOutCubic)
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
  }, [loading, totalPosts, categories.length, popularPosts]);

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
      <Navbar showDashboardLink={true} />

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
              ในการหาทางออกปัญหาแอลกอฮอล์อย่างมีประสิทธิภาพ
            </p>
            
            {/* Stats - Yellow Theme */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 md:gap-12 max-w-5xl mx-auto mb-8 sm:mb-12">
              <div className="text-center">
                <div className="text-4xl sm:text-5xl md:text-6xl font-bold text-yellow-500 mb-2 tabular-nums">
                  {animatedStats.totalPosts.toLocaleString()}
                </div>
                <div className="text-gray-500 text-xs sm:text-sm font-light tracking-wide">บทความทั้งหมด</div>
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
            {displayedPosts.map((post: Post, index: number) => {
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

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex flex-col sm:flex-row justify-center items-center mt-8 sm:mt-12 space-y-3 sm:space-y-0 sm:space-x-2">
              <button
                type="button"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="flex items-center px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed w-full sm:w-auto justify-center sm:justify-start"
              >
                <ChevronLeft className="w-4 h-4 mr-1" />
                <span className="hidden sm:inline">ก่อนหน้า</span>
                <span className="sm:hidden">ก่อนหน้า</span>
              </button>

              <div className="flex space-x-1 overflow-x-auto px-2">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNumber;
                  if (totalPages <= 5) {
                    pageNumber = i + 1;
                  } else if (currentPage <= 3) {
                    pageNumber = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNumber = totalPages - 4 + i;
                  } else {
                    pageNumber = currentPage - 2 + i;
                  }

                  return (
                    <button
                      type="button"
                      key={pageNumber}
                      onClick={() => handlePageChange(pageNumber)}
                      className={`px-3 py-2 text-sm font-medium rounded-lg min-w-[40px] ${
                        currentPage === pageNumber
                          ? 'text-white bg-gray-900'
                          : 'text-gray-500 bg-white border border-gray-300 hover:bg-gray-50 hover:text-gray-700'
                      }`}
                    >
                      {pageNumber}
                    </button>
                  );
                })}
              </div>

              <button
                type="button"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="flex items-center px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed w-full sm:w-auto justify-center sm:justify-start"
              >
                <span className="hidden sm:inline">ถัดไป</span>
                <span className="sm:hidden">ถัดไป</span>
                <ChevronRight className="w-4 h-4 ml-1" />
              </button>
            </div>
          )}

          {/* Page Info */}
          <div className="text-center mt-4 sm:mt-6 text-xs sm:text-sm text-gray-500 px-4">
            แสดง {displayedPosts.length} จาก {totalPosts.toLocaleString()} บทความ 
            <br className="sm:hidden" />
            <span className="hidden sm:inline"> </span>(หน้า {currentPage} จาก {totalPages})
          </div>
        </div>
      </section>

      {/* Popular Posts & Categories Section */}
      <section className="py-8 sm:py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-6 sm:gap-8">
            
            {/* Popular Posts */}
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-4 sm:mb-6">บทความยอดนิยม</h2>
              
              <div className="space-y-2 sm:space-y-3">
                {popularPosts.map((post, index) => {
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
                {categories.slice(0, 6).map((category) => {
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