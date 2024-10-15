import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { DashboardData } from '@/app/types/types';

export async function GET(request: NextRequest) {
  // ในที่นี้คุณจะต้องเติมข้อมูลจริงจาก database หรือแหล่งข้อมูลอื่นๆ
  const dummyData: DashboardData = {
    overview: {
      userCount: 100,
      creativeActivityCount: 50,
      traditionCount: 30,
      publicPolicyCount: 20,
      ethnicGroupCount: 15,
    },
    recentActivities: [
      { description: 'New user registered', date: '2023-04-01' },
      { description: 'New tradition added', date: '2023-03-30' },
    ],
    topViewed: [
      { name: 'Tradition 1', type: 'Tradition', viewCount: 1000 },
      { name: 'Policy 1', type: 'Public Policy', viewCount: 800 },
    ],
    traditionChart: [
      { category: 'Category 1', count: 10 },
      { category: 'Category 2', count: 20 },
    ],
    publicPolicyChart: [
      { level: 'National', count: 5 },
      { level: 'Provincial', count: 15 },
    ],
    creativeActivityChart: [
      {
        category: 'Art',
        subCategories: ['Painting', 'Sculpture'],
        subCategoryCounts: { Painting: 10, Sculpture: 5 },
      },
      {
        category: 'Music',
        subCategories: ['Classical', 'Folk'],
        subCategoryCounts: { Classical: 8, Folk: 12 },
      },
    ],
    ethnicGroupChart: [
      { category: 'Group 1', count: 5 },
      { category: 'Group 2', count: 10 },
    ],
    map: [
      { name: 'Location 1', type: 'Tradition', lat: 13.7563, lng: 100.5018 },
      { name: 'Location 2', type: 'Policy', lat: 18.7883, lng: 98.9853 },
    ],
  };

  return NextResponse.json(dummyData);
}