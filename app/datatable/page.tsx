'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import * as XLSX from 'xlsx';
import { 
  Download, 
  FileText, 
  Search,
  Calendar,
  Activity,
  ArrowUpDown,
  Home,
  BarChart3
} from 'lucide-react';
import Loading from '../components/Loading';

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
  post_type?: {
    id: number;
    name: string;
    slug: string;
    icon?: string;
    color?: string;
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
  description?: string;
  post_count: number;
}

interface PostType {
  id: number;
  name: string;
  slug: string;
  description?: string;
  icon?: string;
  color?: string;
  post_count: number;
}

interface ApiResponse<T> {
  count: number;
  results: T[];
}

export default function DataTablePage() {
  const { data: session, status } = useSession();
  const [posts, setPosts] = useState<Post[]>([]);
  const [filteredPosts, setFilteredPosts] = useState<Post[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [postTypes, setPostTypes] = useState<PostType[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState<keyof Post>('created_at');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [activeTab, setActiveTab] = useState<'posts' | 'categories' | 'post-types'>('posts');

  useEffect(() => {
    if (status === 'loading') return;
    if (!session) {
      redirect('/auth/signin');
    }
  }, [session, status]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch posts
        const postsResponse = await fetch('/api/post?page=1&page_size=100');
        const postsData = await postsResponse.json() as ApiResponse<Post>;
        
        const postsArray = Array.isArray(postsData?.results)
          ? postsData.results
          : (Array.isArray(postsData) ? postsData : []);
        
        setPosts(postsArray);
        setFilteredPosts(postsArray);

        // Fetch categories
        const categoriesResponse = await fetch('/api/categories');
        const categoriesData = await categoriesResponse.json() as ApiResponse<Category>;
        
        const categoriesArray = Array.isArray(categoriesData?.results)
          ? categoriesData.results
          : (Array.isArray(categoriesData) ? categoriesData : []);
        
        setCategories(categoriesArray);

        // Fetch post types
        const postTypesResponse = await fetch('/api/post-types');
        const postTypesData = await postTypesResponse.json() as ApiResponse<PostType>;
        
        const postTypesArray = Array.isArray(postTypesData?.results)
          ? postTypesData.results
          : (Array.isArray(postTypesData) ? postTypesData : []);
        
        setPostTypes(postTypesArray);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Filter and search functionality
  useEffect(() => {
    let filtered = posts;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(post =>
        post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        post.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
        post.category.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(post => post.category.slug === selectedCategory);
    }

    // Sort
    filtered.sort((a, b) => {
      let aValue = a[sortField];
      let bValue = b[sortField];

      // Handle nested objects
      if (sortField === 'category') {
        aValue = a.category.name;
        bValue = b.category.name;
      }

      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return sortDirection === 'asc' 
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }

      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return sortDirection === 'asc' ? aValue - bValue : bValue - aValue;
      }

      return 0;
    });

    setFilteredPosts(filtered);
  }, [posts, searchTerm, selectedCategory, sortField, sortDirection]);

  const handleSort = (field: keyof Post) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const exportToExcel = () => {
    // Prepare data for Excel export
    const excelData = filteredPosts.map((post, index) => ({
      'ลำดับ': index + 1,
      'ชื่อบทความ': post.title,
      'หมวดหมู่': post.category.name,
      'ประเภท': post.post_type?.name || 'ไม่ระบุ',
      'การเข้าชม': post.view_count || 0,
      'เวลาอ่าน (นาที)': post.reading_time || 0,
      'วันที่สร้าง': formatDateForExcel(post.created_at),
      'แท็ก': post.tags.map(tag => tag.name).join(', '),
      'URL Slug': post.slug
    }));

    // Create workbook and worksheet
    const ws = XLSX.utils.json_to_sheet(excelData);
    const wb = XLSX.utils.book_new();
    
    // Add worksheet to workbook
    XLSX.utils.book_append_sheet(wb, ws, 'ข้อมูลบทความ');

    // Set column widths
    const colWidths = [
      { wch: 8 },   // ลำดับ
      { wch: 50 },  // ชื่อบทความ
      { wch: 20 },  // หมวดหมู่
      { wch: 18 },  // ประเภท
      { wch: 12 },  // การเข้าชม
      { wch: 15 },  // เวลาอ่าน
      { wch: 20 },  // วันที่สร้าง
      { wch: 30 },  // แท็ก
      { wch: 30 }   // URL Slug
    ];
    ws['!cols'] = colWidths;

    // Generate filename with timestamp
    const timestamp = new Date().toISOString().slice(0, 19).replace(/[:-]/g, '');
    const filename = `CivicSpace_Posts_${timestamp}.xlsx`;

    // Save file
    XLSX.writeFile(wb, filename);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('th-TH', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatDateForExcel = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('th-TH', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  };

  // Get unique categories for filter from posts
  const postCategories = Array.from(new Set(posts.map(post => post.category.slug)))
    .map(slug => posts.find(post => post.category.slug === slug)?.category)
    .filter(Boolean);

  const exportCategoriesToExcel = () => {
    // Prepare data for Excel export
    const excelData = categories.map((category, index) => ({
      'ลำดับ': index + 1,
      'ชื่อหมวดหมู่': category.name,
      'Slug': category.slug,
      'รายละเอียด': category.description || 'ไม่มีรายละเอียด',
      'จำนวนบทความ': category.post_count || 0
    }));

    // Create workbook and worksheet
    const ws = XLSX.utils.json_to_sheet(excelData);
    const wb = XLSX.utils.book_new();
    
    // Add worksheet to workbook
    XLSX.utils.book_append_sheet(wb, ws, 'ข้อมูลหมวดหมู่');

    // Set column widths
    const colWidths = [
      { wch: 8 },   // ลำดับ
      { wch: 25 },  // ชื่อหมวดหมู่
      { wch: 20 },  // Slug
      { wch: 40 },  // รายละเอียด
      { wch: 15 }   // จำนวนบทความ
    ];
    ws['!cols'] = colWidths;

    // Generate filename with timestamp
    const timestamp = new Date().toISOString().slice(0, 19).replace(/[:-]/g, '');
    const filename = `CivicSpace_Categories_${timestamp}.xlsx`;

    // Save file
    XLSX.writeFile(wb, filename);
  };

  const exportPostTypesToExcel = () => {
    // Prepare data for Excel export
    const excelData = postTypes.map((postType, index) => ({
      'ลำดับ': index + 1,
      'ชื่อประเภท': postType.name,
      'Slug': postType.slug,
      'สี': postType.color || 'ไม่มี',
      'รายละเอียด': postType.description || 'ไม่มีรายละเอียด',
      'จำนวนบทความ': postType.post_count || 0
    }));

    // Create workbook and worksheet
    const ws = XLSX.utils.json_to_sheet(excelData);
    const wb = XLSX.utils.book_new();
    
    // Add worksheet to workbook
    XLSX.utils.book_append_sheet(wb, ws, 'ข้อมูลประเภทโพสต์');

    // Set column widths
    const colWidths = [
      { wch: 8 },   // ลำดับ
      { wch: 25 },  // ชื่อประเภท
      { wch: 20 },  // Slug
      { wch: 15 },  // สี
      { wch: 40 },  // รายละเอียด
      { wch: 15 }   // จำนวนบทความ
    ];
    ws['!cols'] = colWidths;

    // Generate filename with timestamp
    const timestamp = new Date().toISOString().slice(0, 19).replace(/[:-]/g, '');
    const filename = `CivicSpace_PostTypes_${timestamp}.xlsx`;

    // Save file
    XLSX.writeFile(wb, filename);
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
    <div className="min-h-screen bg-gray-50">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 rounded-lg flex items-center justify-center border border-gray-300">
                <FileText className="w-6 h-6 text-gray-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 mb-1">
                  ตารางข้อมูลระบบ
                </h1>
                <p className="text-sm text-gray-600">
                  จัดการและส่งออกข้อมูลบทความและหมวดหมู่
                </p>
              </div>
            </div>
            
            {/* Navigation Links */}
            <div className="flex items-center space-x-3">
              <Link 
                href="/dashboard"
                className="flex items-center space-x-2 px-4 py-2 text-sm text-gray-600 hover:text-gray-900 border border-gray-300 rounded-lg hover:border-gray-400 transition-colors"
              >
                <BarChart3 className="w-4 h-4" />
                <span>แดชบอร์ด</span>
              </Link>
              <Link 
                href="/"
                className="flex items-center space-x-2 px-4 py-2 text-sm text-gray-600 hover:text-gray-900 border border-gray-300 rounded-lg hover:border-gray-400 transition-colors"
              >
                <Home className="w-4 h-4" />
                <span>กลับหน้าแรก</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8 px-6" aria-label="Tabs">
              <button
                onClick={() => setActiveTab('posts')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'posts'
                    ? 'border-yellow-500 text-yellow-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                บทความ ({posts.length})
              </button>
              <button
                onClick={() => setActiveTab('categories')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'categories'
                    ? 'border-yellow-500 text-yellow-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                หมวดหมู่ ({categories.length})
              </button>
              <button
                onClick={() => setActiveTab('post-types')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'post-types'
                    ? 'border-yellow-500 text-yellow-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                ประเภทโพสต์ ({postTypes.length})
              </button>
            </nav>
          </div>
        </div>

        {/* Controls - Posts Tab */}
        {activeTab === 'posts' && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              {/* Search */}
              <div className="flex-1 max-w-md">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="ค้นหาบทความ, ผู้เขียน, หมวดหมู่..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Category Filter */}
              <div className="flex items-center space-x-4">
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                >
                  <option value="all">หมวดหมู่ทั้งหมด</option>
                  {postCategories.map((category) => (
                    <option key={category?.slug} value={category?.slug}>
                      {category?.name}
                    </option>
                  ))}
                </select>

                {/* Export Button */}
                <button
                  onClick={exportToExcel}
                  className="flex items-center space-x-2 px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors"
                >
                  <Download className="w-4 h-4" />
                  <span>ส่งออก Excel</span>
                </button>
              </div>
            </div>

            {/* Stats */}
            <div className="mt-4 flex items-center space-x-6 text-sm text-gray-600">
              <span>แสดง <span className="font-semibold text-gray-900">{filteredPosts.length}</span> รายการ</span>
              <span>จากทั้งหมด <span className="font-semibold text-gray-900">{posts.length}</span> บทความ</span>
            </div>
          </div>
        )}

        {/* Controls - Categories Tab */}
        {activeTab === 'categories' && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div className="flex-1">
                <h3 className="text-lg font-medium text-gray-900 mb-1">หมวดหมู่ทั้งหมด</h3>
                <p className="text-sm text-gray-600">รายการหมวดหมู่และจำนวนบทความในแต่ละหมวดหมู่</p>
              </div>

              {/* Export Button */}
              <button
                onClick={exportCategoriesToExcel}
                className="flex items-center space-x-2 px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors"
              >
                <Download className="w-4 h-4" />
                <span>ส่งออก Excel</span>
              </button>
            </div>

            {/* Stats */}
            <div className="mt-4 flex items-center space-x-6 text-sm text-gray-600">
              <span>แสดง <span className="font-semibold text-gray-900">{categories.length}</span> หมวดหมู่</span>
              <span>รวมบทความ <span className="font-semibold text-gray-900">{categories.reduce((sum, cat) => sum + (cat.post_count || 0), 0)}</span> บทความ</span>
            </div>
          </div>
        )}

        {/* Controls - Post Types Tab */}
        {activeTab === 'post-types' && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div className="flex-1">
                <h3 className="text-lg font-medium text-gray-900 mb-1">ประเภทโพสต์ทั้งหมด</h3>
                <p className="text-sm text-gray-600">รายการประเภทโพสต์และจำนวนบทความในแต่ละประเภท</p>
              </div>

              {/* Export Button */}
              <button
                onClick={exportPostTypesToExcel}
                className="flex items-center space-x-2 px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors"
              >
                <Download className="w-4 h-4" />
                <span>ส่งออก Excel</span>
              </button>
            </div>

            {/* Stats */}
            <div className="mt-4 flex items-center space-x-6 text-sm text-gray-600">
              <span>แสดง <span className="font-semibold text-gray-900">{postTypes.length}</span> ประเภทโพสต์</span>
              <span>รวมบทความ <span className="font-semibold text-gray-900">{postTypes.reduce((sum, type) => sum + (type.post_count || 0), 0)}</span> บทความ</span>
            </div>
          </div>
        )}

        {/* Posts Data Table */}
        {activeTab === 'posts' && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      #
                    </th>
                    <th 
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSort('title')}
                    >
                      <div className="flex items-center space-x-1">
                        <span>ชื่อบทความ</span>
                        <ArrowUpDown className="w-4 h-4" />
                      </div>
                    </th>
                    <th 
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSort('category' as keyof Post)}
                    >
                      <div className="flex items-center space-x-1">
                        <span>หมวดหมู่</span>
                        <ArrowUpDown className="w-4 h-4" />
                      </div>
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      ประเภท
                    </th>
                    <th 
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSort('view_count')}
                    >
                      <div className="flex items-center space-x-1">
                        <span>การเข้าชม</span>
                        <ArrowUpDown className="w-4 h-4" />
                      </div>
                    </th>
                    <th 
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSort('created_at')}
                    >
                      <div className="flex items-center space-x-1">
                        <span>วันที่สร้าง</span>
                        <ArrowUpDown className="w-4 h-4" />
                      </div>
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      แท็ก
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      จัดการ
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredPosts.map((post, index) => (
                    <tr key={post.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {index + 1}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-3">
                          {/* Thumbnail */}
                          <div className="flex-shrink-0 w-12 h-12 rounded-lg overflow-hidden bg-gray-100">
                            {post.featured_image_url ? (
                              <Image
                                src={post.featured_image_url}
                                alt={post.title}
                                width={48}
                                height={48}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                                <FileText className="w-5 h-5 text-gray-400" />
                              </div>
                            )}
                          </div>
                          
                          {/* Title */}
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-medium text-gray-900 line-clamp-2">
                              {post.title}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                          {post.category.name}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {post.post_type ? (
                          <span 
                            className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                            style={{
                              backgroundColor: post.post_type.color ? `${post.post_type.color}20` : '#f3f4f6',
                              color: post.post_type.color || '#374151'
                            }}
                          >
                            {post.post_type.name}
                          </span>
                        ) : (
                          <span className="text-xs text-gray-400">ไม่ระบุ</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div className="flex items-center">
                          <Activity className="w-4 h-4 text-gray-400 mr-1" />
                          {post.view_count?.toLocaleString() || 0}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div className="flex items-center">
                          <Calendar className="w-4 h-4 text-gray-400 mr-1" />
                          {formatDate(post.created_at)}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="max-w-xs">
                          <div className="flex flex-wrap gap-1">
                            {post.tags.slice(0, 3).map((tag) => (
                              <span
                                key={tag.id}
                                className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800"
                              >
                                {tag.name}
                              </span>
                            ))}
                            {post.tags.length > 3 && (
                              <span className="text-xs text-gray-500">
                                +{post.tags.length - 3}
                              </span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <Link 
                          href={`/post/${post.slug}`}
                          className="text-yellow-600 hover:text-yellow-900"
                        >
                          ดูบทความ
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Categories Data Table */}
        {activeTab === 'categories' && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      #
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      ชื่อหมวดหมู่
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Slug
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      รายละเอียด
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      จำนวนบทความ
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {categories.map((category, index) => (
                    <tr key={category.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {index + 1}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {category.name}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <code className="bg-gray-100 px-2 py-1 rounded text-xs">
                          {category.slug}
                        </code>
                      </td>
                      <td className="px-6 py-4">
                        <div className="max-w-xs">
                          <div className="text-sm text-gray-900">
                            {category.description || 'ไม่มีรายละเอียด'}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          <FileText className="w-3 h-3 mr-1" />
                          {category.post_count || 0} บทความ
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Post Types Data Table */}
        {activeTab === 'post-types' && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      #
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      ชื่อประเภท
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Slug
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      สี
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      รายละเอียด
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      จำนวนบทความ
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {postTypes.map((postType, index) => (
                    <tr key={postType.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {index + 1}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {postType.name}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <code className="bg-gray-100 px-2 py-1 rounded text-xs">
                          {postType.slug}
                        </code>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {postType.color ? (
                          <div className="flex items-center space-x-2">
                            <div 
                              className="w-4 h-4 rounded-full border border-gray-300" 
                              style={{ backgroundColor: postType.color }}
                            ></div>
                            <code className="text-xs">{postType.color}</code>
                          </div>
                        ) : (
                          <span className="text-xs text-gray-400">ไม่มี</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="max-w-xs">
                          <div className="text-sm text-gray-900">
                            {postType.description || 'ไม่มีรายละเอียด'}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          <FileText className="w-3 h-3 mr-1" />
                          {postType.post_count || 0} บทความ
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Empty State */}
        {activeTab === 'posts' && filteredPosts.length === 0 && !loading && (
          <div className="text-center py-12">
            <FileText className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">ไม่พบข้อมูล</h3>
            <p className="mt-1 text-sm text-gray-500">
              ไม่พบบทความที่ตรงกับเงื่อนไขการค้นหา
            </p>
          </div>
        )}

        {activeTab === 'categories' && categories.length === 0 && !loading && (
          <div className="text-center py-12">
            <FileText className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">ไม่พบหมวดหมู่</h3>
            <p className="mt-1 text-sm text-gray-500">
              ยังไม่มีหมวดหมู่ในระบบ
            </p>
          </div>
        )}

        {activeTab === 'post-types' && postTypes.length === 0 && !loading && (
          <div className="text-center py-12">
            <FileText className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">ไม่พบประเภทโพสต์</h3>
            <p className="mt-1 text-sm text-gray-500">
              ยังไม่มีประเภทโพสต์ในระบบ
            </p>
          </div>
        )}
      </main>
    </div>
  );
}