'use client';
// app/farewell/track.ts — จุดเก็บสถิติการใช้ "ส่งด้วยใจ"
// ตอนนี้ไม่ส่งอะไรออกไป: civicspace ยังไม่มีตารางเก็บสถิตินี้ (ต้นฉบับ stopdrinknetwork ส่งไป /api/farewell/event ของเขาเอง)
// คงฟังก์ชันไว้ให้โค้ดที่ยกมาไม่ต้องแก้ ถ้าจะเก็บสถิติในอนาคต เพิ่ม API route + ตารางของ civicspace แล้วเติมที่นี่ที่เดียว
// กติกาเดิมยังใช้: ห้ามส่งชื่อผู้วายชนม์/ตำบล/ราคา
export type FarewellEvent =
  | 'VISIT'
  | 'JOURNEY_VIEW'
  | 'PLAN_START'
  | 'PLAN_COMPLETE'
  | 'PRINT'
  | 'SHARE'
  | 'LINE'
  | 'COPY'
  | 'SIGN_DOWNLOAD'
  | 'SIGN_PRINT';

interface Extra {
  province?: string | null;
  answers?: Record<string, string>;
}

export function track(_type: FarewellEvent, _extra: Extra = {}) {}

export function trackOncePerTab(_key: string, _type: FarewellEvent, _extra: Extra = {}) {}
