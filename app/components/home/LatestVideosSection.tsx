// app/components/home/LatestVideosSection.tsx
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, Play } from 'lucide-react';
import { getLatestVideos, type Video } from '@/app/lib/homeData';

export function LatestVideosSkeleton() {
  return (
    <section className="bg-stone-950 py-16 sm:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="h-8 w-48 rounded bg-white/10 animate-pulse mb-10" />
        <div className="flex gap-4 overflow-hidden">
          {Array.from({ length: 7 }).map((_, i) => (
            <div key={i} className="w-44 sm:w-52 shrink-0 aspect-[4/5] rounded-2xl bg-white/10 animate-pulse" />
          ))}
        </div>
      </div>
    </section>
  );
}

function VideoCard({ video, hidden = false }: { video: Video; hidden?: boolean }) {
  return (
    <Link
      href={`/video/${video.slug}`}
      tabIndex={hidden ? -1 : undefined}
      className="group relative block w-44 sm:w-52 shrink-0 overflow-hidden rounded-2xl bg-stone-800 shadow-lg ring-1 ring-white/10 transition duration-300 hover:-translate-y-1 hover:ring-yellow-400/70"
    >
      <div className="relative aspect-[4/5]">
        {video.thumbnail_url && (
          <Image
            src={video.thumbnail_url}
            alt={hidden ? '' : video.title}
            fill
            sizes="208px"
            className="object-cover transition-transform duration-700 group-hover:scale-110"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 from-15% via-black/30 to-transparent" />
        <span className="absolute left-1/2 top-1/2 flex h-12 w-12 -translate-x-1/2 -translate-y-1/2 scale-75 items-center justify-center rounded-full bg-yellow-400 text-stone-950 opacity-0 shadow-xl transition duration-300 group-hover:scale-100 group-hover:opacity-100">
          <Play className="ml-0.5 h-5 w-5 fill-current" />
        </span>
        {video.category && (
          <span className="absolute left-2 top-2 max-w-[85%] truncate rounded-full bg-black/45 px-2 py-0.5 text-[11px] text-white backdrop-blur-sm">
            {video.category.name}
          </span>
        )}
        {/* ภาษาไทยต้องการระยะบรรทัดมากกว่า leading-snug — ไม่งั้น line-clamp ตัดสระล่างของบรรทัดสุดท้าย
            padding ต้องอยู่ที่กล่องนอก: overflow ของ line-clamp ตัดที่ขอบ padding บรรทัดที่ 4 จะโผล่มาในช่อง padding */}
        <div className="absolute inset-x-0 bottom-0 p-3">
          <h3 className="text-xs sm:text-sm font-medium leading-[1.65] text-white line-clamp-3">{video.title}</h3>
        </div>
      </div>
    </Link>
  );
}

export default async function LatestVideosSection() {
  const videos = await getLatestVideos(16);
  if (videos.length === 0) return null;

  return (
    <section className="relative overflow-hidden bg-stone-950 py-16 sm:py-24">
      <div aria-hidden className="pointer-events-none absolute -top-40 left-1/2 h-80 w-[48rem] -translate-x-1/2 rounded-full bg-yellow-500/15 blur-3xl" />
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-8 sm:mb-10">
          <div>
            <p className="text-xs sm:text-sm font-semibold text-yellow-400">เสียงจากพื้นที่</p>
            <h2 className="mt-2 text-2xl sm:text-4xl font-bold text-white">วิดีโอล่าสุด</h2>
            <p className="mt-2 text-sm sm:text-base text-stone-400">คลิปสั้นจากคนทำงานจริง เลื่อนดูได้เรื่อย ๆ</p>
          </div>
          <Link
            href="/video"
            className="group inline-flex items-center gap-2 self-start sm:self-auto rounded-full border border-white/20 px-5 py-2.5 text-sm font-medium text-white transition hover:border-yellow-400 hover:text-yellow-300"
          >
            ดูวิดีโอทั้งหมด
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>
      </div>

      {/* แถบเลื่อนวน — ขอบซ้ายขวาค่อย ๆ จางหาย */}
      <div className="reel relative [mask-image:linear-gradient(to_right,transparent,black_6%,black_94%,transparent)]">
        {/* สองชุดต้องกว้างเท่ากันเป๊ะ (gap + pr เท่ากัน) ไม่งั้นตอนวนกลับจะกระตุก */}
        <div className="reel-track flex w-max" style={{ ['--reel-duration' as string]: `${videos.length * 5}s` }}>
          <div className="flex gap-4 pr-4">
            {videos.map((video) => (
              <VideoCard key={video.id} video={video} />
            ))}
          </div>
          <div data-reel-copy aria-hidden className="flex gap-4 pr-4">
            {videos.map((video) => (
              <VideoCard key={`copy-${video.id}`} video={video} hidden />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
