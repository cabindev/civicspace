// app/last-journey/components/StageCard.tsx
// การ์ดข้อความของแต่ละขั้น ใช้ทั้งบนภาพ 3D และในหน้าสำรอง (ไม่มี WebGL)
import { ArrowDown } from 'lucide-react';
import type { CSSProperties } from 'react';
import type { StageCopy } from '../content';
import RipLogo from './RipLogo';

/** สีโลโก้งานศพปลอดเหล้า: สัญลักษณ์+แถบดำ ตัวหนังสือขาว ทุกการ์ด รวมพื้นมืด (ผู้ใช้ขอ 6 พ.ย. 2026) */
const LOGO_COLORS = { '--rip-symbol': '#111', '--rip-label': '#111', '--rip-text': '#fff' } as CSSProperties;

interface StageCardProps {
  copy: StageCopy;
  index: number;
  dark?: boolean;
  /** การ์ดที่วางทับภาพ 3D ซ่อนจาก screen reader (มีรายการข้อความแยกให้แล้ว) */
  overlay?: boolean;
}

export default function StageCard({ copy, index, dark = false, overlay = false }: StageCardProps) {
  const Heading = index === 0 && !overlay ? 'h1' : 'h2';
  const tab = overlay ? -1 : undefined;

  return (
    <div
      className={`rounded-xl border px-5 py-4 sm:px-6 sm:py-5 shadow-lg backdrop-blur-md transition-colors duration-500 ${
        dark ? 'bg-stone-900/85 border-stone-700/60 text-amber-50' : 'bg-white/85 border-white/70 text-gray-900'
      }`}
    >
      {overlay && <RipLogo className="block w-16 sm:w-24 h-auto mb-3 drop-shadow-md" style={LOGO_COLORS} />}
      {copy.eyebrow && (
        <p className={`text-xs font-medium mb-2 ${dark ? 'text-amber-300' : 'text-yellow-800'}`}>{copy.eyebrow}</p>
      )}
      <Heading className={`font-bold leading-snug ${index === 0 ? 'text-3xl sm:text-4xl mb-3' : 'text-lg sm:text-xl mb-2'}`}>
        {copy.title}
      </Heading>
      {copy.body && (
        <p className={`text-[15px] sm:text-base leading-relaxed ${dark ? 'text-amber-50/90' : 'text-gray-700'}`}>{copy.body}</p>
      )}
      {copy.quote && (
        <blockquote className={`mt-3 border-l-2 pl-3 text-[15px] ${dark ? 'border-amber-300/70' : 'border-yellow-500'}`}>
          “{copy.quote.text}”
          <footer className={`mt-1 text-xs ${dark ? 'text-amber-100/70' : 'text-gray-500'}`}>{copy.quote.by}</footer>
        </blockquote>
      )}
      {copy.note && <p className={`mt-3 text-xs ${dark ? 'text-amber-100/70' : 'text-gray-500'}`}>{copy.note}</p>}
      {index === 0 && overlay && (
        <p data-hint className="mt-4 inline-flex items-center gap-2 text-sm text-gray-600 transition-opacity duration-300">
          <ArrowDown className="w-4 h-4 motion-safe:animate-bounce" />
          เลื่อนลงช้าๆ เพื่อเดินไปส่งด้วยกัน
        </p>
      )}
      {index === 5 && (
        <a
          href="#learn"
          tabIndex={tab}
          className={`mt-4 inline-flex items-center gap-2 min-h-10 px-4 rounded-md text-sm font-medium transition-colors ${
            dark ? 'bg-amber-300 text-stone-900 hover:bg-amber-200' : 'bg-gray-900 text-white hover:bg-gray-700'
          }`}
        >
          เรียนรู้วิธีจัดงานแบบเรียบง่าย
          <ArrowDown className="w-4 h-4" />
        </a>
      )}
    </div>
  );
}
