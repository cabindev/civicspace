// app/lib/workFiles.ts — ที่เก็บไฟล์แนบของผลงาน: โฟลเดอร์ uploads/ ที่รากโปรเจกต์ (gitignored, นอก public/)
// ไม่ใช้ public/ เพราะ production build ไม่ serve ไฟล์ที่เพิ่มหลัง build และไฟล์ภายในต้องตรวจสิทธิ์ก่อนเปิด
import path from 'node:path';
import fs from 'node:fs/promises';
import crypto from 'node:crypto';

export const UPLOAD_ROOT = path.join(process.cwd(), 'uploads');

export const MAX_FILE_BYTES = 15 * 1024 * 1024; // 15 MB ต่อไฟล์
export const ALLOWED_TYPES: Record<string, { ext: string; kind: 'IMAGE' | 'DOCUMENT' }> = {
  'image/jpeg': { ext: 'jpg', kind: 'IMAGE' },
  'image/png': { ext: 'png', kind: 'IMAGE' },
  'image/webp': { ext: 'webp', kind: 'IMAGE' },
  'application/pdf': { ext: 'pdf', kind: 'DOCUMENT' },
};

/** แปลง filePath ใน DB เป็น path จริง — คืน null ถ้าหลุดออกนอก uploads/ (กัน path traversal) */
export function resolveUpload(filePath: string) {
  const abs = path.resolve(UPLOAD_ROOT, filePath);
  return abs.startsWith(UPLOAD_ROOT + path.sep) ? abs : null;
}

/** ตรวจชนิดไฟล์จากเนื้อไฟล์ (magic bytes) ไม่เชื่อ Content-Type ที่เบราว์เซอร์ส่งมา */
export function sniffType(buf: Buffer): string | null {
  if (buf.length >= 3 && buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) return 'image/jpeg';
  if (buf.length >= 8 && buf.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))) return 'image/png';
  if (buf.length >= 12 && buf.subarray(0, 4).toString('latin1') === 'RIFF' && buf.subarray(8, 12).toString('latin1') === 'WEBP') return 'image/webp';
  if (buf.length >= 5 && buf.subarray(0, 5).toString('latin1') === '%PDF-') return 'application/pdf';
  return null;
}

/** บันทึกไฟล์ใหม่ของงาน → คืน filePath (สัมพัทธ์กับ uploads/) ชื่อไฟล์สุ่ม ไม่ใช้ชื่อที่ผู้ใช้ส่งมา */
export async function saveWorkFile(activityId: number, buf: Buffer, mimeType: string) {
  const ext = ALLOWED_TYPES[mimeType]?.ext;
  if (!ext) throw new Error('unsupported type');
  const rel = path.posix.join('civicspace', 'activities', String(activityId), `${Date.now()}-${crypto.randomBytes(4).toString('hex')}.${ext}`);
  const abs = resolveUpload(rel);
  if (!abs) throw new Error('bad path');
  await fs.mkdir(path.dirname(abs), { recursive: true });
  await fs.writeFile(abs, buf);
  return rel;
}

/** ลบไฟล์จริงออกจากดิสก์ — ไม่มีไฟล์แล้วก็ไม่ถือว่าผิดพลาด */
export async function removeWorkFile(filePath: string) {
  const abs = resolveUpload(filePath);
  if (abs) await fs.rm(abs, { force: true });
}
