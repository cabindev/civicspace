'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { 
  Download,
  Filter,
  Calendar,
  FileText,
  Home,
  ArrowLeft
} from 'lucide-react';
import Loading from '../../components/Loading';

interface PostType {
  id: number;
  name: string;
  slug: string;
  description: string;
  icon: string;
  color: string;
  post_count: number;
}

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
  post_type: {
    id: number;
    name: string;
    slug: string;
    description: string;
    icon: string;
    color: string;
    post_count: number;
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
  status?: string;
}

export default function TablePage() {
  const { data: session, status } = useSession();
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedPostType, setSelectedPostType] = useState<string>('all');
  const [tableData, setTableData] = useState<Post[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [postTypes, setPostTypes] = useState<PostType[]>([]);

  useEffect(() => {
    if (status === 'loading') return;
    if (!session) {
      window.location.href = '/auth/signin';
      return;
    }

    const fetchData = async () => {
      try {
        setLoading(true);
        
        const [postsRes, categoriesRes, postTypesRes] = await Promise.all([
          fetch(`/api/posts?page=1&page_size=100`),
          fetch(`/api/categories`),
          fetch(`/api/post-types`)
        ]);

        const [posts, categories, postTypes] = await Promise.all([
          postsRes.json(),
          categoriesRes.json(),
          postTypesRes.json()
        ]);

        // Handle different response structures
        const postsData = posts.results || posts || [];
        const categoriesData = categories.results || categories || [];
        const postTypesData = postTypes.results || postTypes || [];
        
        setTableData(postsData);
        setCategories(categoriesData);
        setPostTypes(postTypesData);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [session, status]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('th-TH', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Filter data based on selected category and post type
  const filteredData = tableData.filter(post => {
    const categoryMatch = selectedCategory === 'all' || post.category?.slug === selectedCategory;
    const postTypeMatch = selectedPostType === 'all' || post.post_type?.slug === selectedPostType;
    return categoryMatch && postTypeMatch;
  });

  // Export to Excel function
  const exportToExcel = () => {
    const data = filteredData.map(post => ({
      'ชื่อบทความ': post.title,
      'หมวดหมู่': post.category?.name || '',
      'ประเภทเนื้อหา': post.post_type?.name || '',
      'ผู้เขียน': post.author,
      'วันที่เผยแพร่': formatDate(post.created_at),
      'จำนวนผู้เข้าชม': post.view_count,
      'เวลาอ่าน (นาที)': post.reading_time,
      'สถานะ': post.status || 'published'
    }));

    // Convert to CSV format
    const headers = Object.keys(data[0] || {});
    const csvContent = [
      headers.join(','),
      ...data.map(row => headers.map(header => `"${(row as any)[header] || ''}"`).join(','))
    ].join('\n');

    // Create and download file
    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `รายงานบทความ_${selectedCategory === 'all' ? 'ทั้งหมด' : selectedCategory}_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen">
        <Loading size="lg" className="min-h-screen" />
      </div>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <div className="min-h-screen">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 rounded-lg flex items-center justify-center border border-gray-300">
                <FileText className="w-6 h-6 text-gray-600" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900 mb-1">
                  รายงานข้อมูลบทความ
                </h1>
                <p className="text-sm text-gray-400">
                  จัดการและส่งออกข้อมูลบทความทั้งหมด
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <Link 
                href="/dashboard"
                className="flex items-center space-x-2 px-4 py-2 text-sm text-gray-600 hover:text-gray-900 border border-gray-300 rounded-lg hover:border-gray-400 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>กลับ Dashboard</span>
              </Link>
              
              <Link 
                href="/"
                className="flex items-center space-x-2 px-4 py-2 text-sm text-gray-600 hover:text-gray-900 border border-gray-300 rounded-lg hover:border-gray-400 transition-colors"
              >
                <Home className="w-4 h-4" />
                <span>หน้าแรก</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Table Section */}
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Sidebar */}
          <div className="lg:w-64 flex-shrink-0 space-y-6">
            {/* Category Filter */}
            <div className="p-4 rounded-lg border border-gray-300">
              <div className="flex items-center space-x-2 mb-4">
                <Filter className="w-4 h-4 text-gray-600" />
                <h3 className="text-sm font-medium text-gray-900">หมวดหมู่</h3>
              </div>
              
              <div className="space-y-2">
                <button
                  type="button"
                  onClick={() => setSelectedCategory('all')}
                  className={`w-full text-left px-3 py-2 text-sm rounded-lg transition-colors ${
                    selectedCategory === 'all'
                      ? 'bg-gray-100 text-gray-900 border border-gray-300'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  ทั้งหมด ({tableData.length})
                </button>
                
                {categories.map((category) => (
                  <button
                    type="button"
                    key={category.slug}
                    onClick={() => setSelectedCategory(category.slug)}
                    className={`w-full text-left px-3 py-2 text-sm rounded-lg transition-colors ${
                      selectedCategory === category.slug
                        ? 'bg-gray-100 text-gray-900 border border-gray-300'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                  >
                    {category.name} ({tableData.filter(post => post.category?.slug === category.slug).length})
                  </button>
                ))}
              </div>
            </div>

            {/* Post Type Filter */}
            <div className="p-4 rounded-lg border border-gray-300">
              <div className="flex items-center space-x-2 mb-4">
                <FileText className="w-4 h-4 text-gray-600" />
                <h3 className="text-sm font-medium text-gray-900">ประเภทเนื้อหา</h3>
              </div>
              
              <div className="space-y-2">
                <button
                  type="button"
                  onClick={() => setSelectedPostType('all')}
                  className={`w-full text-left px-3 py-2 text-sm rounded-lg transition-colors ${
                    selectedPostType === 'all'
                      ? 'bg-gray-100 text-gray-900 border border-gray-300'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  ทั้งหมด ({tableData.length})
                </button>
                
                {postTypes.map((postType) => (
                  <button
                    type="button"
                    key={postType.slug}
                    onClick={() => setSelectedPostType(postType.slug)}
                    className={`w-full text-left px-3 py-2 text-sm rounded-lg transition-colors ${
                      selectedPostType === postType.slug
                        ? 'bg-gray-100 text-gray-900 border border-gray-300'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                  >
                    {postType.name} ({tableData.filter(post => post.post_type?.slug === postType.slug).length})
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="flex-1">
            <div className="rounded-lg border border-gray-300 overflow-hidden">
              {/* Table Header */}
              <div className="bg-gray-50 px-6 py-4 border-b border-gray-300">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">
                      รายการบทความ
                      {selectedCategory !== 'all' && (
                        <span className="text-sm text-gray-600 ml-2">
                          ({categories.find(c => c.slug === selectedCategory)?.name})
                        </span>
                      )}
                    </h3>
                    <p className="text-sm text-gray-600">
                      แสดง {filteredData.length} รายการจากทั้งหมด {tableData.length} รายการ
                    </p>
                  </div>
                  
                  <button
                    type="button"
                    onClick={exportToExcel}
                    className="flex items-center space-x-2 px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors"
                  >
                    <Download className="w-4 h-4" />
                    <span>ดาวน์โหลด Excel</span>
                  </button>
                </div>
              </div>

              {/* Table Content */}
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        บทความ
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        หมวดหมู่
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        ประเภท
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        ผู้เขียน
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        วันที่เผยแพร่
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        ผู้เข้าชม
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        เวลาอ่าน
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {filteredData.map((post, index) => (
                      <tr key={post.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                        <td className="px-6 py-4">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 w-2 h-2 bg-gray-400 rounded-full mr-3"></div>
                            <div>
                              <div className="text-sm font-medium text-gray-900 line-clamp-2">
                                <Link href={`/posts/${post.slug}`} className="hover:text-gray-600">
                                  {post.title}
                                </Link>
                              </div>
                              <div className="text-xs text-gray-500">
                                ID: {post.id}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Link href={`/categories/${post.category?.slug}`}>
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 hover:bg-gray-200 transition-colors cursor-pointer">
                              {post.category?.name || 'ไม่ระบุ'}
                            </span>
                          </Link>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                            {post.post_type?.name || 'ไม่ระบุ'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {post.author}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center text-sm text-gray-900">
                            <Calendar className="w-4 h-4 mr-1 text-gray-400" />
                            {formatDate(post.created_at)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {post.view_count?.toLocaleString() || 0}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {post.reading_time || 0} นาที
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                
                {filteredData.length === 0 && (
                  <div className="text-center py-12">
                    <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-sm font-medium text-gray-900 mb-2">ไม่พบข้อมูล</h3>
                    <p className="text-sm text-gray-500">ไม่มีบทความในหมวดหมู่ที่เลือก</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}