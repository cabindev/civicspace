'use client';

import { useState, useEffect } from 'react';
import { Globe, Hash } from 'lucide-react';

interface Tag {
  id: number;
  name: string;
  usage_count?: number;
}

const API_BASE = 'https://civicspace-gqdcg0dxgjbqe8as.southeastasia-01.azurewebsites.net/api/v1';

export default function TagsPage() {
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTags();
  }, []);

  const fetchTags = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE}/tags/`);
      const data = await response.json();
      
      setTags(data.results || data || []);
    } catch (error) {
      console.error('Error fetching tags:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="h-12 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-xs font-bold text-gray-900 mb-2">แท็กบทความ</h1>
        <p className="text-xs text-gray-600">รายการแท็กทั้งหมดในระบบ</p>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Hash className="w-4 h-4 text-gray-600" />
              <span className="text-xs font-medium">รายการแท็ก</span>
            </div>
            <span className="text-xs text-gray-500">{tags.length} แท็ก</span>
          </div>
        </div>

        <div className="p-4">
          {tags.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {tags.map((tag) => (
                <div 
                  key={tag.id}
                  className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center space-x-2">
                    <Hash className="w-3 h-3 text-gray-400" />
                    <span className="text-xs text-gray-900">{tag.name}</span>
                  </div>
                  {tag.usage_count && (
                    <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                      {tag.usage_count}
                    </span>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Hash className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-xs text-gray-500">ไม่มีแท็กในระบบ</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}