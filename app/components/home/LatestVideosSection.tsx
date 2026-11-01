// app/components/home/LatestVideosSection.tsx
import Link from 'next/link';
import Image from 'next/image';
import { getLatestVideos } from '@/app/lib/homeData';

function SectionHeader() {
  return (
    <div className="text-center mb-8 sm:mb-12">
      <div className="inline-flex items-center justify-center w-12 h-12 bg-yellow-100 rounded-full mb-4">
        <svg className="w-6 h-6 text-yellow-600" fill="currentColor" viewBox="0 0 24 24">
          <path d="M8 5v14l11-7z" />
        </svg>
      </div>
      <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2 sm:mb-4">วิดีโอล่าสุด</h2>
      <p className="text-sm sm:text-base text-gray-600 max-w-2xl mx-auto">
        รับชมวิดีโอที่น่าสนใจและเป็นประโยชน์จากทีมงาน CivicSpace
      </p>
    </div>
  );
}

export function LatestVideosSkeleton() {
  return (
    <section className="py-8 sm:py-12 lg:py-16 bg-gradient-to-b from-white to-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeader />
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i}>
              <div className="aspect-[3/4] rounded-xl bg-gray-100 animate-pulse mb-2" />
              <div className="h-3 w-full rounded bg-gray-100 animate-pulse" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default async function LatestVideosSection() {
  const videos = await getLatestVideos(12);

  return (
    <section className="py-8 sm:py-12 lg:py-16 bg-gradient-to-b from-white to-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeader />

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
          {videos.map((video) => (
            <Link key={video.id} href={`/video/${video.slug}`} className="group cursor-pointer">
              <div className="relative aspect-[3/4] rounded-xl overflow-hidden bg-gray-100 mb-2 shadow-sm hover:shadow-md transition-shadow">
                <Image
                  src={video.thumbnail_url}
                  alt={video.title}
                  fill
                  sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 208px"
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

                {/* Play button */}
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="w-10 h-10 bg-white/95 rounded-full flex items-center justify-center shadow-lg">
                    <svg className="w-4 h-4 text-gray-900 ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  </div>
                </div>

                {/* Duration */}
                <div className="absolute bottom-2 right-2 bg-black/80 backdrop-blur-sm text-white text-xs px-1.5 py-0.5 rounded font-medium">
                  {video.duration}
                </div>

                {/* Category badge */}
                {video.category && (
                  <div className="absolute top-2 left-2">
                    <span className="bg-yellow-500 text-white text-xs px-2 py-0.5 rounded-full font-medium">
                      {video.category.name}
                    </span>
                  </div>
                )}
              </div>

              <div className="space-y-1">
                <h3 className="font-medium text-gray-900 group-hover:text-yellow-600 transition-colors line-clamp-2 text-xs leading-tight">
                  {video.title}
                </h3>
                <div className="flex items-center text-xs text-gray-500">
                  <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                  <span>{video.view_count.toLocaleString()}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* View All Videos Button */}
        <div className="text-center mt-6 sm:mt-8 space-y-4">
          <div className="text-xs sm:text-sm text-gray-500">แสดง {videos.length} วิดีโอ</div>
          <Link
            href="/video"
            className="inline-flex items-center space-x-2 px-6 py-3 bg-yellow-500 hover:bg-yellow-600 text-white font-medium rounded-lg transition-colors"
          >
            <span>ดูวิดีโอทั้งหมด</span>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      </div>
    </section>
  );
}
