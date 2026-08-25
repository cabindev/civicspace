// app/components/home/PopularAndCategories.tsx
import Link from 'next/link';
import { formatThaiDate, getCategories, getPopularPosts } from '@/app/lib/homeData';

export default async function PopularAndCategories() {
  const [popularPosts, categories] = await Promise.all([
    getPopularPosts(4),
    getCategories(),
  ]);

  return (
    <section className="py-8 sm:py-12 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-6 sm:gap-8">
          {/* Popular Posts */}
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-4 sm:mb-6">บทความยอดนิยม</h2>

            <div className="space-y-2 sm:space-y-3">
              {popularPosts.map((post, index) => (
                <Link key={post.id} href={`/post/${post.slug}`}>
                  <div className="flex items-start space-x-3 p-2 sm:p-3 rounded-lg hover:bg-gray-50 transition-colors group">
                    <div className="flex-shrink-0 w-5 h-5 sm:w-6 sm:h-6 bg-gray-600 text-white rounded-full flex items-center justify-center text-xs font-semibold">
                      {index + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-gray-900 group-hover:text-gray-600 transition-colors line-clamp-2 text-xs sm:text-sm mb-1">
                        {post.title}
                      </h3>
                      <div className="flex items-center space-x-2 sm:space-x-3 text-xs text-gray-500">
                        <span>{post.view_count.toLocaleString()} ครั้ง</span>
                        <span>•</span>
                        <span className="hidden sm:inline">{formatThaiDate(post.created_at)}</span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* Categories */}
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-4 sm:mb-6">หมวดหมู่</h2>

            <div className="space-y-2 sm:space-y-3">
              {categories.slice(0, 6).map((category) => (
                <div
                  key={category.id}
                  className="flex items-center justify-between p-2 sm:p-3 rounded-lg hover:bg-gray-50 transition-colors group cursor-pointer"
                >
                  <h3 className="font-medium text-gray-900 group-hover:text-gray-600 transition-colors text-xs sm:text-sm">
                    {category.name}
                  </h3>
                  <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                    {(category.total_count ?? category.post_count).toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
