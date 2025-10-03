import { NextRequest, NextResponse } from 'next/server';

const API_BASE = 'https://civicspace-gqdcg0dxgjbqe8as.southeastasia-01.azurewebsites.net/api/v1';

export async function GET(request: NextRequest) {
  try {
    const response = await fetch(`${API_BASE}/post-types/`, {
      cache: 'no-store',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      signal: AbortSignal.timeout(30000),
    });

    if (!response.ok) {
      console.log(`❌ Post Types API failed: ${response.status}, falling back to mock data`);
      // Return mock post types data when API fails
      const mockPostTypes = {
        count: 4,
        results: [
          {
            id: 1,
            name: "บทความ",
            slug: "article",
            description: "บทความทั่วไป",
            color: "#3b82f6",
            post_count: 8
          },
          {
            id: 2,
            name: "ข่าวสาร",
            slug: "news",
            description: "ข่าวสารและการประชาสัมพันธ์",
            color: "#10b981",
            post_count: 5
          },
          {
            id: 3,
            name: "งานวิจัย",
            slug: "research",
            description: "ผลงานวิจัยและการศึกษา",
            color: "#8b5cf6",
            post_count: 3
          },
          {
            id: 4,
            name: "คู่มือ",
            slug: "guide",
            description: "คู่มือและแนวทางปฏิบัติ",
            color: "#f59e0b",
            post_count: 6
          }
        ]
      };
      return NextResponse.json(mockPostTypes);
    }

    const data = await response.json();
    console.log('✅ Successfully fetched post types');
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching post types:', error);
    
    // Return empty fallback for errors
    return NextResponse.json({ count: 0, results: [] });
  }
}