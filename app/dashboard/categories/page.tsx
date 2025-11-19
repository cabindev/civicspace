'use client';

import { useState, useEffect } from 'react';
import { Users, FileText } from 'lucide-react';

interface Category {
  id: number;
  name: string;
  description?: string;
  post_count: number;
  video_count: number;
  survey_count: number;
  total_count: number;
}

const API_BASE = 'https://civicspace-gqdcg0dxgjbqe8as.southeastasia-01.azurewebsites.net/api/v1';

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE}/categories/`);
      
      if (!response.ok) {
        console.error(`Dashboard Categories API error: ${response.status} ${response.statusText}`);
        throw new Error(`Categories API error: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('✅ Successfully fetched dashboard categories');
      
      setCategories(data.results || data || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
      setCategories([]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-16 bg-gray-200 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-xs font-bold text-gray-900 mb-2">ประเด็นทั้งหมด</h1>
        <p className="text-xs text-gray-600">รายการประเด็นทั้งหมดในระบบ</p>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Users className="w-4 h-4 text-gray-600" />
              <span className="text-xs font-medium">รายการประเด็น</span>
            </div>
            <span className="text-xs text-gray-500">{categories.length} ประเด็น</span>
          </div>
        </div>

        <div className="divide-y divide-gray-200">
          {categories.map((category) => (
            <div key={category.id} className="p-4 hover:bg-gray-50 transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                    <FileText className="w-4 h-4 text-gray-600" />
                  </div>
                  <div>
                    <h3 className="text-xs font-medium text-gray-900">
                      {category.name}
                    </h3>
                    {category.description && (
                      <p className="text-xs text-gray-600 mt-1">
                        {category.description}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                    {category.post_count || 0} โพสต์
                  </span>
                  <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                    {category.video_count || 0} วิดีโอ
                  </span>
                  <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                    {category.survey_count || 0} แบบสำรวจ
                  </span>
                  <span className="text-xs font-bold text-gray-900 bg-gray-200 px-2 py-1 rounded">
                    รวม {category.total_count || category.post_count || 0}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {categories.length === 0 && (
          <div className="p-8 text-center">
            <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-xs text-gray-500">ไม่มีประเด็นในระบบ</p>
          </div>
        )}
      </div>
    </div>
  );
}