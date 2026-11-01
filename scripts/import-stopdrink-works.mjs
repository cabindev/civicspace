// scripts/import-stopdrink-works.mjs
// นำเข้างานจาก stopdrinknetwork (ค่าเริ่มต้นประเด็น "Civic Space" ที่เว็บนั้นซ่อนไว้) มาเป็น Activity ของ civicspace
//
//   SDN_DATABASE_URL="mysql://root:root@localhost:3306/StopDrinkNetwork" node scripts/import-stopdrink-works.mjs            # ทดลอง ไม่เขียนอะไร
//   SDN_DATABASE_URL=... node scripts/import-stopdrink-works.mjs --commit                                                     # บันทึกจริง
//   SDN_DATABASE_URL=... node scripts/import-stopdrink-works.mjs --commit --files-from ../stopdrinknetwork/uploads             # + คัดลอกไฟล์แนบ
//   --category "ชื่อประเด็น"  เปลี่ยนประเด็นที่ดึง
//
// รันซ้ำได้: จับคู่ด้วย sourceSystem + sourceId — งานที่เคยนำเข้าแล้วถูกอัปเดตและแทนที่พื้นที่/ลิงก์/ไฟล์/นโยบายทั้งชุด
// ไม่แตะฐานข้อมูลของ stopdrinknetwork (อ่านอย่างเดียว) และไม่ยุ่งกับตาราง User ของ civicspace
import { PrismaClient } from '@prisma/client';
import fs from 'node:fs';
import path from 'node:path';

const SOURCE = 'stopdrinknetwork';
const args = process.argv.slice(2);
const commit = args.includes('--commit');
const opt = (name) => {
  const i = args.indexOf(name);
  return i >= 0 ? args[i + 1] : undefined;
};
const categoryName = opt('--category') ?? 'Civic Space';
const filesFrom = opt('--files-from');
const UPLOADS = path.join(process.cwd(), 'uploads');

if (!process.env.SDN_DATABASE_URL) {
  console.error('ต้องตั้ง SDN_DATABASE_URL ให้ชี้ไปฐานข้อมูล stopdrinknetwork');
  process.exit(1);
}
if (filesFrom && !fs.existsSync(filesFrom)) {
  console.error(`ไม่พบโฟลเดอร์ไฟล์ต้นทาง: ${filesFrom}`);
  process.exit(1);
}

const src = new PrismaClient({ datasourceUrl: process.env.SDN_DATABASE_URL });
const dst = new PrismaClient();

const bool = (v) => v === true || v === 1 || v === '1' || (typeof v === 'bigint' && v === 1n);
const json = (v) => (v == null ? null : typeof v === 'string' ? JSON.parse(v) : v);

async function load() {
  const works = await src.$queryRaw`
    SELECT a.*, c.name AS categoryName, s.name AS subCategoryName,
           u.firstName AS authorFirst, u.lastName AS authorLast, u.email AS authorEmail
    FROM Activity a
    JOIN WorkCategory c ON c.id = a.categoryId
    LEFT JOIN WorkSubCategory s ON s.id = a.subCategoryId
    JOIN User u ON u.id = a.userId
    WHERE c.name = ${categoryName} AND a.deletedAt IS NULL
    ORDER BY a.id`;
  const ids = works.map((w) => w.id);
  if (!ids.length) return { works, areas: [], links: [], files: [], policies: [] };
  const inIds = (table) => src.$queryRawUnsafe(`SELECT * FROM ${table} WHERE activityId IN (${ids.join(',')}) ORDER BY id`);
  const [areas, links, files, policies] = await Promise.all([
    inIds('ActivityArea'), inIds('ActivityLink'), inIds('ActivityAttachment'), inIds('ActivityPolicy'),
  ]);
  return { works, areas, links, files, policies };
}

function toActivity(w) {
  return {
    title: w.title,
    description: w.description,
    sourceSystem: SOURCE,
    sourceId: w.id,
    category: w.categoryName,
    subCategory: w.subCategoryName,
    authorName: [w.authorFirst, w.authorLast].filter(Boolean).join(' ') || null,
    authorEmail: w.authorEmail,
    areaName: w.areaName,
    district: w.district,
    amphoe: w.amphoe,
    province: w.province,
    areaScope: w.areaScope,
    region: w.region,
    zipcode: w.zipcode,
    latitude: w.latitude,
    longitude: w.longitude,
    locationSource: w.locationSource,
    participantCount: w.participantCount,
    partners: json(w.partners) ?? undefined,
    hasSurvey: bool(w.hasSurvey),
    coverageVillages: w.coverageVillages,
    coverageHouseholds: w.coverageHouseholds,
    coveragePopulation: w.coveragePopulation,
    coordinatorName: w.coordinatorName,
    coordinatorRole: w.coordinatorRole,
    coordinatorPhone: w.coordinatorPhone,
    coordinatorLine: w.coordinatorLine,
    coordinatorConsent: bool(w.coordinatorConsent),
    isPublished: bool(w.isPublished),
    publishedAt: w.publishedAt,
    storyLead: w.storyLead,
    storyProcess: w.storyProcess,
    storyLessons: w.storyLessons,
    status: w.status,
    startDate: w.startDate,
    startDatePrecision: w.startDatePrecision,
    endDate: w.endDate,
    createdAt: w.createdAt,
  };
}

// ไฟล์ของ stopdrinknetwork อยู่ใต้ uploads/<filePath> → เก็บที่ uploads/stopdrinknetwork/<filePath> ของ civicspace
function copyFile(f) {
  const target = path.join(SOURCE, f.filePath);
  if (!filesFrom) return { target, note: 'ไม่ได้คัดลอก (ไม่ระบุ --files-from)' };
  const from = path.join(filesFrom, f.filePath);
  if (!fs.existsSync(from)) return { target, note: `ไม่พบไฟล์ต้นทาง ${from}` };
  if (commit) {
    const to = path.join(UPLOADS, target);
    fs.mkdirSync(path.dirname(to), { recursive: true });
    fs.copyFileSync(from, to);
  }
  return { target, note: commit ? 'คัดลอกแล้ว' : 'จะคัดลอก' };
}

async function main() {
  const { works, areas, links, files, policies } = await load();
  console.log(`ประเด็น "${categoryName}" จาก ${SOURCE}: ${works.length} งาน · พื้นที่ ${areas.length} · ลิงก์ ${links.length} · ไฟล์ ${files.length} · นโยบาย ${policies.length}`);
  console.log(commit ? 'โหมดบันทึกจริง\n' : 'โหมดทดลอง (ใส่ --commit เพื่อบันทึก)\n');

  let created = 0;
  let updated = 0;
  for (const w of works) {
    const existing = await dst.activity.findUnique({
      where: { sourceSystem_sourceId: { sourceSystem: SOURCE, sourceId: w.id } },
      select: { id: true },
    });
    const mine = (rows) => rows.filter((r) => r.activityId === w.id);
    const fileRows = mine(files).map((f) => ({ f, ...copyFile(f) }));
    console.log(`${existing ? 'อัปเดต' : 'สร้างใหม่'}  #${w.id} ${w.title} — ${w.province}${w.isPublished ? ' (เผยแพร่แล้ว)' : ''}`);
    for (const { f, note } of fileRows) console.log(`    ไฟล์ ${f.fileName}: ${note}`);
    if (existing) updated++;
    else created++;
    if (!commit) continue;

    const children = {
      areas: {
        create: mine(areas).map((a) => ({
          areaName: a.areaName, district: a.district, amphoe: a.amphoe, province: a.province, region: a.region,
          zipcode: a.zipcode, latitude: a.latitude, longitude: a.longitude, locationSource: a.locationSource,
          note: a.note, sortOrder: a.sortOrder,
        })),
      },
      links: {
        create: mine(links).map((l) => ({
          url: l.url, title: l.title, kind: l.kind, sortOrder: l.sortOrder, isPublic: bool(l.isPublic),
        })),
      },
      attachments: {
        create: fileRows.map(({ f, target }) => ({
          kind: f.kind, filePath: target, fileName: f.fileName, mimeType: f.mimeType, size: f.size,
          caption: f.caption, isCover: bool(f.isCover), policyLevel: f.policyLevel,
          isSurvey: bool(f.isSurvey), isPublic: bool(f.isPublic),
        })),
      },
      policies: {
        create: mine(policies).map((p) => ({ level: p.level, name: p.name, type: p.type, year: p.year })),
      },
    };

    await dst.$transaction(async (tx) => {
      if (existing) {
        await Promise.all([
          tx.activityArea.deleteMany({ where: { activityId: existing.id } }),
          tx.activityLink.deleteMany({ where: { activityId: existing.id } }),
          tx.activityAttachment.deleteMany({ where: { activityId: existing.id } }),
          tx.activityPolicy.deleteMany({ where: { activityId: existing.id } }),
        ]);
        await tx.activity.update({ where: { id: existing.id }, data: { ...toActivity(w), ...children } });
      } else {
        await tx.activity.create({ data: { ...toActivity(w), ...children } });
      }
    });
  }

  console.log(`\nสรุป: สร้างใหม่ ${created} · อัปเดต ${updated}${commit ? '' : ' (ยังไม่ได้บันทึก)'}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(() => Promise.all([src.$disconnect(), dst.$disconnect()]));
