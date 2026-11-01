// app/issues/page.tsx
// ภาพรวม 3 กลุ่มประเด็น เรียงตามช่วงชีวิตคน
import Link from 'next/link';
import type { Metadata } from 'next';
import { ArrowRight } from 'lucide-react';
import Navbar from '../components/Navbar';
import { Footer } from '../components/Footer';
import { getCategories } from '@/app/lib/homeData';
import { ISSUE_GROUPS } from '@/app/lib/issues';

export const revalidate = 300;

export const metadata: Metadata = {
  title: 'ประเด็น',
  description: 'เหล้าอยู่ตรงไหนในชีวิตคนหนึ่งคน และใครหาทางออกไว้แล้วบ้าง',
};

export default async function IssuesPage() {
  const categories = await getCategories();

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      <section className="border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 text-center">
          <h1 className="text-2xl sm:text-4xl font-bold text-gray-900 mb-3">เหล้าอยู่ตรงไหนในชีวิตคนหนึ่งคน</h1>
          <p className="text-sm sm:text-base text-gray-600 max-w-2xl mx-auto">
            เหล้าอยู่กับคนไทยทุกช่วงชีวิต และทุกช่วงมีคนที่หาทางออกไว้แล้ว เลือกดูตามประเด็นได้เลย
          </p>
        </div>
      </section>

      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-12">
        <ol className="relative border-l-2 border-yellow-300 ml-3 space-y-8">
          {ISSUE_GROUPS.map((group, index) => {
            const groupCategories = group.categoryIds
              .map((id) => categories.find((category) => category.id === id))
              .filter((category) => category !== undefined);
            const total = groupCategories.reduce((sum, category) => sum + (category.total_count || 0), 0);

            return (
              <li key={group.key} className="pl-6 sm:pl-8">
                <span className="absolute -left-[13px] flex items-center justify-center w-6 h-6 rounded-full bg-yellow-500 text-white text-xs font-bold">
                  {index + 1}
                </span>
                <p className="text-xs font-medium text-yellow-700 mb-1">{group.stage}</p>
                <Link href={`/issues/${group.key}`} className="group block">
                  <h2 className="text-lg sm:text-xl font-bold text-gray-900 group-hover:text-yellow-700 transition-colors flex items-center gap-2">
                    {group.title}
                    <ArrowRight className="w-4 h-4" />
                  </h2>
                  <p className="text-sm text-gray-700 mt-1">“{group.quote}”</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {group.question} · {total.toLocaleString()} ชิ้น
                  </p>
                </Link>
                <div className="flex flex-wrap gap-2 mt-3">
                  {groupCategories.map((category) => (
                    <Link
                      key={category.id}
                      href={`/issues/${group.key}?c=${category.id}`}
                      className="px-3 py-1 rounded-full text-xs border border-gray-300 text-gray-700 hover:bg-yellow-50 hover:border-yellow-400 transition-colors"
                    >
                      {category.name}
                    </Link>
                  ))}
                </div>
              </li>
            );
          })}
        </ol>
      </section>

      <Footer />
    </div>
  );
}
