// app/components/home/HeroStats.tsx
import { getPopularPosts, getSiteStats } from '@/app/lib/homeData';

function Stat({ value, label }: { value: number; label: string }) {
  return (
    <div className="p-4 sm:p-6">
      <div className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-2 tabular-nums">
        {value.toLocaleString()}
      </div>
      <div className="text-gray-600 text-xs sm:text-sm font-medium">{label}</div>
    </div>
  );
}

export function HeroStatsSkeleton() {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 sm:gap-6 max-w-6xl mx-auto">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="p-4 sm:p-6">
          <div className="h-9 sm:h-11 md:h-12 mb-2 mx-auto w-24 rounded bg-gray-100 animate-pulse" />
          <div className="h-4 mx-auto w-20 rounded bg-gray-100 animate-pulse" />
        </div>
      ))}
    </div>
  );
}

export default async function HeroStats() {
  const [stats, popularPosts] = await Promise.all([
    getSiteStats(),
    getPopularPosts(4),
  ]);

  const totalViews = popularPosts.reduce((sum, post) => sum + post.view_count, 0);

  return (
    <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 sm:gap-6 max-w-6xl mx-auto">
      <Stat value={stats.posts} label="Total Posts" />
      <Stat value={stats.videos} label="Videos" />
      <Stat value={stats.categories} label="Categories" />
      <Stat value={stats.surveys} label="Surveys" />
      <Stat value={totalViews} label="Total Views" />
    </div>
  );
}
