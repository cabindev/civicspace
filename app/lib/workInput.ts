// app/lib/workInput.ts — ตรวจและแปลงข้อมูลฟอร์มผลงานจากแดชบอร์ด (ใช้ทั้งสร้างและแก้)
// ไม่เชื่อข้อมูลจากเบราว์เซอร์: ตัดความยาว ตรวจ enum ตรวจ URL ก่อนเขียนลงฐานข้อมูล
import { ISSUE_KEYS, REGION_LABELS } from '@/app/lib/works';

const STATUSES = ['PLANNING', 'ACTIVE', 'COMPLETED'] as const;
const LINK_KINDS = ['FACEBOOK', 'YOUTUBE', 'TIKTOK', 'DRIVE', 'WEB'] as const;

const str = (v: unknown, max: number) => (typeof v === 'string' ? v.trim().slice(0, max) : '');
const optStr = (v: unknown, max: number) => str(v, max) || null;
const num = (v: unknown) => {
  if (v === '' || v == null) return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
};

/** วันที่จากฟอร์ม (YYYY-MM-DD) = เที่ยงคืนเวลาไทย → เก็บเป็น UTC แบบเดียวกับข้อมูลที่นำเข้า */
function bangkokDate(v: unknown): Date | null {
  const s = str(v, 10);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(s)) return null;
  const d = new Date(`${s}T00:00:00+07:00`);
  return Number.isNaN(d.getTime()) ? null : d;
}

function linkKind(url: string): (typeof LINK_KINDS)[number] {
  if (/facebook\.com|fb\.watch/i.test(url)) return 'FACEBOOK';
  if (/youtube\.com|youtu\.be/i.test(url)) return 'YOUTUBE';
  if (/tiktok\.com/i.test(url)) return 'TIKTOK';
  if (/drive\.google\.com|docs\.google\.com/i.test(url)) return 'DRIVE';
  return 'WEB';
}

export interface WorkInputError {
  error: string;
}

export function parseWorkInput(body: Record<string, unknown>) {
  const title = str(body.title, 191);
  const description = str(body.description, 5000);
  const district = str(body.district, 191);
  const amphoe = str(body.amphoe, 191);
  const province = str(body.province, 191);
  const region = str(body.region, 191);

  if (!title) return { error: 'กรุณาใส่ชื่องาน' } satisfies WorkInputError;
  if (!description) return { error: 'กรุณาใส่คำอธิบายงาน' } satisfies WorkInputError;
  if (!district || !amphoe || !province) return { error: 'กรุณาใส่ตำบล อำเภอ และจังหวัด' } satisfies WorkInputError;
  if (!(region in REGION_LABELS)) return { error: 'กรุณาเลือกภูมิภาค' } satisfies WorkInputError;

  const issueKey = typeof body.issueKey === 'string' && ISSUE_KEYS.includes(body.issueKey) ? body.issueKey : null;
  const status = STATUSES.includes(body.status as (typeof STATUSES)[number]) ? (body.status as (typeof STATUSES)[number]) : 'ACTIVE';

  const lat = num(body.latitude);
  const lng = num(body.longitude);
  // พิกัดต้องอยู่ในกรอบประเทศไทยคร่าว ๆ ไม่งั้นจุดบนแผนที่หลุดกรอบ
  const coordsOk = lat != null && lng != null && lat >= 5 && lat <= 21 && lng >= 97 && lng <= 106;

  const links = Array.isArray(body.links)
    ? body.links
        .slice(0, 50)
        .map((l, i) => {
          const o = (l ?? {}) as Record<string, unknown>;
          const url = str(o.url, 2000);
          if (!/^https?:\/\//i.test(url)) return null;
          return { url, title: optStr(o.title, 200), kind: linkKind(url), isPublic: o.isPublic !== false, sortOrder: i };
        })
        .filter((l): l is NonNullable<typeof l> => l !== null)
    : [];

  return {
    data: {
      title,
      description,
      issueKey,
      status,
      areaName: optStr(body.areaName, 191),
      district,
      amphoe,
      province,
      region,
      latitude: coordsOk ? lat : null,
      longitude: coordsOk ? lng : null,
      locationSource: coordsOk ? ('PIN' as const) : ('TAMBON' as const),
      startDate: bangkokDate(body.startDate),
      endDate: bangkokDate(body.endDate),
      storyLead: optStr(body.storyLead, 20000),
      storyProcess: optStr(body.storyProcess, 20000),
      storyLessons: optStr(body.storyLessons, 20000),
      coordinatorName: optStr(body.coordinatorName, 191),
      coordinatorRole: optStr(body.coordinatorRole, 191),
      coordinatorPhone: optStr(body.coordinatorPhone, 50),
      coordinatorLine: optStr(body.coordinatorLine, 100),
    },
    links,
    isPublished: body.isPublished === true,
  };
}

/** แปลงวันที่ใน DB กลับเป็น YYYY-MM-DD ตามเวลาไทย สำหรับใส่ใน <input type="date"> */
export function toDateInput(d: Date | null | undefined) {
  if (!d) return '';
  return new Date(d.getTime() + 7 * 3600_000).toISOString().slice(0, 10);
}
