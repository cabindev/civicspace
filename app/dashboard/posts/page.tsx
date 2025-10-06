// app/dashboard/posts/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { FileText, ExternalLink, Calendar, Eye } from 'lucide-react';
import Link from 'next/link';

interface Post {
  id: number;
  title: string;
  slug: string;
  excerpt: string;
  view_count: number;
  created_at: string;
  category: {
    id: number;
    name: string;
  };
}

// Use API_BASE for API calls (no trailing "/posts/") and SITE_BASE for building public URLs.
const API_BASE = 'https://civicspace-gqdcg0dxgjbqe8as.southeastasia-01.azurewebsites.net/api/v1/posts/';
const SITE_BASE = API_BASE.replace('/api/v1', '');

export default function PostsPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchPosts();
  }, [currentPage]);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE}?page=${currentPage}`);
      
      if (!response.ok) {
        console.log(`❌ Dashboard Posts API failed: ${response.status}, falling back to mock data`);
        
        // Mock data for development
        const mockPosts = [
          {
            id: 1,
            title: "งานพระบวช 1 รูป...คนอ่างทองต้องเสียเงินเท่าไหร่กัน?",
            slug: "1",
            excerpt: "การพิจารณาค่าใช้จ่ายในงานบวชที่เหมาะสม",
            view_count: 1250,
            created_at: "2024-01-15T10:00:00Z",
            category: { id: 1, name: "บวช" }
          },
          {
            id: 2,
            title: "เส้นทางงานบุญสารทเดือนสิบ",
            slug: "timeline",
            excerpt: "การจัดงานบุญประเพณีสารทเดือนสิบ",
            view_count: 980,
            created_at: "2024-01-14T09:00:00Z",
            category: { id: 2, name: "นครศรีธรรมราช" }
          }
        ];
        
        setPosts(mockPosts);
        setTotalPages(1);
        return;
      }
      
      const data = await response.json();
      console.log('✅ Successfully fetched dashboard posts');
      
      setPosts(data.results || []);
      setTotalPages(Math.ceil((data.count || 0) / 10));
    } catch (error) {
      console.error('Error fetching posts:', error);
      
      // Fallback mock data on error
      const mockPosts = [
        {
          id: 1,
          title: "งานพระบวช 1 รูป...คนอ่างทองต้องเสียเงินเท่าไหร่กัน?",
          slug: "1",
          excerpt: "การพิจารณาค่าใช้จ่ายในงานบวชที่เหมาะสม",
          view_count: 1250,
          created_at: "2024-01-15T10:00:00Z",
          category: { id: 1, name: "บวช" }
        }
      ];
      
      setPosts(mockPosts);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
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
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-24 bg-gray-200 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-xs font-bold text-gray-900 mb-2">บทความทั้งหมด</h1>
        <p className="text-xs text-gray-600">จัดการและดูข้อมูลบทความในระบบ</p>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <FileText className="w-4 h-4 text-gray-600" />
              <span className="text-xs font-medium">รายการบทความ</span>
            </div>
            <span className="text-xs text-gray-500">{posts.length} รายการ</span>
          </div>
        </div>

        <div className="divide-y divide-gray-200">
          {posts.map((post) => (
            <div key={post.id} className="p-4 hover:bg-gray-50 transition-colors">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <h3 className="text-xs font-medium text-gray-900 line-clamp-2">
                      <Link
                        href={`${SITE_BASE}/posts/${post.slug}/`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center space-x-2 hover:text-gray-900"
                      >
                        <span>{post.title}</span>
                        <ExternalLink className="w-3 h-3 text-gray-400 hover:text-gray-600 transition-colors" />
                      </Link>
                    </h3>
                  </div>
                  
                  {post.excerpt && (
                    <p className="text-xs text-gray-600 mb-2 line-clamp-2">
                      {post.excerpt}
                    </p>
                  )}

                  <div className="flex items-center space-x-4 text-xs text-gray-500">
                    <div className="flex items-center space-x-1">
                      <Calendar className="w-3 h-3" />
                      <span>{formatDate(post.created_at)}</span>
                    </div>
                    
                    <div className="flex items-center space-x-1">
                      <Eye className="w-3 h-3" />
                      <span>{post.view_count.toLocaleString()} ครั้ง</span>
                    </div>

                    {post.category && (
                      <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded-full">
                        {post.category.name}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="p-4 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <button
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="px-3 py-1 text-xs border rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                ก่อนหน้า
              </button>
              
              <span className="text-xs text-gray-600">
                หน้า {currentPage} จาก {totalPages}
              </span>
              
              <button
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                className="px-3 py-1 text-xs border rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                ถัดไป
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}