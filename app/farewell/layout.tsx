// app/farewell/layout.tsx — "ส่งด้วยใจ": ทางออกของประเด็นงานศพใน CivicSpace
// โครงและเครื่องมือยกมาจากโปรเจกต์ stopdrinknetwork (/farewell) — ใช้ข้อมูลของ civicspace เท่านั้น
// ฟอนต์ "เสาชิงช้า" (--font-sao, ดู font.ts) ให้ทั้งส่วนนี้ แต่ละหน้าเลือกเปิดเองด้วยคลาส styles.sao
// หน้าวางแผน + สรุปแผน = ฟอนต์ปกติของเว็บ (ฟอร์มกรอกข้อมูลอ่านง่ายกว่า) · เงื่อนไขการใช้ฟอนต์ดู fonts/README.md
import { sao } from './font';
import Navbar from '../components/Navbar';
import { Footer } from '../components/Footer';

export default function FarewellLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className={`${sao.variable} min-h-screen bg-white`}>
      {/* relative z-20: หน้า 3D ดึงภาพเต็มจอขึ้นไปซ้อนใต้ Navbar (-mt-16) — Navbar ต้องอยู่ชั้นบน */}
      <div className="relative z-20 print:hidden">
        <Navbar />
      </div>
      {children}
      <div className="print:hidden">
        <Footer />
      </div>
    </div>
  );
}
