// components/SurveyCard.tsx
'use client';

import { Download, FileText, Calendar, Eye, Users } from 'lucide-react';
import { Survey } from '@/lib/api';

interface SurveyCardProps {
  survey: Survey;
  variant?: 'default' | 'compact';
}

export default function SurveyCard({ survey, variant = 'default' }: SurveyCardProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('th-TH', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const handleDownload = (e: React.MouseEvent) => {
    e.preventDefault();
    // Open file in new tab for download
    window.open(survey.survey_file_url, '_blank');
  };

  if (variant === 'compact') {
    return (
      <div className="flex items-center justify-between p-4 bg-white rounded-lg border border-gray-200 hover:border-yellow-300 hover:shadow-md transition-all group">
        <div className="flex items-start space-x-3 flex-1">
          <div className="p-2 bg-yellow-50 rounded-lg group-hover:bg-yellow-100 transition-colors">
            <FileText className="w-5 h-5 text-yellow-600" />
          </div>

          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-semibold text-gray-900 line-clamp-2 mb-1">
              {survey.title}
            </h3>

            <div className="flex items-center space-x-3 text-xs text-gray-500">
              <div className="flex items-center space-x-1">
                <Calendar className="w-3 h-3" />
                <span>{formatDate(survey.survey_date)}</span>
              </div>

              {survey.response_count > 0 && (
                <>
                  <span>•</span>
                  <div className="flex items-center space-x-1">
                    <Users className="w-3 h-3" />
                    <span>{survey.response_count} คน</span>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        <button
          onClick={handleDownload}
          className="ml-4 p-2 bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg transition-colors flex-shrink-0"
          title="ดาวน์โหลดแบบสำรวจ"
        >
          <Download className="w-4 h-4" />
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-xl hover:border-yellow-300 transition-all duration-300 group">
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="p-3 bg-yellow-50 rounded-xl group-hover:bg-yellow-100 transition-colors">
            <FileText className="w-8 h-8 text-yellow-600" />
          </div>

          {survey.is_published && (
            <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">
              เผยแพร่แล้ว
            </span>
          )}
        </div>

        <h3 className="text-lg font-bold text-gray-900 mb-3 line-clamp-2 group-hover:text-yellow-600 transition-colors">
          {survey.title}
        </h3>

        {survey.description && (
          <p className="text-sm text-gray-600 mb-4 line-clamp-3">
            {survey.description}
          </p>
        )}

        <div className="grid grid-cols-2 gap-3 mb-4 pt-4 border-t border-gray-100">
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <Calendar className="w-4 h-4 text-gray-400" />
            <span>{formatDate(survey.survey_date)}</span>
          </div>

          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <Users className="w-4 h-4 text-gray-400" />
            <span>{survey.response_count} ตอบกลับ</span>
          </div>

          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <Eye className="w-4 h-4 text-gray-400" />
            <span>{survey.view_count} ครั้ง</span>
          </div>
        </div>

        {survey.category && (
          <div className="mb-4">
            <span className="inline-block px-3 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">
              {survey.category.name}
            </span>
          </div>
        )}

        <button
          onClick={handleDownload}
          className="w-full py-3 bg-yellow-500 hover:bg-yellow-600 text-white font-medium rounded-lg transition-colors flex items-center justify-center space-x-2 group-hover:shadow-lg"
        >
          <Download className="w-5 h-5" />
          <span>ดาวน์โหลดแบบสำรวจ</span>
        </button>
      </div>
    </div>
  );
}
