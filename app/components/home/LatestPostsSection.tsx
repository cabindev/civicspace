// app/components/home/LatestPostsSection.tsx
import Link from 'next/link';
import Image from 'next/image';
import { formatThaiDate, getLatestPosts, type Post } from '@/app/lib/homeData';

// ความสูงแบบ Unsplash — ใช้เฉพาะคลาสที่มีจริงใน Tailwind
// (ของเดิมมี h-88 กับ h-76 ซึ่งไม่มีในธีม การ์ดจึงสูง 0 และรูปหายไป)
const HEIGHTS = ['h-56', 'h-64', 'h-80', 'h-72', 'h-60', 'h-96', 'h-52', 'h-44', 'h-48', 'h-40'];

function SectionHeader() {
  return (
    <div className="text-center mb-8 sm:mb-12">
      <div className="inline-flex items-center justify-center w-12 h-12 bg-yellow-100 rounded-full mb-4">
        <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
        </svg>
      </div>
      <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2 sm:mb-4">บทความล่าสุด</h2>
      <p className="text-sm sm:text-base text-gray-600 max-w-2xl mx-auto">
        ติดตามข้อมูลและองค์ความรู้ใหม่ๆ จากทีมงาน CivicSpace
      </p>
    </div>
  );
}

function FeaturedPost({ post }: { post: Post }) {
  return (
    <Link href={`/post/${post.slug}`} className="block mb-8">
      <div className="group relative rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500">
        <div className="relative aspect-[21/9] overflow-hidden bg-gray-100">
          <Image
            src={post.featured_image_url!}
            alt={post.title}
            fill
            sizes="(max-width: 1280px) 100vw, 1280px"
            className="object-cover group-hover:scale-105 transition-transform duration-700"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />

          {/* Featured Badge */}
          <div className="absolute top-4 left-4">
            <span className="bg-yellow-500 text-white text-sm px-4 py-2 rounded-full font-semibold shadow-lg flex items-center space-x-2">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              <span>บทความเด่น</span>
            </span>
          </div>

          {/* Content Overlay */}
          <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-8 lg:p-10">
            <div className="max-w-4xl">
              <div className="flex items-center space-x-3 mb-3">
                {post.category && (
                  <span className="bg-white/20 backdrop-blur-sm text-white text-xs px-3 py-1 rounded-full border border-white/30">
                    {post.category.name}
                  </span>
                )}
                <span className="text-white/80 text-xs">{formatThaiDate(post.created_at)}</span>
              </div>
              <h3 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-3 group-hover:text-yellow-300 transition-colors line-clamp-2">
                {post.title}
              </h3>
              <div className="flex items-center space-x-4 text-white/80 text-sm">
                <span className="flex items-center space-x-1">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                  <span>{post.view_count.toLocaleString()} ครั้ง</span>
                </span>
                <span>•</span>
                <span className="flex items-center space-x-1">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>{post.reading_time} นาที</span>
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}

export function LatestPostsSkeleton() {
  return (
    <section className="py-8 sm:py-12 lg:py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeader />
        <div className="aspect-[21/9] rounded-2xl bg-gray-100 animate-pulse mb-8" />
        <div className="columns-1 sm:columns-2 md:columns-3 lg:columns-4 gap-4 space-y-4">
          {HEIGHTS.slice(0, 8).map((h, i) => (
            <div key={i} className={`${h} rounded-lg bg-gray-100 animate-pulse break-inside-avoid mb-4`} />
          ))}
        </div>
      </div>
    </section>
  );
}

export default async function LatestPostsSection() {
  const posts = await getLatestPosts(12);
  const featured = posts[0]?.featured_image_url ? posts[0] : null;

  return (
    <section className="py-8 sm:py-12 lg:py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeader />

        {featured && <FeaturedPost post={featured} />}

        {/* Other Posts Grid */}
        <div className="columns-1 sm:columns-2 md:columns-3 lg:columns-4 gap-4 space-y-4">
          {posts.slice(1).map((post, index) => (
            <Link key={post.id} href={`/post/${post.slug}`} className="group">
              <article className="rounded-lg overflow-hidden transition-all duration-300 group-hover:scale-105 hover:shadow-lg break-inside-avoid mb-4 bg-gray-100">
                {post.featured_image_url && (
                  <div className={`relative ${HEIGHTS[index % HEIGHTS.length]} overflow-hidden`}>
                    <Image
                      src={post.featured_image_url}
                      alt={post.title}
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 320px"
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                    <div className="absolute bottom-0 left-0 right-0 p-3">
                      <h3 className="text-white text-xs font-medium line-clamp-2 leading-tight">
                        {post.title}
                      </h3>
                    </div>
                  </div>
                )}
              </article>
            </Link>
          ))}
        </div>

        {/* Total Posts Info & View All Button */}
        <div className="text-center mt-6 sm:mt-8 space-y-4">
          <div className="text-xs sm:text-sm text-gray-500">แสดง {posts.length} บทความ</div>
          <Link
            href="/post"
            className="inline-flex items-center space-x-2 px-6 py-3 bg-yellow-500 hover:bg-yellow-600 text-white font-medium rounded-lg transition-colors"
          >
            <span>ดูบทความทั้งหมด</span>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      </div>
    </section>
  );
}
