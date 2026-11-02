// app/works/components/WorksMap.tsx — แผนที่ประเทศไทยพร้อมจุดผลงาน (SVG ล้วน ไม่โหลดไลบรารีแผนที่)
// วิธีฉายพิกัดเดียวกับแผนที่ข้อตกลงของ stopdrinknetwork: equirectangular ปรับด้วย cos(ละติจูดกลาง)
// ระดับประเทศคลาดเคลื่อนน้อยพอสำหรับภาพประกอบ · เส้นขอบจาก app/data/thailand-outline.json
import Link from 'next/link';
import thailandOutline from '@/app/data/thailand-outline.json';

type Ring = number[][];
const RINGS = (thailandOutline.geometry.coordinates as number[][][][]).map((poly) => poly[0]);
const ALL = RINGS.flat();
const MIN_LNG = Math.min(...ALL.map((c) => c[0]));
const MAX_LNG = Math.max(...ALL.map((c) => c[0]));
const MIN_LAT = Math.min(...ALL.map((c) => c[1]));
const MAX_LAT = Math.max(...ALL.map((c) => c[1]));
const K = Math.cos((((MIN_LAT + MAX_LAT) / 2) * Math.PI) / 180);
const W = 300;
const SCALE = W / ((MAX_LNG - MIN_LNG) * K);
const H = (MAX_LAT - MIN_LAT) * SCALE;
const px = (lng: number, lat: number): [number, number] => [(lng - MIN_LNG) * K * SCALE, (MAX_LAT - lat) * SCALE];

function ringPath(ring: Ring) {
  const pts: [number, number][] = [];
  for (const [lng, lat] of ring) {
    const p = px(lng, lat);
    const last = pts[pts.length - 1];
    if (!last || Math.hypot(p[0] - last[0], p[1] - last[1]) >= 0.8) pts.push(p);
  }
  return pts.length < 3 ? '' : `M${pts.map(([x, y]) => `${x.toFixed(1)} ${y.toFixed(1)}`).join('L')}Z`;
}

// ทำครั้งเดียวตอนโหลดโมดูล
const OUTLINE = RINGS.map(ringPath).join('');

export interface MapPoint {
  id: number;
  title: string;
  province: string;
  lat: number;
  lng: number;
}

export default function WorksMap({ points, className = '' }: { points: MapPoint[]; className?: string }) {
  return (
    <svg viewBox={`-6 -6 ${(W + 12).toFixed(0)} ${(H + 12).toFixed(0)}`} role="img" aria-label={`แผนที่ผลงาน ${points.length} พื้นที่`} className={className}>
      <path d={OUTLINE} className="fill-white/[0.06] stroke-white/25" strokeWidth={0.8} strokeLinejoin="round" />
      {points.map((p) => {
        const [x, y] = px(p.lng, p.lat);
        return (
          <Link key={p.id} href={`/works/${p.id}`} aria-label={`${p.title} — ${p.province}`} className="group">
            <title>{`${p.title} — ${p.province}`}</title>
            <circle cx={x} cy={y} r={9} className="fill-yellow-400/15 motion-safe:animate-pulse" />
            <circle cx={x} cy={y} r={4.2} className="fill-yellow-400 stroke-stone-950 transition-all group-hover:fill-white" strokeWidth={1.2} />
          </Link>
        );
      })}
    </svg>
  );
}
