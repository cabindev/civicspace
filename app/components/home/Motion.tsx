'use client';
// app/components/home/Motion.tsx — แอนิเมชันเล็ก ๆ ของหน้าแรก
// ทุกตัวเคารพ prefers-reduced-motion: ผู้ใช้ที่ตั้งค่าลดการเคลื่อนไหว จะเห็นผลลัพธ์สุดท้ายทันที
import { useEffect, useRef, useState, type ReactNode } from 'react';
import { animate, motion, useInView, useReducedMotion } from 'framer-motion';

/** ตัวเลขนับขึ้นจาก 0 เมื่อเลื่อนมาเห็น (ครั้งเดียว) — HTML ฝั่ง server มีค่าจริงอยู่แล้ว ไม่กระทบ SEO */
export function CountUp({ value, duration = 1.6 }: { value: number; duration?: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: '-10% 0px' });
  const reduce = useReducedMotion();
  const [shown, setShown] = useState(value);

  useEffect(() => {
    if (!inView || reduce) return;
    const controls = animate(0, value, {
      duration,
      ease: [0.16, 1, 0.3, 1],
      onUpdate: (v) => setShown(Math.round(v)),
    });
    return () => controls.stop();
  }, [inView, reduce, value, duration]);

  return (
    <span ref={ref} className="tabular-nums">
      {shown.toLocaleString('th-TH')}
    </span>
  );
}

/** ค่อย ๆ ลอยขึ้นตอนเลื่อนมาถึง */
export function Reveal({ children, delay = 0, className }: { children: ReactNode; delay?: number; className?: string }) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      className={className}
      initial={reduce ? false : { opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-8% 0px' }}
      transition={{ duration: 0.7, delay, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </motion.div>
  );
}
