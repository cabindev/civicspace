// dashboard/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { 
  BarChart3, 
  Users, 
  FileText, 
  TrendingUp, 
  Activity,
  Calendar,
  Globe,
  ArrowUpRight,
  Home
} from 'lucide-react';
import Loading from '../components/Loading';

interface DashboardStats {
  totalPosts: number;
  totalCategories: number;
  totalViews: number;
  popularPosts: Array<{
    id: number;
    title: string;
    slug: string;
    view_count: number;
    created_at: string;
  }>;
  recentCategories: Array<{
    id: number;
    name: string;
    post_count: number;
  }>;
}

const API_BASE = 'https://civicspace-gqdcg0dxgjbqe8as.southeastasia-01.azurewebsites.net/api/v1';

export default function Dashboard() {
  const { data: session, status } = useSession();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === 'loading') return;
    if (!session) {
      redirect('/auth/signin');
    }
  }, [session, status]);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [postsRes, categoriesRes, popularRes] = await Promise.all([
          fetch(`${API_BASE}/posts/`),
          fetch(`${API_BASE}/categories/`),
          fetch(`${API_BASE}/posts/popular/?limit=5`)
        ]);

        const [posts, categories, popular] = await Promise.all([
          postsRes.json(),
          categoriesRes.json(),
          popularRes.json()
        ]);

        const totalViews = popular.reduce((sum: number, post: any) => sum + post.view_count, 0);

        setStats({
          totalPosts: posts.count || posts.length || 0,
          totalCategories: categories.count || categories.results?.length || 0,
          totalViews,
          popularPosts: popular.slice(0, 5),
          recentCategories: categories.results?.slice(0, 6) || []
        });
      } catch (error) {
        console.error('Error fetching dashboard stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('th-TH', {
      month: 'short',
      day: 'numeric'
    });
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
        {/* Welcome */}
        <div className="mb-8">
          <div className="flex items-center space-x-4 mb-4">
            <div className="w-12 h-12 bg-yellow-500 rounded-lg flex items-center justify-center">
              <BarChart3 className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xs font-bold text-gray-900 mb-1">
                แดชบอร์ด - สวัสดี {session.user?.firstName || 'เจ้าหน้าที่'}
              </h1>
              <p className="text-xs text-gray-600">
                ภาพรวมข้อมูลและสถิติการใช้งาน CivicSpace
              </p>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <FileText className="w-6 h-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-xs font-medium text-gray-600">บทความทั้งหมด</p>
                <p className="text-lg font-bold text-gray-900">{stats?.totalPosts || 0}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Users className="w-6 h-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-xs font-medium text-gray-600">หมวดหมู่</p>
                <p className="text-lg font-bold text-gray-900">{stats?.totalCategories || 0}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Activity className="w-6 h-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-xs font-medium text-gray-600">การเข้าชมรวม</p>
                <p className="text-lg font-bold text-gray-900">{stats?.totalViews?.toLocaleString() || 0}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Globe className="w-6 h-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-xs font-medium text-gray-600">บทความยอดนิยม</p>
                <p className="text-lg font-bold text-gray-900">{stats?.popularPosts?.length || 0}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Popular Posts */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-xs font-bold text-gray-900">บทความยอดนิยม</h2>
                <TrendingUp className="w-5 h-5 text-yellow-600" />
              </div>
              <div className="flex items-center gap-4 text-xs text-gray-600">
                <span>
                  แสดง <span className="font-semibold text-gray-900">{stats?.popularPosts.length || 0}</span> บทความ
                </span>
                <span>•</span>
                <span>
                  รวมการเข้าชม <span className="font-semibold text-gray-900">
                    {stats?.popularPosts.reduce((sum, post) => sum + post.view_count, 0).toLocaleString() || 0}
                  </span> ครั้ง
                </span>
              </div>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {stats?.popularPosts.map((post, index) => (
                  <Link key={post.id} href={`/post/${post.slug}`}>
                    <div className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors group cursor-pointer">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-yellow-500 text-white rounded-full flex items-center justify-center text-sm font-medium">
                          {index + 1}
                        </div>
                        <div className="flex-1">
                          <h3 className="text-xs font-medium text-gray-900 group-hover:text-gray-600 transition-colors line-clamp-2">
                            {post.title}
                          </h3>
                          <p className="text-xs text-gray-500">
                            {formatDate(post.created_at)}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-xs font-medium text-gray-900">
                          {post.view_count.toLocaleString()}
                        </span>
                        <ArrowUpRight className="w-4 h-4 text-yellow-400 group-hover:text-yellow-600 transition-colors" />
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>

          {/* Categories Overview */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-xs font-bold text-gray-900">หมวดหมู่</h2>
                <Users className="w-5 h-5 text-yellow-600" />
              </div>
              <div className="flex items-center gap-4 text-xs text-gray-600">
                <span>
                  ทั้งหมด <span className="font-semibold text-gray-900">{stats?.totalCategories || 0}</span> หมวดหมู่
                </span>
                <span>•</span>
                <span>
                  รวม <span className="font-semibold text-gray-900">
                    {stats?.recentCategories.reduce((sum, cat) => sum + cat.post_count, 0) || 0}
                  </span> บทความ
                </span>
              </div>
            </div>
            <div className="p-6">
              <div className="space-y-3">
                {stats?.recentCategories.map((category) => (
                  <div key={category.id} className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center">
                        <FileText className="w-4 h-4 text-yellow-600" />
                      </div>
                      <div>
                        <h3 className="text-xs font-medium text-gray-900">
                          {category.name}
                        </h3>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                        {category.post_count} บทความ
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-12">
          <h2 className="text-xs font-bold text-gray-900 mb-6">ลิงก์ที่มีประโยชน์</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <Link href={`${API_BASE}/posts/`} target="_blank" rel="noopener noreferrer">
              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 text-center hover:shadow-md hover:border-yellow-300 transition-all group cursor-pointer">
                <Globe className="w-8 h-8 text-yellow-600 mx-auto mb-3 group-hover:scale-110 transition-transform" />
                <h3 className="text-xs font-medium text-gray-900 mb-2 group-hover:text-yellow-600 transition-colors">API บทความ</h3>
                <p className="text-xs text-gray-600">จัดการบทความในระบบ</p>
                <p className="text-xs text-yellow-500 mt-2">คลิกเพื่อเปิด API</p>
              </div>
            </Link>

            <Link href={`${API_BASE}/categories/`} target="_blank" rel="noopener noreferrer">
              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 text-center hover:shadow-md hover:border-yellow-300 transition-all group cursor-pointer">
                <FileText className="w-8 h-8 text-yellow-600 mx-auto mb-3 group-hover:scale-110 transition-transform" />
                <h3 className="text-xs font-medium text-gray-900 mb-2 group-hover:text-yellow-600 transition-colors">API หมวดหมู่</h3>
                <p className="text-xs text-gray-600">จัดการหมวดหมู่บทความ</p>
                <p className="text-xs text-yellow-500 mt-2">คลิกเพื่อเปิด API</p>
              </div>
            </Link>

            <Link href={`${API_BASE}/tags/`} target="_blank" rel="noopener noreferrer">
              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 text-center hover:shadow-md hover:border-yellow-300 transition-all group cursor-pointer">
                <Users className="w-8 h-8 text-yellow-600 mx-auto mb-3 group-hover:scale-110 transition-transform" />
                <h3 className="text-xs font-medium text-gray-900 mb-2 group-hover:text-yellow-600 transition-colors">API แท็ก</h3>
                <p className="text-xs text-gray-600">จัดการแท็กบทความ</p>
                <p className="text-xs text-yellow-500 mt-2">คลิกเพื่อเปิด API</p>
              </div>
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}