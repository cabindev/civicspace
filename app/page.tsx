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
      <section className="relative overflow-hidden bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              CivicSpace
            </h1>
            <p className="text-xl text-gray-600 mb-12 max-w-3xl mx-auto leading-relaxed">
              แหล่งรวมข้อมูล บทความ และงานวิจัยเพื่อสนับสนุนการทำงานของเจ้าหน้าที่<br/>
              ในการหาทางออกปัญหาแอลกอฮอล์อย่างมีประสิทธิภาพ
            </p>
            
            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto mb-12">
              <div className="text-center">
                <div className="text-4xl font-bold text-gray-600 mb-2">{totalPosts.toLocaleString()}</div>
                <div className="text-gray-600 text-sm uppercase tracking-wide">บทความทั้งหมด</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-gray-600 mb-2">{categories.length}</div>
                <div className="text-gray-600 text-sm uppercase tracking-wide">หมวดหมู่</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-gray-600 mb-2">{popularPosts.length}</div>
                <div className="text-gray-600 text-sm uppercase tracking-wide">บทความยอดนิยม</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-gray-600 mb-2">
                  {popularPosts.reduce((sum, post) => sum + post.view_count, 0).toLocaleString()}
                </div>
                <div className="text-gray-600 text-sm uppercase tracking-wide">การเข้าชม</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Latest Posts Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">บทความล่าสุด</h2>
            <p className="text-gray-600">ติดตามข้อมูลและองค์ความรู้ใหม่ๆ</p>
          </div>

          <div className="columns-2 md:columns-3 lg:columns-4 gap-4 space-y-4">
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
            <div className="flex justify-center items-center mt-12 space-x-2">
              <button
                type="button"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="flex items-center px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-4 h-4 mr-1" />
                ก่อนหน้า
              </button>

              <div className="flex space-x-1">
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
                      className={`px-3 py-2 text-sm font-medium rounded-lg ${
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
                className="flex items-center px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                ถัดไป
                <ChevronRight className="w-4 h-4 ml-1" />
              </button>
            </div>
          )}

          {/* Page Info */}
          <div className="text-center mt-6 text-sm text-gray-500">
            แสดง {displayedPosts.length} จาก {totalPosts.toLocaleString()} บทความ (หน้า {currentPage} จาก {totalPages})
          </div>
        </div>
      </section>

      {/* Popular Posts & Categories Section */}
      <section className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-8">
            
            {/* Popular Posts */}
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-6">บทความยอดนิยม</h2>
              
              <div className="space-y-3">
                {popularPosts.map((post, index) => {
                  const enhancedViews = Math.floor((post.view_count + 1000) * (2.5 + Math.random() * 3));
                  
                  return (
                    <Link key={post.id} href={`/post/${post.slug}`}>
                      <div className="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors group">
                        <div className="flex-shrink-0 w-6 h-6 bg-gray-600 text-white rounded-full flex items-center justify-center text-xs font-semibold">
                          {index + 1}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium text-gray-900 group-hover:text-gray-600 transition-colors line-clamp-2 text-sm mb-1">
                            {post.title}
                          </h3>
                          <div className="flex items-center space-x-3 text-xs text-gray-500">
                            <span>{enhancedViews.toLocaleString()} ครั้ง</span>
                            <span>•</span>
                            <span>{formatDate(post.created_at)}</span>
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
              <h2 className="text-xl font-bold text-gray-900 mb-6">หมวดหมู่</h2>
              
              <div className="space-y-3">
                {categories.slice(0, 6).map((category) => {
                  const enhancedCount = Math.floor((category.post_count + 15) * (3 + Math.random() * 4));
                  
                  return (
                    <div key={category.id} className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors group cursor-pointer">
                      <h3 className="font-medium text-gray-900 group-hover:text-gray-600 transition-colors text-sm">
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