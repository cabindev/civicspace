'use client';

import { useState, useEffect } from 'react';
import { Users, FileText } from 'lucide-react';

interface Category {
  id: number;
  name: string;
  description?: string;
  post_count: number;
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
      const data = await response.json();
      
      setCategories(data.results || data || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
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
        <h1 className="text-xs font-bold text-gray-900 mb-2">หมวดหมู่บทความ</h1>
        <p className="text-xs text-gray-600">รายการหมวดหมู่ทั้งหมดในระบบ</p>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Users className="w-4 h-4 text-gray-600" />
              <span className="text-xs font-medium">รายการหมวดหมู่</span>
            </div>
            <span className="text-xs text-gray-500">{categories.length} หมวดหมู่</span>
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
                
                <div className="flex items-center space-x-2">
                  <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                    {category.post_count} บทความ
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {categories.length === 0 && (
          <div className="p-8 text-center">
            <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-xs text-gray-500">ไม่มีหมวดหมู่ในระบบ</p>
          </div>
        )}
      </div>
    </div>
  );
}