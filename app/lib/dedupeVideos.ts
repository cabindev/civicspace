// app/lib/dedupeVideos.ts — ซ่อนวิดีโอที่ลงซ้ำ (ลิงก์คลิปเดียวกัน) ก่อนแสดงผล
//
// ตัวนำเข้า Facebook ของ CivicSpace API สร้างวิดีโอซ้ำกับที่มีอยู่แล้ว (พบ 32 คู่ เมื่อ 1 พ.ย. 2569 —
// 20 คู่ต่างกันแค่ "/" ท้ายลิงก์ จึงต้องตัด "/" ท้ายก่อนเทียบ) ข้อมูลต้นทางยังซ้ำอยู่ — ที่นี่เป็นแค่ตัวกันชั่วคราวฝั่งหน้าเว็บ
// เก็บตัวที่ id ต่ำสุด (ตัวเดิมที่มีก่อน มักมียอดวิวแล้ว) และคงลำดับเดิมของรายการ
//
// ข้อจำกัด: กันได้เฉพาะในรายการที่ได้มาชุดเดียวกัน — API แบ่งหน้าละ 20 ถ้าคู่ซ้ำอยู่คนละหน้าจะยังเห็นทั้งคู่
// และตัวเลข count จาก API ยังนับตัวซ้ำรวมอยู่

type VideoLike = { id: number; video_url?: string | null };

const keyOf = (url: string) => url.trim().replace(/\/+$/, '').toLowerCase();

export function dedupeVideos<T extends VideoLike>(videos: T[]): T[] {
  const keep = new Map<string, number>(); // url → id ที่จะเก็บ
  for (const v of videos) {
    if (!v.video_url) continue;
    const k = keyOf(v.video_url);
    const cur = keep.get(k);
    if (cur === undefined || v.id < cur) keep.set(k, v.id);
  }
  return videos.filter((v) => !v.video_url || keep.get(keyOf(v.video_url)) === v.id);
}
