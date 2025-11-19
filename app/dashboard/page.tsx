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
  Globe,
  ArrowUpRight,
  Home,
  Video,
  ClipboardList,
  Eye,
  Calendar
} from 'lucide-react';
import Loading from '../components/Loading';

interface Post {
  id: number;
  title: string;
  slug: string;
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
    icon: string;
  };
  view_count: number;
  created_at: string;
}

interface Video {
  id: number;
  title: string;
  slug: string;
  video_url: string;
  view_count: number;
  created_at: string;
}

interface Survey {
  id: number;
  title: string;
  slug: string;
  response_count: number;
  view_count: number;
  survey_date: string;
  created_at: string;
}

interface Category {
  id: number;
  name: string;
  slug: string;
  description?: string;
  post_count: number;
  video_count: number;
  survey_count: number;
  total_count: number;
}

interface DashboardStats {
  posts: {
    total: number;
    totalViews: number;
    popular: Post[];
    recent: Post[];
  };
  videos: {
    total: number;
    totalViews: number;
    popular: Video[];
    recent: Video[];
  };
  surveys: {
    total: number;
    totalViews: number;
    totalResponses: number;
    popular: Survey[];
    recent: Survey[];
  };
  categories: {
    total: number;
    list: Category[];
  };
}

const API_BASE = 'https://civicspace-gqdcg0dxgjbqe8as.southeastasia-01.azurewebsites.net/api/v1';

export default function Dashboard() {
  const { data: session, status } = useSession();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'posts' | 'videos' | 'surveys'>('overview');

  useEffect(() => {
    if (status === 'loading') return;
    if (!session) {
      redirect('/auth/signin');
    }
  }, [session, status]);

  useEffect(() => {
    const fetchAllStats = async () => {
      try {
        // Fetch all data in parallel
        const [postsRes, videosRes, surveysRes, categoriesRes, popularPostsRes, popularVideosRes, popularSurveysRes] = await Promise.all([
          fetch(`/api/post?page=1&page_size=1000`),
          fetch(`/api/videos?page=1&page_size=1000`),
          fetch(`/api/surveys?type=latest&limit=1000`),
          fetch(`/api/categories`),
          fetch(`/api/post?type=popular&limit=10`),
          fetch(`/api/videos?type=popular&limit=10`),
          fetch(`/api/surveys?type=popular&limit=10`)
        ]);

        const [postsData, videosData, surveysData, categoriesData, popularPosts, popularVideos, popularSurveys] = await Promise.all([
          postsRes.json(),
          videosRes.json(),
          surveysRes.json(),
          categoriesRes.json(),
          popularPostsRes.json(),
          popularVideosRes.json(),
          popularSurveysRes.json()
        ]);

        console.log('Dashboard Data:', { postsData, videosData, surveysData, categoriesData });

        // Process posts
        const allPosts = postsData.results || postsData || [];
        const postsTotal = postsData.count || allPosts.length || 0;
        const postsTotalViews = allPosts.reduce((sum: number, post: any) => sum + (post.view_count || 0), 0);

        // Process videos
        const allVideos = videosData.results || videosData || [];
        const videosTotal = videosData.count || allVideos.length || 0;
        const videosTotalViews = allVideos.reduce((sum: number, video: any) => sum + (video.view_count || 0), 0);

        // Process surveys
        const allSurveys = Array.isArray(surveysData) ? surveysData : (surveysData.results || []);
        const surveysTotal = allSurveys.length;
        const surveysTotalViews = allSurveys.reduce((sum: number, survey: any) => sum + (survey.view_count || 0), 0);
        const surveysTotalResponses = allSurveys.reduce((sum: number, survey: any) => sum + (survey.response_count || 0), 0);

        // Process categories
        const allCategories = categoriesData.results || categoriesData || [];
        const categoriesTotal = categoriesData.count || allCategories.length || 0;

        // Log first category to check API response structure
        if (allCategories.length > 0) {
          console.log('📊 Sample category data:', allCategories[0]);
        }

        // Ensure arrays for popular content
        const popularPostsArray = Array.isArray(popularPosts) ? popularPosts : [];
        const popularVideosArray = Array.isArray(popularVideos) ? popularVideos : (popularVideos?.results || []);
        const popularSurveysArray = Array.isArray(popularSurveys) ? popularSurveys : [];

        setStats({
          posts: {
            total: postsTotal,
            totalViews: postsTotalViews,
            popular: popularPostsArray.slice(0, 10),
            recent: allPosts.slice(0, 10)
          },
          videos: {
            total: videosTotal,
            totalViews: videosTotalViews,
            popular: popularVideosArray.slice(0, 10),
            recent: allVideos.slice(0, 10)
          },
          surveys: {
            total: surveysTotal,
            totalViews: surveysTotalViews,
            totalResponses: surveysTotalResponses,
            popular: popularSurveysArray.slice(0, 10),
            recent: allSurveys.slice(0, 10)
          },
          categories: {
            total: categoriesTotal,
            list: allCategories.slice(0, 12)
          }
        });
      } catch (error) {
        console.error('Error fetching dashboard stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAllStats();
  }, []);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('th-TH', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toLocaleString();
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

  const totalContent = (stats?.posts.total || 0) + (stats?.videos.total || 0) + (stats?.surveys.total || 0);
  const totalViews = (stats?.posts.totalViews || 0) + (stats?.videos.totalViews || 0) + (stats?.surveys.totalViews || 0);

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <Link href="/" className="flex items-center space-x-4 hover:opacity-80 transition-opacity">
              <div className="w-14 h-14 rounded-lg flex items-center justify-center bg-gray-900">
                <BarChart3 className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 mb-1">
                  แดชบอร์ด CivicSpace
                </h1>
                <p className="text-sm text-gray-600">
                  สวัสดี {session.user?.firstName || 'เจ้าหน้าที่'} • {formatDate(new Date().toISOString())}
                </p>
              </div>
            </Link>

            <div className="flex items-center space-x-3">
              <Link
                href="/"
                className="flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 bg-white border-2 border-gray-200 rounded-lg hover:border-gray-900 hover:shadow-sm transition-all"
              >
                <Home className="w-4 h-4" />
                <span>หน้าแรก</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Overview Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {/* Total Content */}
          <div className="bg-white border-2 border-gray-200 rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-gray-100 rounded-lg">
                <FileText className="w-6 h-6 text-gray-700" />
              </div>
              <TrendingUp className="w-5 h-5 text-gray-400" />
            </div>
            <p className="text-sm font-medium text-gray-600 mb-1">เนื้อหาทั้งหมด</p>
            <p className="text-3xl font-bold text-gray-900 mb-2">{formatNumber(totalContent)}</p>
            <div className="flex items-center text-xs text-gray-500">
              <span>{stats?.posts.total} โพสต์ • {stats?.videos.total} วิดีโอ • {stats?.surveys.total} แบบสำรวจ</span>
            </div>
          </div>

          {/* Total Views */}
          <div className="bg-white border-2 border-gray-200 rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-gray-100 rounded-lg">
                <Eye className="w-6 h-6 text-gray-700" />
              </div>
              <Activity className="w-5 h-5 text-gray-400" />
            </div>
            <p className="text-sm font-medium text-gray-600 mb-1">การเข้าชมรวม</p>
            <p className="text-3xl font-bold text-gray-900 mb-2">{formatNumber(totalViews)}</p>
            <div className="flex items-center text-xs text-gray-500">
              <span>จากทุกประเภทเนื้อหา</span>
            </div>
          </div>

          {/* Categories */}
          <div className="bg-white border-2 border-gray-200 rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-gray-100 rounded-lg">
                <Users className="w-6 h-6 text-gray-700" />
              </div>
              <Globe className="w-5 h-5 text-gray-400" />
            </div>
            <p className="text-sm font-medium text-gray-600 mb-1">ประเด็น</p>
            <p className="text-3xl font-bold text-gray-900 mb-2">{stats?.categories.total || 0}</p>
            <div className="flex items-center text-xs text-gray-500">
              <span>ครอบคลุมทุกประเด็น</span>
            </div>
          </div>
        </div>

        {/* Tabs Navigation */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-8">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6" aria-label="Tabs">
              <button
                type="button"
                onClick={() => setActiveTab('overview')}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'overview'
                    ? 'border-gray-900 text-gray-900'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <BarChart3 className="w-4 h-4" />
                  <span>ภาพรวม</span>
                </div>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('posts')}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'posts'
                    ? 'border-gray-900 text-gray-900'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <FileText className="w-4 h-4" />
                  <span>โพสต์ ({stats?.posts.total})</span>
                </div>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('videos')}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'videos'
                    ? 'border-gray-900 text-gray-900'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <Video className="w-4 h-4" />
                  <span>วิดีโอ ({stats?.videos.total})</span>
                </div>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('surveys')}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'surveys'
                    ? 'border-gray-900 text-gray-900'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <ClipboardList className="w-4 h-4" />
                  <span>แบบสำรวจ ({stats?.surveys.total})</span>
                </div>
              </button>
            </nav>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <div className="space-y-8">
                {/* Popular Content Grid */}
                <div className="grid lg:grid-cols-3 gap-6">
                  {/* Popular Posts */}
                  <div className="bg-white rounded-lg p-5 border-2 border-gray-200">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-sm font-bold text-gray-900 flex items-center">
                        <FileText className="w-4 h-4 mr-2 text-gray-700" />
                        โพสต์ยอดนิยม
                      </h3>
                      <Link href="/dashboard/posts" className="text-xs text-gray-600 hover:text-gray-900">
                        ดูทั้งหมด →
                      </Link>
                    </div>
                    <div className="space-y-2">
                      {stats?.posts.popular.slice(0, 5).map((post, index) => (
                        <Link key={post.id} href={`/post/${post.slug}`}>
                          <div className="flex items-start space-x-3 p-2 rounded-lg hover:bg-gray-50 transition-colors group cursor-pointer border border-transparent hover:border-gray-200">
                            <div className="w-6 h-6 bg-gray-900 text-white rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">
                              {index + 1}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-medium text-gray-900 line-clamp-2 group-hover:text-gray-700">
                                {post.title}
                              </p>
                              <div className="flex items-center gap-2 mt-1">
                                {post.post_type && (
                                  <span className="text-xs px-1.5 py-0.5 bg-gray-100 text-gray-700 rounded">
                                    {post.post_type.icon} {post.post_type.name}
                                  </span>
                                )}
                                <span className="text-xs text-gray-500">
                                  <Eye className="w-3 h-3 inline mr-1" />
                                  {formatNumber(post.view_count)} ครั้ง
                                </span>
                              </div>
                            </div>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>

                  {/* Popular Videos */}
                  <div className="bg-white rounded-lg p-5 border-2 border-gray-200">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-sm font-bold text-gray-900 flex items-center">
                        <Video className="w-4 h-4 mr-2 text-gray-700" />
                        วิดีโอยอดนิยม
                      </h3>
                      <span className="text-xs text-gray-500">
                        {stats?.videos.total} รายการ
                      </span>
                    </div>
                    <div className="space-y-2">
                      {stats?.videos.popular.slice(0, 5).map((video, index) => (
                        <div key={video.id} className="flex items-start space-x-3 p-2 rounded-lg hover:bg-gray-50 transition-colors group border border-transparent hover:border-gray-200">
                          <div className="w-6 h-6 bg-gray-900 text-white rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">
                            {index + 1}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-medium text-gray-900 line-clamp-2 group-hover:text-gray-700">
                              {video.title}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                              <Eye className="w-3 h-3 inline mr-1" />
                              {formatNumber(video.view_count)} ครั้ง
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Popular Surveys */}
                  <div className="bg-white rounded-lg p-5 border-2 border-gray-200">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-sm font-bold text-gray-900 flex items-center">
                        <ClipboardList className="w-4 h-4 mr-2 text-gray-700" />
                        แบบสำรวจยอดนิยม
                      </h3>
                      <Link href="/dashboard/surveys" className="text-xs text-gray-600 hover:text-gray-900">
                        ดูทั้งหมด →
                      </Link>
                    </div>
                    <div className="space-y-2">
                      {stats?.surveys.popular.slice(0, 5).map((survey, index) => (
                        <div key={survey.id} className="flex items-start space-x-3 p-2 rounded-lg hover:bg-gray-50 transition-colors group border border-transparent hover:border-gray-200">
                          <div className="w-6 h-6 bg-gray-900 text-white rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">
                            {index + 1}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-medium text-gray-900 line-clamp-2 group-hover:text-gray-700">
                              {survey.title}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                              <Eye className="w-3 h-3 inline mr-1" />
                              {formatNumber(survey.view_count)} ครั้ง
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Categories Overview */}
                <div className="bg-white rounded-lg border-2 border-gray-200 p-6">
                  <div className="flex items-center justify-between mb-5">
                    <h3 className="text-lg font-bold text-gray-900 flex items-center">
                      <Users className="w-5 h-5 mr-2 text-gray-700" />
                      ประเด็นทั้งหมด
                    </h3>
                    <Link href="/dashboard/categories" className="text-sm text-gray-600 hover:text-gray-900 flex items-center">
                      จัดการ <ArrowUpRight className="w-4 h-4 ml-1" />
                    </Link>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {stats?.categories.list.map((category) => (
                      <div key={category.id} className="p-4 bg-gray-50 rounded-lg border border-gray-200 hover:border-gray-900 hover:shadow-sm transition-all">
                        <div className="mb-3">
                          <div className="flex items-center space-x-2 mb-2">
                            <div className="w-8 h-8 bg-gray-200 rounded-lg flex items-center justify-center flex-shrink-0">
                              <FileText className="w-4 h-4 text-gray-700" />
                            </div>
                            <h4 className="text-sm font-medium text-gray-900 truncate flex-1">
                              {category.name}
                            </h4>
                          </div>
                        </div>
                        <div className="space-y-1">
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-gray-600">โพสต์</span>
                            <span className="font-medium text-gray-900">{category.post_count || 0}</span>
                          </div>
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-gray-600">วิดีโอ</span>
                            <span className="font-medium text-gray-900">{category.video_count || 0}</span>
                          </div>
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-gray-600">แบบสำรวจ</span>
                            <span className="font-medium text-gray-900">{category.survey_count || 0}</span>
                          </div>
                          <div className="flex items-center justify-between text-xs pt-1 border-t border-gray-200">
                            <span className="text-gray-700 font-medium">รวม</span>
                            <span className="font-bold text-gray-900">{category.total_count || category.post_count || 0}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Posts Tab */}
            {activeTab === 'posts' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">โพสต์ทั้งหมด</h3>
                    <p className="text-sm text-gray-600 mt-1">
                      ทั้งหมด {stats?.posts.total} โพสต์ • การเข้าชมรวม {formatNumber(stats?.posts.totalViews || 0)} ครั้ง
                    </p>
                  </div>
                  <Link
                    href="/dashboard/posts"
                    className="px-4 py-2 bg-gray-900 text-white text-sm rounded-lg hover:bg-gray-700 transition-colors flex items-center space-x-2"
                  >
                    <span>จัดการโพสต์</span>
                    <ArrowUpRight className="w-4 h-4" />
                  </Link>
                </div>

                <div className="grid lg:grid-cols-2 gap-6">
                  <div>
                    <h4 className="text-sm font-semibold text-gray-900 mb-3">โพสต์ยอดนิยม</h4>
                    <div className="space-y-2">
                      {stats?.posts.popular.map((post, index) => (
                        <Link key={post.id} href={`/post/${post.slug}`}>
                          <div className="p-4 bg-gray-50 rounded-lg border border-gray-200 hover:border-blue-300 hover:shadow-sm transition-all group">
                            <div className="flex items-start justify-between">
                              <div className="flex items-start space-x-3 flex-1">
                                <span className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">
                                  {index + 1}
                                </span>
                                <div className="flex-1 min-w-0">
                                  <h5 className="text-sm font-medium text-gray-900 group-hover:text-blue-600 line-clamp-2 mb-2">
                                    {post.title}
                                  </h5>
                                  <div className="flex items-center flex-wrap gap-2 text-xs text-gray-500">
                                    {post.post_type && (
                                      <span className="px-2 py-0.5 bg-gray-100 text-gray-700 rounded">
                                        {post.post_type.icon} {post.post_type.name}
                                      </span>
                                    )}
                                    <span className="flex items-center">
                                      <Eye className="w-3 h-3 mr-1" />
                                      {formatNumber(post.view_count)}
                                    </span>
                                    <span>•</span>
                                    <span className="px-2 py-0.5 bg-gray-100 text-gray-700 rounded">
                                      {post.category.name}
                                    </span>
                                    <span>•</span>
                                    <span className="flex items-center">
                                      <Calendar className="w-3 h-3 mr-1" />
                                      {formatDate(post.created_at)}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="text-sm font-semibold text-gray-900 mb-3">โพสต์ล่าสุด</h4>
                    <div className="space-y-2">
                      {stats?.posts.recent.map((post) => (
                        <Link key={post.id} href={`/post/${post.slug}`}>
                          <div className="p-4 bg-gray-50 rounded-lg border border-gray-200 hover:border-blue-300 hover:shadow-sm transition-all group">
                            <div className="flex items-start justify-between">
                              <div className="flex-1 min-w-0">
                                <h5 className="text-sm font-medium text-gray-900 group-hover:text-blue-600 line-clamp-2 mb-2">
                                  {post.title}
                                </h5>
                                <div className="flex items-center flex-wrap gap-2 text-xs text-gray-500">
                                  {post.post_type && (
                                    <span className="px-2 py-0.5 bg-gray-100 text-gray-700 rounded">
                                      {post.post_type.icon} {post.post_type.name}
                                    </span>
                                  )}
                                  <span className="flex items-center">
                                    <Eye className="w-3 h-3 mr-1" />
                                    {formatNumber(post.view_count)}
                                  </span>
                                  <span>•</span>
                                  <span className="px-2 py-0.5 bg-gray-100 text-gray-700 rounded">
                                    {post.category.name}
                                  </span>
                                  <span>•</span>
                                  <span className="flex items-center">
                                    <Calendar className="w-3 h-3 mr-1" />
                                    {formatDate(post.created_at)}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Videos Tab */}
            {activeTab === 'videos' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">วิดีโอทั้งหมด</h3>
                    <p className="text-sm text-gray-600 mt-1">
                      ทั้งหมด {stats?.videos.total} วิดีโอ • การเข้าชมรวม {formatNumber(stats?.videos.totalViews || 0)} ครั้ง
                    </p>
                  </div>
                </div>

                <div className="grid lg:grid-cols-2 gap-6">
                  <div>
                    <h4 className="text-sm font-semibold text-gray-900 mb-3">วิดีโอยอดนิยม</h4>
                    <div className="space-y-2">
                      {stats?.videos.popular.map((video, index) => (
                        <div key={video.id} className="p-4 bg-gray-50 rounded-lg border border-gray-200 hover:border-purple-300 hover:shadow-sm transition-all group">
                          <div className="flex items-start space-x-3">
                            <span className="w-6 h-6 bg-purple-500 text-white rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">
                              {index + 1}
                            </span>
                            <div className="flex-1 min-w-0">
                              <h5 className="text-sm font-medium text-gray-900 group-hover:text-purple-600 line-clamp-2 mb-2">
                                {video.title}
                              </h5>
                              <div className="flex items-center space-x-3 text-xs text-gray-500">
                                <span className="flex items-center">
                                  <Eye className="w-3 h-3 mr-1" />
                                  {formatNumber(video.view_count)}
                                </span>
                                <span>•</span>
                                <span className="flex items-center">
                                  <Calendar className="w-3 h-3 mr-1" />
                                  {formatDate(video.created_at)}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="text-sm font-semibold text-gray-900 mb-3">วิดีโอล่าสุด</h4>
                    <div className="space-y-2">
                      {stats?.videos.recent.map((video) => (
                        <div key={video.id} className="p-4 bg-gray-50 rounded-lg border border-gray-200 hover:border-purple-300 hover:shadow-sm transition-all group">
                          <div className="flex items-start space-x-3">
                            <div className="flex-1 min-w-0">
                              <h5 className="text-sm font-medium text-gray-900 group-hover:text-purple-600 line-clamp-2 mb-2">
                                {video.title}
                              </h5>
                              <div className="flex items-center space-x-3 text-xs text-gray-500">
                                <span className="flex items-center">
                                  <Eye className="w-3 h-3 mr-1" />
                                  {formatNumber(video.view_count)}
                                </span>
                                <span>•</span>
                                <span className="flex items-center">
                                  <Calendar className="w-3 h-3 mr-1" />
                                  {formatDate(video.created_at)}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Surveys Tab */}
            {activeTab === 'surveys' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">แบบสำรวจทั้งหมด</h3>
                    <p className="text-sm text-gray-600 mt-1">
                      ทั้งหมด {stats?.surveys.total} แบบสำรวจ • การเข้าชมรวม {formatNumber(stats?.surveys.totalViews || 0)} ครั้ง
                    </p>
                  </div>
                  <Link
                    href="/dashboard/surveys"
                    className="px-4 py-2 bg-gray-900 text-white text-sm rounded-lg hover:bg-gray-700 transition-colors flex items-center space-x-2"
                  >
                    <span>จัดการแบบสำรวจ</span>
                    <ArrowUpRight className="w-4 h-4" />
                  </Link>
                </div>

                <div className="grid lg:grid-cols-2 gap-6">
                  <div>
                    <h4 className="text-sm font-semibold text-gray-900 mb-3">แบบสำรวจยอดนิยม</h4>
                    <div className="space-y-2">
                      {stats?.surveys.popular.map((survey, index) => (
                        <div key={survey.id} className="p-4 bg-gray-50 rounded-lg border border-gray-200 hover:border-orange-300 hover:shadow-sm transition-all group">
                          <div className="flex items-start space-x-3">
                            <span className="w-6 h-6 bg-orange-500 text-white rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">
                              {index + 1}
                            </span>
                            <div className="flex-1 min-w-0">
                              <h5 className="text-sm font-medium text-gray-900 group-hover:text-orange-600 line-clamp-2 mb-2">
                                {survey.title}
                              </h5>
                              <div className="flex items-center space-x-3 text-xs text-gray-500">
                                <span className="flex items-center">
                                  <Eye className="w-3 h-3 mr-1" />
                                  {formatNumber(survey.view_count)} ครั้ง
                                </span>
                                <span>•</span>
                                <span className="flex items-center">
                                  <Calendar className="w-3 h-3 mr-1" />
                                  {formatDate(survey.survey_date)}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="text-sm font-semibold text-gray-900 mb-3">แบบสำรวจล่าสุด</h4>
                    <div className="space-y-2">
                      {stats?.surveys.recent.map((survey) => (
                        <div key={survey.id} className="p-4 bg-gray-50 rounded-lg border border-gray-200 hover:border-orange-300 hover:shadow-sm transition-all group">
                          <div className="flex items-start space-x-3">
                            <div className="flex-1 min-w-0">
                              <h5 className="text-sm font-medium text-gray-900 group-hover:text-orange-600 line-clamp-2 mb-2">
                                {survey.title}
                              </h5>
                              <div className="flex items-center space-x-3 text-xs text-gray-500">
                                <span className="flex items-center">
                                  <Eye className="w-3 h-3 mr-1" />
                                  {formatNumber(survey.view_count)} ครั้ง
                                </span>
                                <span>•</span>
                                <span className="flex items-center">
                                  <Calendar className="w-3 h-3 mr-1" />
                                  {formatDate(survey.survey_date)}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-8">
          <h2 className="text-sm font-bold text-gray-900 mb-4">ข้อมูลเพิ่มเติม</h2>
          <div className="grid md:grid-cols-4 gap-4">
            <Link href="/dashboard/posts">
              <div className="bg-white p-5 rounded-lg shadow-sm border-2 border-gray-200 text-center hover:shadow-md hover:border-gray-900 transition-all group cursor-pointer">
                <FileText className="w-7 h-7 text-gray-700 mx-auto mb-3 group-hover:scale-110 transition-transform" />
                <h3 className="text-sm font-medium text-gray-900 mb-1 group-hover:text-gray-700 transition-colors">โพสต์ทั้งหมด</h3>
                <p className="text-xs text-gray-600">ดูและจัดการโพสต์</p>
              </div>
            </Link>

            <Link href="/dashboard/categories">
              <div className="bg-white p-5 rounded-lg shadow-sm border-2 border-gray-200 text-center hover:shadow-md hover:border-gray-900 transition-all group cursor-pointer">
                <Users className="w-7 h-7 text-gray-700 mx-auto mb-3 group-hover:scale-110 transition-transform" />
                <h3 className="text-sm font-medium text-gray-900 mb-1 group-hover:text-gray-700 transition-colors">ประเด็น</h3>
                <p className="text-xs text-gray-600">จัดการประเด็น</p>
              </div>
            </Link>

            <Link href="/dashboard/surveys">
              <div className="bg-white p-5 rounded-lg shadow-sm border-2 border-gray-200 text-center hover:shadow-md hover:border-gray-900 transition-all group cursor-pointer">
                <ClipboardList className="w-7 h-7 text-gray-700 mx-auto mb-3 group-hover:scale-110 transition-transform" />
                <h3 className="text-sm font-medium text-gray-900 mb-1 group-hover:text-gray-700 transition-colors">แบบสำรวจ</h3>
                <p className="text-xs text-gray-600">ดูและดาวน์โหลดแบบสำรวจ</p>
              </div>
            </Link>

            <Link href={`${API_BASE}/posts/`} target="_blank" rel="noopener noreferrer">
              <div className="bg-white p-5 rounded-lg shadow-sm border-2 border-gray-200 text-center hover:shadow-md hover:border-gray-900 transition-all group cursor-pointer">
                <Globe className="w-7 h-7 text-gray-700 mx-auto mb-3 group-hover:scale-110 transition-transform" />
                <h3 className="text-sm font-medium text-gray-900 mb-1 group-hover:text-gray-700 transition-colors">API Endpoint</h3>
                <p className="text-xs text-gray-600">เข้าถึง API ภายนอก</p>
              </div>
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
