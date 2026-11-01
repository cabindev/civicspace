-- 2026-11-01 ล็อกอิน Google + บัญชีรออนุมัติ (PENDING)
-- แก้แค่ 2 คอลัมน์ของ User ไม่แตะข้อมูลแถวเดิม — รันใน phpMyAdmin ได้ (MySQL 5.7+/MariaDB)
-- เหมือน prisma/migrations/20261101130000_auth_pending/migration.sql
--
-- 1) password ว่างได้: บัญชีที่เข้าด้วย Google ไม่มีรหัสผ่าน
-- 2) เพิ่ม role PENDING และตั้งเป็นค่า default — ผู้ใช้เดิมคง role เดิมทุกคน
--    สมัครใหม่ (ฟอร์ม/Google) ได้ PENDING จนกว่าแอดมินอนุมัติ
--
-- ลำดับ: สำรองฐานข้อมูล → รันไฟล์นี้ → deploy โค้ด
-- (โค้ดเดิมทำงานกับ schema ใหม่ได้ แต่โค้ดใหม่ทำงานกับ schema เดิมไม่ได้ — สมัครใหม่จะพัง)

-- AlterTable
ALTER TABLE `User` MODIFY `password` VARCHAR(191) NULL,
    MODIFY `role` ENUM('SUPER_ADMIN', 'ADMIN', 'MEMBER', 'PENDING') NOT NULL DEFAULT 'PENDING';
