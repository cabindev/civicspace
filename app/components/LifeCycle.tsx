'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, useInView, useSpring, useTransform, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { Kanit } from 'next/font/google';

const kanit = Kanit({
  weight: ['700', '800', '900'],
  subsets: ['thai', 'latin'],
  display: 'swap',
});

const THAI_LIFE_EXPECTANCY = 76.41;

const ageData = [
  { age: 20, days: 20600 },
  { age: 30, days: 16950 },
  { age: 40, days: 13300 },
  { age: 50, days: 9640 },
  { age: 60, days: 5990 },
  { age: 70, days: 2340 },
];

const maxDays = ageData[0].days;

function AnimatedNumber({ value, inView }: { value: number; inView: boolean }) {
  const spring = useSpring(0, { duration: 1500, bounce: 0 });
  const display = useTransform(spring, (v) => Math.round(v).toLocaleString());
  const [text, setText] = useState('0');

  useEffect(() => {
    if (inView) {
      spring.set(value);
    }
  }, [inView, spring, value]);

  useEffect(() => {
    const unsubscribe = display.on('change', (v) => setText(v));
    return unsubscribe;
  }, [display]);

  return <span>{text}</span>;
}

function ClockIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  );
}

function CalendarIcon() {
  return (
    <svg width="48" height="48" viewBox="0 0 48 48" fill="none" className="inline-block ml-2 -mt-1">
      <rect x="4" y="8" width="40" height="36" rx="4" fill="white" stroke="#e5e7eb" strokeWidth="2" />
      <rect x="4" y="8" width="40" height="12" rx="4" fill="#ec4899" />
      <rect x="14" y="4" width="4" height="10" rx="2" fill="#9ca3af" />
      <rect x="30" y="4" width="4" height="10" rx="2" fill="#9ca3af" />
      <text x="24" y="37" textAnchor="middle" fontSize="16" fontWeight="bold" fill="#374151">31</text>
    </svg>
  );
}

function formatHours(days: number) {
  return (days * 24).toLocaleString();
}

function formatWeeks(days: number) {
  return Math.round(days / 7).toLocaleString();
}

function formatMonths(days: number) {
  return Math.round(days / 30.44).toLocaleString();
}

export default function LifeCycle() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-50px' });
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  return (
    <section
      className="py-12 sm:py-16 lg:py-20"
      style={{ backgroundColor: '#f0ece4' }}
    >
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8" ref={ref}>
        {/* Header */}
        <div className="text-center mb-8 sm:mb-12">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6 }}
            className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-gray-900 mb-1 sm:mb-2"
          >
            เหลือเวลาอีกกี่วันบนโลก
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.05 }}
            className="text-base sm:text-lg text-gray-400 mb-3 sm:mb-4 tracking-wide"
          >
            How Many Days Do You Have Left on Earth?
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="flex items-center justify-center flex-wrap text-lg sm:text-xl text-gray-700"
          >
            <span className={kanit.className}>อายุโดยเฉลี่ยของคนไทย</span>
            <span className={`text-3xl sm:text-4xl text-gray-900 mx-2 ${kanit.className}`} style={{ fontWeight: 900 }}>{THAI_LIFE_EXPECTANCY}</span>
            <span className={kanit.className}>ปี</span>
            <CalendarIcon />
          </motion.div>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-sm text-gray-400 mt-1"
          >
            Thai Average Life Expectancy: {THAI_LIFE_EXPECTANCY} years
          </motion.p>
        </div>

        {/* Bar Chart with "อายุ" label */}
        <div className="flex gap-2 sm:gap-3">
          {/* "อายุ / Age" vertical label */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : {}}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex-shrink-0 flex flex-col items-center justify-center w-8 sm:w-10"
          >
            <span className="text-gray-500 text-sm sm:text-base font-medium">อายุ</span>
            <span className="text-gray-400 text-xs">Age</span>
          </motion.div>

          {/* Chart rows */}
          <div className="flex-1 space-y-3 sm:space-y-4">
            {ageData.map((item, index) => {
              const widthPercent = (item.days / maxDays) * 100;
              const isHovered = hoveredIndex === index;
              const isDimmed = hoveredIndex !== null && hoveredIndex !== index;

              return (
                <motion.div
                  key={item.age}
                  initial={{ opacity: 0, x: -20 }}
                  animate={isInView ? {
                    opacity: isDimmed ? 0.35 : 1,
                    x: 0,
                    scale: isHovered ? 1.02 : 1,
                  } : {}}
                  transition={{ duration: 0.3 }}
                  className="flex items-center gap-1.5 sm:gap-2 cursor-pointer"
                  onMouseEnter={() => setHoveredIndex(index)}
                  onMouseLeave={() => setHoveredIndex(null)}
                >
                  {/* Age label */}
                  <div className={`flex-shrink-0 w-12 sm:w-14 text-right ${kanit.className}`}>
                    <span className="text-xl sm:text-2xl font-bold text-gray-800">
                      {item.age}
                    </span>
                    <span className="text-sm sm:text-base text-gray-600 ml-0.5">ปี</span>
                  </div>

                  {/* Clock icon */}
                  <div className="flex-shrink-0">
                    <motion.div
                      animate={isHovered
                        ? { rotate: [0, -30, 360], scale: 1.2 }
                        : isInView ? { rotate: [0, 10, -10, 0] } : {}
                      }
                      transition={isHovered
                        ? { duration: 0.8, ease: 'easeInOut' }
                        : { duration: 1.2, delay: 0.5 + index * 0.15, ease: 'easeInOut' }
                      }
                    >
                      <ClockIcon className={`w-7 h-7 sm:w-8 sm:h-8 transition-colors duration-300 ${isHovered ? 'text-yellow-600' : 'text-gray-700'}`} />
                    </motion.div>
                  </div>

                  {/* Bar + days count */}
                  <div className="flex-1 relative h-9 sm:h-11">
                    {/* Track */}
                    <div className="absolute inset-0 rounded-full" style={{ backgroundColor: '#d6d2ca' }} />
                    {/* Fill */}
                    <motion.div
                      className="absolute inset-y-0 left-0 rounded-full"
                      style={{ backgroundColor: isHovered ? '#f59e0b' : '#333333' }}
                      initial={{ width: '0%' }}
                      animate={isInView ? { width: `${widthPercent}%` } : { width: '0%' }}
                      transition={{
                        width: { duration: 1, delay: 0.5 + index * 0.15, ease: [0.25, 0.46, 0.45, 0.94] },
                        backgroundColor: { duration: 0.3 },
                      }}
                    />
                    {/* Days count - follows bar edge */}
                    <motion.div
                      className="absolute inset-y-0 flex items-center whitespace-nowrap"
                      style={{ left: `${widthPercent}%` }}
                      initial={{ opacity: 0 }}
                      animate={isInView ? { opacity: 1 } : {}}
                      transition={{ duration: 0.4, delay: 1.2 + index * 0.15 }}
                    >
                      <span className={`font-bold text-sm sm:text-base tabular-nums ml-3 transition-colors duration-300 ${isHovered ? 'text-yellow-700' : 'text-gray-800'} ${kanit.className}`}>
                        ≈<AnimatedNumber value={item.days} inView={isInView} />
                      </span>
                      <span className={`text-xs sm:text-sm ml-1 transition-colors duration-300 ${isHovered ? 'text-yellow-600' : 'text-gray-500'} ${kanit.className}`}>วัน / days</span>
                    </motion.div>

                    {/* Hover tooltip */}
                    <AnimatePresence>
                      {isHovered && (
                        <motion.div
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 8 }}
                          transition={{ duration: 0.2 }}
                          className="absolute left-0 top-full mt-2 z-10"
                        >
                          <div className={`bg-gray-900 text-white text-xs rounded-xl px-4 py-3 shadow-xl ${kanit.className}`}>
                            <div className="flex items-center gap-4">
                              <div className="text-center">
                                <div className="text-yellow-400 font-bold text-base">{formatMonths(item.days)}</div>
                                <div className="text-gray-400">เดือน / months</div>
                              </div>
                              <div className="w-px h-8 bg-gray-700" />
                              <div className="text-center">
                                <div className="text-yellow-400 font-bold text-base">{formatWeeks(item.days)}</div>
                                <div className="text-gray-400">สัปดาห์ / weeks</div>
                              </div>
                              <div className="w-px h-8 bg-gray-700" />
                              <div className="text-center">
                                <div className="text-yellow-400 font-bold text-base">{formatHours(item.days)}</div>
                                <div className="text-gray-400">ชั่วโมง / hours</div>
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ duration: 0.6, delay: 1.8 }}
          className="flex items-end justify-between mt-8 sm:mt-10"
        >
          <div className="text-xs text-gray-500 space-y-0.5">
            <p className="font-medium">ข้อมูลที่มา : theglobaleconomy</p>
            <p>ตัวเลขอายุขัยเฉลี่ยนั้นเป็นเพียงการคาดการณ์เท่านั้นข้อมูลอาจผิดพลาดได้</p>
            <p className="text-gray-400 italic">Life expectancy figures are estimates and may vary.</p>
          </div>
          <div className="flex-shrink-0 ml-4">
            <Image
              src="/img/civicspace.svg"
              alt="CivicSpace"
              width={100}
              height={40}
              className="h-8 sm:h-10 w-auto"
            />
          </div>
        </motion.div>
      </div>
    </section>
  );
}
