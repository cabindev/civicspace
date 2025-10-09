// app/dashboard/surveys/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { FileText } from 'lucide-react';
import SurveyCard from '@/app/components/SurveyCard';
import { Survey } from '@/lib/api';

export default function SurveysPage() {
  const [surveys, setSurveys] = useState<Survey[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSurveys();
  }, []);

  const fetchSurveys = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/surveys');
      const data = await response.json();
      setSurveys(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching surveys:', error);
      setSurveys([]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-48 bg-gray-200 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">แบบสำรวจทั้งหมด</h1>
        <p className="text-sm text-gray-600">จัดการและดาวน์โหลดแบบสำรวจ</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">แบบสำรวจทั้งหมด</p>
              <p className="text-2xl font-bold text-gray-900">{surveys.length}</p>
            </div>
            <div className="p-3 bg-yellow-50 rounded-lg">
              <FileText className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">เผยแพร่แล้ว</p>
              <p className="text-2xl font-bold text-gray-900">
                {surveys.filter(s => s.is_published).length}
              </p>
            </div>
            <div className="p-3 bg-green-50 rounded-lg">
              <FileText className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Surveys List */}
      {surveys.length === 0 ? (
        <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
          <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 text-lg mb-2">ยังไม่มีแบบสำรวจ</p>
          <p className="text-gray-400 text-sm">
            ระบบจะแสดงแบบสำรวจที่มีอยู่ในระบบ
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {surveys.map((survey) => (
            <SurveyCard key={survey.id} survey={survey} variant="compact" />
          ))}
        </div>
      )}
    </div>
  );
}
