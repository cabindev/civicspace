// app/lib/works.ts — "ผลงาน": งานในพื้นที่ของ Civic Space (ตาราง Activity*) ใช้ร่วมกันทั้งหน้าสาธารณะและแดชบอร์ด
// ข้อมูลชุดแรกนำเข้าจาก stopdrinknetwork (scripts/import-stopdrink-works.mjs) — งานใหม่บันทึกใน civicspace เอง
// หน้าสาธารณะเห็นเฉพาะงานที่ isPublished + ไฟล์/ลิงก์ที่ isPublic · ผู้ประสานงาน (เบอร์/ไลน์) ห้ามขึ้นหน้าสาธารณะ (PDPA)
import type { Prisma } from '@prisma/client';
import prisma from '@/app/lib/prisma';
import { ISSUE_GROUPS } from '@/app/lib/issues';

export const ISSUE_KEYS = ISSUE_GROUPS.map((g) => g.key);

export const STATUS_LABELS: Record<string, string> = {
  PLANNING: 'วางแผน',
  ACTIVE: 'กำลังดำเนินการ',
  COMPLETED: 'เสร็จสิ้น',
};

export const REGION_LABELS: Record<string, string> = {
  'north-upper': 'ภาคเหนือบน',
  'north-lower': 'ภาคเหนือล่าง',
  'northeast-upper': 'ภาคอีสานบน',
  'northeast-lower': 'ภาคอีสานล่าง',
  central: 'ภาคกลาง',
  east: 'ภาคตะวันออก',
  west: 'ภาคตะวันตก',
  'south-upper': 'ภาคใต้บน',
  'south-lower': 'ภาคใต้ล่าง',
  bangkok: 'กรุงเทพฯ',
};

/**
 * เดากลุ่มประเด็นจากชื่อ/คำอธิบาย — ใช้ตอนนำเข้าเมื่อยังไม่มี issueKey (แก้ได้ในแดชบอร์ด)
 * ลำดับสำคัญ: งานศพ/บวชก่อน (ชื่องานบวชมีคำว่า "งาน" เหมือนงานประเพณี)
 */
export function guessIssueKey(text: string): string | null {
  if (/ศพ|บวช|อุปสมบท/.test(text)) return 'life-rituals';
  if (/เด็ก|เยาวชน|คนรุ่นใหม่|นักเรียน/.test(text)) return 'youth';
  if (/สงกรานต์|ปี๋ใหม่|ลอยกระทง|ยี่เป็ง|เดือนสิบ|งานช้าง|บุญ|ประเพณี|เทศกาล/.test(text)) return 'festivals';
  return null;
}

/** วันที่ใน DB เป็น UTC — แสดงตามเวลาไทยเสมอ (เที่ยงคืนไทย = 17:00 UTC ของวันก่อน) */
export function formatWorkDate(d: Date | string | null | undefined, precision: string = 'DAY') {
  if (!d) return '';
  const opts: Intl.DateTimeFormatOptions =
    precision === 'YEAR'
      ? { year: 'numeric', timeZone: 'Asia/Bangkok' }
      : { year: 'numeric', month: 'short', day: 'numeric', timeZone: 'Asia/Bangkok' };
  return new Date(d).toLocaleDateString('th-TH', opts);
}

export function placeText(w: { areaName?: string | null; district: string; province: string }) {
  const tambon = w.province === 'กรุงเทพมหานคร' ? `แขวง${w.district}` : `ต.${w.district}`;
  return [w.areaName, `${tambon} จ.${w.province}`].filter(Boolean).join(' · ');
}

/** ไฟล์แนบเปิดผ่าน API ที่ตรวจสิทธิ์ — ไฟล์จริงอยู่ใน uploads/ (นอก public/) */
export const fileUrl = (id: number) => `/api/works/files/${id}`;

const publicWhere = { isPublished: true, deletedAt: null } satisfies Prisma.ActivityWhereInput;

const cardSelect = {
  id: true,
  title: true,
  description: true,
  issueKey: true,
  areaName: true,
  district: true,
  amphoe: true,
  province: true,
  region: true,
  latitude: true,
  longitude: true,
  startDate: true,
  startDatePrecision: true,
  attachments: {
    where: { isPublic: true, kind: 'IMAGE' },
    select: { id: true, isCover: true },
    orderBy: [{ isCover: 'desc' }, { id: 'asc' }],
    take: 1,
  },
} satisfies Prisma.ActivitySelect;

export type WorkCard = Awaited<ReturnType<typeof getPublishedWorks>>[number];

export async function getPublishedWorks(issueKey?: string) {
  const rows = await prisma.activity.findMany({
    where: { ...publicWhere, ...(issueKey ? { issueKey } : {}) },
    select: cardSelect,
    orderBy: [{ startDate: 'desc' }, { id: 'desc' }],
  });
  return rows.map(({ attachments, ...w }) => ({ ...w, coverId: attachments[0]?.id ?? null }));
}

/** หน้ารายละเอียด — staff ดูงานที่ยังไม่เผยแพร่และไฟล์ภายในได้ (ใช้ตรวจก่อนเผยแพร่) */
export async function getWork(id: number, opts: { staff?: boolean } = {}) {
  if (!Number.isInteger(id) || id <= 0) return null;
  const work = await prisma.activity.findFirst({
    where: { id, deletedAt: null, ...(opts.staff ? {} : { isPublished: true }) },
    include: {
      attachments: {
        where: opts.staff ? {} : { isPublic: true },
        orderBy: [{ isCover: 'desc' }, { id: 'asc' }],
      },
      links: { where: opts.staff ? {} : { isPublic: true }, orderBy: [{ sortOrder: 'asc' }, { id: 'asc' }] },
      areas: { orderBy: [{ sortOrder: 'asc' }, { id: 'asc' }] },
      policies: true,
    },
  });
  if (!work) return null;
  if (!opts.staff) {
    // ข้อมูลผู้ประสานงานและผู้บันทึกไม่ส่งออกหน้าสาธารณะเลย (กันหลุดผ่าน RSC payload)
    return {
      ...work,
      coordinatorName: null,
      coordinatorRole: null,
      coordinatorPhone: null,
      coordinatorLine: null,
      authorEmail: null,
    };
  }
  return work;
}

/** งานที่เผยแพร่แล้วเรียงต่อกัน สำหรับลิงก์ "งานก่อนหน้า / ถัดไป" */
export async function getAdjacentWorks(id: number) {
  const all = await prisma.activity.findMany({
    where: publicWhere,
    select: { id: true, title: true },
    orderBy: [{ startDate: 'desc' }, { id: 'desc' }],
  });
  const i = all.findIndex((w) => w.id === id);
  if (i < 0) return { prev: null, next: null };
  return { prev: all[i - 1] ?? null, next: all[i + 1] ?? null };
}
