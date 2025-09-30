'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { 
  ChevronLeft,
  ChevronRight,
  ArrowLeft
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

interface CategoryPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export default function CategoryPage({ params }: CategoryPageProps) {
  const [slug, setSlug] = useState<string>('');
  
  useEffect(() => {
    const getSlug = async () => {
      const { slug: paramSlug } = await params;
      setSlug(paramSlug);
    };
    getSlug();
  }, [params]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [category, setCategory] = useState<Category | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPosts, setTotalPosts] = useState(0);
  const postsPerPage = 20;

  useEffect(() => {
    const fetchCategoryData = async () => {
      if (!slug) return; // Don't fetch if slug is not ready
      
      try {
        setLoading(true);
        
        // Fetch posts by category
        const postsRes = await fetch(`/api/categories/${slug}/posts?page=${currentPage}&page_size=${postsPerPage}`);
        
        if (postsRes.ok) {
          const postsData = await postsRes.json();
          // Handle different API response structures
          if (postsData.videos) {
            // API returns { category: {...}, videos: [...] }
            setPosts(postsData.videos || []);
            setCategory(postsData.category || null);
            setTotalPosts(postsData.videos?.length || 0);
          } else if (postsData.posts) {
            // API returns { posts: [...], category: {...}, total_posts: N }
            setPosts(postsData.posts || []);
            setCategory(postsData.category || null);
            setTotalPosts(postsData.total_posts || postsData.posts?.length || 0);
          } else {
            // Direct array or other structure
            setPosts(postsData.results || postsData || []);
            setCategory(null);
            setTotalPosts(postsData.count || postsData.length || 0);
          }
          
          console.log('Category data loaded:', {
            category: postsData.category?.name,
            posts: postsData.posts?.length || 0,
            total: postsData.total_posts
          });
        } else {
          console.error('Failed to fetch category data:', postsRes.status);
          setPosts([]);
          setCategory(null);
          setTotalPosts(0);
        }
      } catch (error) {
        console.error('Error fetching category data:', error);
        setPosts([]);
        setCategory(null);
        setTotalPosts(0);
      } finally {
        setLoading(false);
      }
    };

    fetchCategoryData();
  }, [slug, currentPage]);

  const totalPages = Math.ceil(totalPosts / postsPerPage);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    setLoading(true);
  };

  if (loading && currentPage === 1) {
    return <Loading />;
  }

  if (!category && !loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-white to-orange-50">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">ไม่พบหมวดหมู่</h1>
            <p className="text-gray-600 mb-8">หมวดหมู่ที่ท่านค้นหาไม่มีอยู่ในระบบ</p>
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
      
      {/* Category Header */}
      <section className="bg-white text-gray-900 border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="mb-6">
            <Link 
              href="/"
              className="inline-flex items-center text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              กลับหน้าแรก
            </Link>
          </div>
          
          <div className="text-center">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4">
              {category?.name}
            </h1>
            {category?.description && (
              <p className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto mb-6">
                {category.description}
              </p>
            )}
            <div className="inline-flex items-center space-x-4 text-sm text-gray-500">
              <span>{totalPosts} บทความ</span>
              <span>•</span>
              <span>หน้า {currentPage} จาก {totalPages}</span>
            </div>
          </div>
        </div>
      </section>

      {/* Posts Section */}
      <section className="py-12 sm:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {posts.length > 0 ? (
            <>
              {/* Masonry Layout */}
              <div className="columns-1 sm:columns-2 md:columns-3 lg:columns-4 xl:columns-5 gap-4 space-y-4">
                {posts.map((post, index) => {
                  const heights = ['h-64', 'h-80', 'h-72', 'h-96', 'h-60', 'h-88', 'h-52', 'h-76', 'h-56', 'h-84'];
                  const randomHeight = heights[index % heights.length];
                  
                  return (
                    <Link 
                      key={post.id} 
                      href={`/posts/${post.slug}`}
                      className="group"
                    >
                      <article className="rounded-xl overflow-hidden transition-all duration-300 group-hover:scale-105 hover:shadow-lg break-inside-avoid mb-4 group-hover:rotate-1">
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
                          
                          {/* Date */}
                          <div className="absolute top-3 left-3">
                            <span className="text-xs text-white bg-black/30 backdrop-blur-sm px-2 py-1 rounded-full font-medium">
                              {new Date(post.created_at).toLocaleDateString('th-TH', {
                                day: 'numeric',
                                month: 'short'
                              })}
                            </span>
                          </div>
                          
                          {/* Content Overlay */}
                          <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                            <h3 className="text-sm font-medium mb-2 line-clamp-3 leading-tight">
                              {post.title}
                            </h3>
                            
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

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex flex-col sm:flex-row items-center justify-between mt-8 gap-4">
                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    <button
                      type="button"
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="flex items-center px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed w-full sm:w-auto justify-center sm:justify-start"
                    >
                      <ChevronLeft className="w-4 h-4 mr-1" />
                      <span className="hidden sm:inline">ก่อนหน้า</span>
                    </button>
                  </div>

                  <div className="flex items-center gap-1 overflow-x-auto max-w-full">
                    {Array.from({ length: Math.min(totalPages, 5) }, (_, index) => {
                      let pageNumber;
                      if (totalPages <= 5) {
                        pageNumber = index + 1;
                      } else if (currentPage <= 3) {
                        pageNumber = index + 1;
                      } else if (currentPage >= totalPages - 2) {
                        pageNumber = totalPages - 4 + index;
                      } else {
                        pageNumber = currentPage - 2 + index;
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

                  <div className="flex items-center gap-2 w-full sm:w-auto">
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
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-12">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">ไม่พบบทความ</h3>
              <p className="text-gray-600 mb-8">ยังไม่มีบทความในหมวดหมู่นี้</p>
              <Link 
                href="/"
                className="inline-flex items-center px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                กลับหน้าแรก
              </Link>
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
}