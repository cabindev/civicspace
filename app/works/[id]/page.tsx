// app/works/[id]/page.tsx — รายละเอียดผลงาน: ภาพปก เรื่องเล่า (บทนำ / กระบวนการ / บทเรียน) แกลเลอรี เอกสาร ลิงก์ พื้นที่
// คนทั่วไปเห็นเฉพาะงานที่เผยแพร่ + ไฟล์/ลิงก์สาธารณะ · เจ้าหน้าที่เปิดงานที่ยังไม่เผยแพร่ได้ (มีแถบเตือน) เพื่อตรวจก่อนเผยแพร่
import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { ArrowLeft, ArrowRight, Calendar, ExternalLink, Facebook, FileText, Globe, Lock, MapPin, Pencil, Youtube } from 'lucide-react';
import Navbar from '../../components/Navbar';
import { Footer } from '../../components/Footer';
import { ISSUE_GROUPS } from '@/app/lib/issues';
import { getStaffUser } from '@/app/lib/adminAuth';
import { isAdminRole } from '@/app/lib/roles';
import { fileUrl, formatWorkDate, getAdjacentWorks, getWork, placeText, REGION_LABELS, STATUS_LABELS } from '@/app/lib/works';
import StoryText from '../components/StoryText';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: PageProps<'/works/[id]'>): Promise<Metadata> {
  const work = await getWork(Number((await params).id));
  if (!work) return {};
  return {
    title: work.title,
    description: work.description.slice(0, 160),
    alternates: { canonical: `/works/${work.id}` },
  };
}

const LINK_ICON = { FACEBOOK: Facebook, YOUTUBE: Youtube, WEB: Globe, TIKTOK: Globe, DRIVE: Globe } as const;

function Section({ eyebrow, title, children }: { eyebrow: string; title: string; children: React.ReactNode }) {
  return (
    <section className="border-t border-stone-200 pt-10">
      <p className="text-sm font-semibold text-yellow-700">{eyebrow}</p>
      <h2 className="mt-1 mb-5 text-2xl font-bold text-gray-900">{title}</h2>
      {children}
    </section>
  );
}

export default async function WorkPage({ params }: PageProps<'/works/[id]'>) {
  const id = Number((await params).id);
  const staff = await getStaffUser();
  const work = await getWork(id, { staff: !!staff });
  if (!work) notFound();

  const group = ISSUE_GROUPS.find((g) => g.key === work.issueKey);
  const images = work.attachments.filter((a) => a.kind === 'IMAGE');
  const cover = images.find((a) => a.isCover && a.isPublic) ?? images.find((a) => a.isPublic) ?? images[0];
  const gallery = images.filter((a) => a.id !== cover?.id);
  const docs = work.attachments.filter((a) => a.kind === 'DOCUMENT');
  const { prev, next } = work.isPublished ? await getAdjacentWorks(work.id) : { prev: null, next: null };
  const hasStory = Boolean(work.storyLead || work.storyProcess || work.storyLessons);

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      {staff && (
        <div className={`border-b ${work.isPublished ? 'border-stone-200 bg-stone-50' : 'border-yellow-300 bg-yellow-50'}`}>
          <div className="max-w-5xl mx-auto flex flex-wrap items-center justify-between gap-2 px-4 py-2.5 text-sm sm:px-6">
            <span className="text-gray-700">
              {work.isPublished ? 'เผยแพร่แล้ว — คนทั่วไปเห็นหน้านี้' : 'ยังไม่เผยแพร่ — เห็นเฉพาะเจ้าหน้าที่'} · ไฟล์ที่มีกุญแจเห็นเฉพาะเจ้าหน้าที่
            </span>
            {/* แดชบอร์ดเปิดให้แอดมินเท่านั้น (proxy.ts) — เจ้าหน้าที่ทั่วไปดูตัวอย่างได้แต่ไม่เห็นปุ่มแก้ */}
            {isAdminRole(staff.role) && (
              <Link href={`/dashboard/works/${work.id}`} className="inline-flex items-center gap-1.5 font-medium text-gray-900 hover:underline">
                <Pencil className="h-4 w-4" /> แก้ไขงานนี้
              </Link>
            )}
          </div>
        </div>
      )}

      {/* ภาพปก */}
      <header className="relative isolate overflow-hidden bg-stone-950 text-white">
        {cover && (
          <Image src={fileUrl(cover.id)} alt="" fill priority sizes="100vw" className="-z-10 object-cover opacity-60" unoptimized={!cover.isPublic} />
        )}
        <div className="absolute inset-0 -z-10 bg-gradient-to-t from-stone-950 via-stone-950/70 to-stone-950/20" />
        <div className="max-w-5xl mx-auto px-4 pb-12 pt-28 sm:px-6 sm:pb-16 sm:pt-40">
          <Link href={group ? `/works?issue=${group.key}` : '/works'} className="inline-flex items-center gap-1.5 text-sm text-stone-300 hover:text-white">
            <ArrowLeft className="h-4 w-4" /> ผลงานในพื้นที่{group ? ` · ${group.title}` : ''}
          </Link>
          <h1 className="mt-4 max-w-4xl text-3xl font-bold leading-[1.35] sm:text-5xl">{work.title}</h1>
          <div className="mt-6 flex flex-wrap gap-x-5 gap-y-2 text-sm text-stone-200">
            <span className="inline-flex items-center gap-1.5"><MapPin className="h-4 w-4 text-yellow-400" />{placeText(work)}</span>
            {work.startDate && (
              <span className="inline-flex items-center gap-1.5"><Calendar className="h-4 w-4 text-yellow-400" />{formatWorkDate(work.startDate, work.startDatePrecision)}</span>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto grid gap-12 px-4 py-12 sm:px-6 lg:grid-cols-[1fr_17rem]">
        <article className="min-w-0 space-y-12">
          {/* บทนำ — ถ้ายังไม่มีเรื่องเล่า ใช้คำอธิบายงานแทน */}
          <div>
            <StoryText text={work.storyLead || work.description} lead={Boolean(work.storyLead)} />
          </div>
          {work.storyProcess && (
            <Section eyebrow="ทำอย่างไร" title="กระบวนการ">
              <StoryText text={work.storyProcess} />
            </Section>
          )}
          {work.storyLessons && (
            <Section eyebrow="ได้อะไร" title="บทเรียน">
              <StoryText text={work.storyLessons} />
            </Section>
          )}
          {hasStory && work.description && (
            <Section eyebrow="สรุป" title="เกี่ยวกับงานนี้">
              <p className="leading-[1.9] text-gray-700">{work.description}</p>
            </Section>
          )}

          {gallery.length > 0 && (
            <Section eyebrow="ภาพจากพื้นที่" title={`ภาพ ${gallery.length + (cover ? 1 : 0)} ภาพ`}>
              <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                {[...(cover ? [cover] : []), ...gallery].map((img) => (
                  <li key={img.id}>
                    <a href={fileUrl(img.id)} target="_blank" rel="noopener noreferrer" className="group relative block aspect-square overflow-hidden rounded-2xl bg-stone-100">
                      <Image
                        src={fileUrl(img.id)}
                        alt={img.caption ?? ''}
                        fill
                        sizes="(max-width: 640px) 50vw, 260px"
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                        unoptimized={!img.isPublic}
                      />
                      {!img.isPublic && (
                        <span className="absolute right-2 top-2 rounded-full bg-black/60 p-1.5 text-white" title="เห็นเฉพาะเจ้าหน้าที่"><Lock className="h-3.5 w-3.5" /></span>
                      )}
                    </a>
                  </li>
                ))}
              </ul>
            </Section>
          )}
        </article>

        <aside className="space-y-8 lg:sticky lg:top-6 lg:self-start">
          <dl className="space-y-4 rounded-3xl bg-[#fffbeb] p-6 text-sm ring-1 ring-yellow-900/10">
            {group && (
              <div>
                <dt className="text-xs text-gray-500">ประเด็น</dt>
                <dd className="mt-0.5"><Link href={`/issues/${group.key}`} className="font-semibold text-gray-900 hover:text-yellow-700">{group.title}</Link></dd>
              </div>
            )}
            <div>
              <dt className="text-xs text-gray-500">พื้นที่</dt>
              <dd className="mt-0.5 text-gray-900">
                {placeText(work)}
                <span className="block text-xs text-gray-500">อ.{work.amphoe} · {REGION_LABELS[work.region] ?? work.region}</span>
              </dd>
            </div>
            {work.areas.length > 0 && (
              <div>
                <dt className="text-xs text-gray-500">พื้นที่อื่นในงานนี้</dt>
                <dd className="mt-1 space-y-1">
                  {work.areas.map((a) => (
                    <p key={a.id} className="text-gray-900">{placeText(a)}</p>
                  ))}
                </dd>
              </div>
            )}
            {work.startDate && (
              <div>
                <dt className="text-xs text-gray-500">เริ่มงาน</dt>
                <dd className="mt-0.5 text-gray-900">{formatWorkDate(work.startDate, work.startDatePrecision)}{work.endDate ? ` – ${formatWorkDate(work.endDate)}` : ''}</dd>
              </div>
            )}
            <div>
              <dt className="text-xs text-gray-500">สถานะ</dt>
              <dd className="mt-0.5 text-gray-900">{STATUS_LABELS[work.status] ?? work.status}</dd>
            </div>
          </dl>

          {docs.length > 0 && (
            <div>
              <h2 className="mb-3 text-sm font-semibold text-gray-900">เอกสาร</h2>
              <ul className="space-y-2">
                {docs.map((d) => (
                  <li key={d.id}>
                    <a href={fileUrl(d.id)} target="_blank" rel="noopener noreferrer" className="flex items-start gap-2.5 rounded-2xl p-3 ring-1 ring-stone-200 transition hover:ring-yellow-400">
                      <FileText className="mt-0.5 h-4 w-4 shrink-0 text-yellow-700" />
                      <span className="min-w-0 flex-1 text-sm text-gray-900 break-words">{d.caption || d.fileName}</span>
                      {!d.isPublic && <Lock className="mt-0.5 h-3.5 w-3.5 shrink-0 text-gray-400" aria-label="เห็นเฉพาะเจ้าหน้าที่" />}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {work.links.length > 0 && (
            <div>
              <h2 className="mb-3 text-sm font-semibold text-gray-900">ติดตามต่อ</h2>
              <ul className="space-y-2">
                {work.links.map((l) => {
                  const Icon = LINK_ICON[l.kind] ?? Globe;
                  return (
                    <li key={l.id}>
                      <a href={l.url} target="_blank" rel="noopener noreferrer" className="flex items-start gap-2.5 rounded-2xl p-3 ring-1 ring-stone-200 transition hover:ring-yellow-400">
                        <Icon className="mt-0.5 h-4 w-4 shrink-0 text-gray-700" />
                        <span className="min-w-0 flex-1 text-sm text-gray-900 line-clamp-2 break-words">{l.title || l.url}</span>
                        <ExternalLink className="mt-0.5 h-3.5 w-3.5 shrink-0 text-gray-400" />
                      </a>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}
        </aside>
      </main>

      {(prev || next) && (
        <nav aria-label="ผลงานอื่น" className="border-t border-stone-200 bg-stone-50">
          <div className="max-w-5xl mx-auto grid gap-4 px-4 py-8 sm:grid-cols-2 sm:px-6">
            {prev ? (
              <Link href={`/works/${prev.id}`} className="group rounded-2xl bg-white p-5 ring-1 ring-stone-200 hover:ring-yellow-400">
                <span className="inline-flex items-center gap-1 text-xs text-gray-500"><ArrowLeft className="h-3.5 w-3.5" /> งานใหม่กว่า</span>
                <span className="mt-1 block font-semibold text-gray-900 line-clamp-2 group-hover:text-yellow-700">{prev.title}</span>
              </Link>
            ) : <span />}
            {next && (
              <Link href={`/works/${next.id}`} className="group rounded-2xl bg-white p-5 text-right ring-1 ring-stone-200 hover:ring-yellow-400">
                <span className="inline-flex items-center gap-1 text-xs text-gray-500">งานก่อนหน้า <ArrowRight className="h-3.5 w-3.5" /></span>
                <span className="mt-1 block font-semibold text-gray-900 line-clamp-2 group-hover:text-yellow-700">{next.title}</span>
              </Link>
            )}
          </div>
        </nav>
      )}

      <Footer />
    </div>
  );
}
