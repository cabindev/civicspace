// app/components/home/SurveysSection.tsx
import Link from 'next/link';
import SurveyCard from '../SurveyCard';
import { getLatestSurveys } from '@/app/lib/homeData';

export default async function SurveysSection() {
  const surveys = await getLatestSurveys(3);

  if (surveys.length === 0) return null;

  return (
    <section className="py-8 sm:py-12 lg:py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8 sm:mb-12">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2 sm:mb-4">แบบสำรวจล่าสุด</h2>
          <p className="text-sm sm:text-base text-gray-600">ดาวน์โหลดและศึกษาข้อมูลแบบสำรวจ</p>
        </div>

        <div className="space-y-4 max-w-4xl mx-auto">
          {surveys.map((survey) => (
            <SurveyCard key={survey.id} survey={survey} variant="compact" />
          ))}
        </div>

        <div className="text-center mt-8">
          <Link
            href="/dashboard/surveys"
            className="inline-flex items-center space-x-2 px-6 py-3 bg-yellow-500 hover:bg-yellow-600 text-white font-medium rounded-lg transition-colors"
          >
            <span>ดูแบบสำรวจทั้งหมด</span>
          </Link>
        </div>
      </div>
    </section>
  );
}
