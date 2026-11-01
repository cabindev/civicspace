// app/lib/roles.ts — กฎสิทธิ์ตาม role ใช้ร่วมกันทั้ง proxy, API และหน้า UI
// ไฟล์นี้ต้องไม่ import prisma หรือโมดูลฝั่ง server — proxy.ts ใช้ด้วย
//
// PENDING  = สมัครใหม่ (ฟอร์ม/Google) รอแอดมินอนุมัติ — เห็นแค่หน้าสาธารณะ + โปรไฟล์ตัวเอง
// MEMBER   = เจ้าหน้าที่ที่อนุมัติแล้ว
// ADMIN / SUPER_ADMIN = เข้าแดชบอร์ด อนุมัติ/ปฏิเสธบัญชีได้ · เปลี่ยน role ได้เฉพาะ SUPER_ADMIN

export const ROLES = ['SUPER_ADMIN', 'ADMIN', 'MEMBER', 'PENDING'] as const;
export type RoleName = (typeof ROLES)[number];

export const ROLE_LABELS: Record<RoleName, string> = {
  SUPER_ADMIN: 'ผู้ดูแลสูงสุด',
  ADMIN: 'ผู้ดูแลระบบ',
  MEMBER: 'เจ้าหน้าที่',
  PENDING: 'รออนุมัติ',
};

export function isAdminRole(role: unknown): boolean {
  return role === 'ADMIN' || role === 'SUPER_ADMIN';
}

// บัญชีที่อนุมัติแล้ว — หน้า/API ภายในต้องเช็คด้วยฟังก์ชันนี้ ไม่ใช่แค่ "ล็อกอินอยู่"
export function isStaffRole(role: unknown): boolean {
  return role === 'MEMBER' || isAdminRole(role);
}
