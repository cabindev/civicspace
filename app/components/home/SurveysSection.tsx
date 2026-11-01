// app/components/home/SurveysSection.tsx — "ข้อมูลจากพื้นที่": ผลสำรวจ/คู่มือ เป็นการ์ดเอกสารให้ดาวน์โหลด
// ลิงก์ดาวน์โหลดเป็น <a> ธรรมดา (ไฟล์อยู่บน blob storage) — ไม่ต้องใช้ JS ฝั่ง client
// ไม่มีปุ่ม "ดูทั้งหมด" เพราะหน้ารวมแบบสำรวจอยู่ใน /dashboard ซึ่งคนทั่วไปเข้าไม่ได้
import { Download, FileText } from 'lucide-react';
import { formatThaiDate, getLatestSurveys } from '@/app/lib/homeData';
import { Reveal } from './Motion';

function fileType(url: string | undefined) {
  const ext = url?.split('?')[0].split('.').pop()?.toLowerCase();
  if (ext === 'pdf') return 'PDF';
  if (ext === 'doc' || ext === 'docx') return 'DOCX';
  if (ext === 'xls' || ext === 'xlsx') return 'XLSX';
  return null;
}

export default async function SurveysSection() {
  const surveys = await getLatestSurveys(3);
  if (surveys.length === 0) return null;

  return (
    <section className="relative overflow-hidden bg-[#fffbeb] py-16 sm:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Reveal>
          <div className="max-w-2xl mb-10 sm:mb-12">
            <p className="text-xs sm:text-sm font-semibold tracking-wide text-yellow-700">ข้อมูลจากพื้นที่</p>
            <h2 className="mt-2 text-2xl sm:text-4xl font-bold text-gray-900">ผลสำรวจและคู่มือ</h2>
            <p className="mt-3 text-sm sm:text-base text-gray-600">
              ตัวเลขและบทเรียนที่ชุมชนเก็บเอง นำไปใช้ต่อได้ทันที
            </p>
          </div>
        </Reveal>

        <ul className="grid gap-6 md:grid-cols-3">
          {surveys.map((survey, i) => {
            const type = fileType(survey.survey_file_url);
            return (
              <li key={survey.id}>
                <Reveal delay={i * 0.08} className="h-full">
                  <a
                    href={survey.survey_file_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group relative flex h-full flex-col rounded-3xl bg-white p-6 shadow-sm ring-1 ring-yellow-900/10 transition duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-yellow-700/10 hover:ring-yellow-400 focus-visible:outline focus-visible:outline-4 focus-visible:outline-yellow-400"
                  >
                    {/* มุมกระดาษพับ (ตกแต่ง) */}
                    <span
                      aria-hidden
                      className="absolute right-0 top-0 h-10 w-10 rounded-bl-2xl rounded-tr-3xl bg-gradient-to-bl from-yellow-200 to-yellow-100 transition-colors group-hover:from-yellow-400 group-hover:to-yellow-200"
                    />

                    <div className="flex items-center gap-3">
                      <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-stone-950 text-yellow-400">
                        <FileText className="h-5 w-5" />
                      </span>
                      {type && (
                        <span className="rounded-md border border-stone-200 px-1.5 py-0.5 text-[10px] font-bold tracking-wider text-stone-500">
                          {type}
                        </span>
                      )}
                    </div>

                    {survey.category && (
                      <p className="mt-5 text-xs font-semibold text-yellow-700">{survey.category.name}</p>
                    )}
                    <h3 className="mt-1.5 text-base font-bold leading-[1.6] text-gray-900 line-clamp-3">{survey.title}</h3>
                    {survey.description && (
                      <p className="mt-2 text-sm leading-relaxed text-gray-600 line-clamp-3">{survey.description}</p>
                    )}

                    <div className="mt-auto flex items-center justify-between pt-6">
                      <span className="text-xs text-gray-500">
                        {survey.survey_date ? formatThaiDate(survey.survey_date) : ''}
                      </span>
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-yellow-400 px-3.5 py-1.5 text-xs font-semibold text-stone-950 transition group-hover:bg-yellow-300">
                        <Download className="h-3.5 w-3.5" />
                        ดาวน์โหลด
                      </span>
                    </div>
                  </a>
                </Reveal>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
