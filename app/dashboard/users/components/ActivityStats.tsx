import { Card, Typography } from 'antd';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { ActivityBreakdown } from '../types/user';

interface Props {
 totalActivities: number;
 breakdown: ActivityBreakdown;
 monthlyData: { month: string; count: number }[];
 isMobile: boolean;
}

export function ActivityStats({ totalActivities, breakdown, monthlyData = [], isMobile }: Props) {
 const hasMonthlyData = monthlyData && monthlyData.length > 0;

 const CustomTooltip = ({ active, payload, label }: any) => {
   if (active && payload && payload.length) {
     return (
       <div className="bg-white p-2 shadow rounded border">
         <p className="text-sm font-medium">{label}</p>
         <p className="text-sm text-emerald-600">
           {payload[0].value} งาน
         </p>
       </div>
     );
   }
   return null;
 };

 const StatisticsCards = () => (
   <div className={`stats shadow w-full bg-white ${isMobile ? 'stats-vertical' : ''}`}>
     <div className="stat">
       <div className="stat-figure text-emerald-500">
         <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="inline-block w-8 h-8 stroke-current">
           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path>
         </svg>
       </div>
       <div className="stat-title">ผลงานทั้งหมด</div>
       <div className="stat-value text-emerald-500">{totalActivities}</div>
       <div className="stat-desc">งานที่บันทึกในระบบ</div>
     </div>

     <div className="stat">
       <div className="stat-figure text-emerald-500">
         <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="inline-block w-8 h-8 stroke-current">
           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path>
         </svg>
       </div>
       <div className="stat-title">ประเพณี</div>
       <div className="stat-value text-emerald-500">{breakdown.traditions}</div>
       <div className="stat-desc">ประเพณีที่บันทึก</div>
     </div>

     <div className="stat">
       <div className="stat-figure text-emerald-500">
         <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="inline-block w-8 h-8 stroke-current">
           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
         </svg>
       </div>
       <div className="stat-title">นโยบาย</div>
       <div className="stat-value text-emerald-500">{breakdown.publicPolicies}</div>
       <div className="stat-desc">นโยบายที่บันทึก</div>
     </div>

     <div className="stat">
       <div className="stat-figure text-emerald-500">
         <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="inline-block w-8 h-8 stroke-current">
           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
         </svg>
       </div>
       <div className="stat-title">ชาติพันธุ์</div>
       <div className="stat-value text-emerald-500">{breakdown.ethnicGroups}</div>
       <div className="stat-desc">กลุ่มชาติพันธุ์ที่บันทึก</div>
     </div>
     <div className="stat">
       <div className="stat-figure text-emerald-500">
         <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="inline-block w-8 h-8 stroke-current">
           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
         </svg>
       </div>
       <div className="stat-title">กิจกรรม</div>
       <div className="stat-value text-emerald-500">{breakdown.creativeActivities}</div>
       <div className="stat-desc">กิจกรรมที่บันทึก</div>
     </div>
   </div>
 );

 return (
   <>
     <div className="mb-6">
       <StatisticsCards />
     </div>
     
     <Card className="mb-6">
       <Typography.Title level={4}>สถิติรายเดือน</Typography.Title>
       {hasMonthlyData ? (
         <div style={{ width: '100%', height: 300 }}>
           <ResponsiveContainer>
             <BarChart 
               data={monthlyData} 
               margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
             >
               <XAxis 
                 dataKey="month" 
                 fontSize={12}
               />
               <YAxis 
                 fontSize={12}
                 tickFormatter={(value) => `${value} งาน`}
               />
               <Tooltip content={<CustomTooltip />} />
               <Bar 
                 dataKey="count" 
                 fill="#10b981"
                 radius={[4, 4, 0, 0]}
                 label={{ 
                   position: 'top',
                   fill: '#374151',
                   fontSize: 12,
                   formatter: (value: number) => `${value} งาน`
                 }}
               />
             </BarChart>
           </ResponsiveContainer>
         </div>
       ) : (
         <div className="text-center py-4 text-gray-500">
           ไม่มีข้อมูลสถิติรายเดือน
         </div>
       )}
     </Card>
   </>
 );
}