import { NextRequest, NextResponse } from 'next/server';

const API_BASE = 'https://civicspace-gqdcg0dxgjbqe8as.southeastasia-01.azurewebsites.net/api/v1';

export async function GET(request: NextRequest) {
  try {
    const response = await fetch(`${API_BASE}/categories/`, {
      cache: 'no-store',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      signal: AbortSignal.timeout(30000),
    });

    if (!response.ok) {
      console.log(`❌ Categories API failed: ${response.status}, falling back to mock data`);
      // Return mock categories data when API fails
      const mockCategories = {
        count: 3,
        results: [
          {
            id: 1,
            name: "บวช",
            slug: "ordain",
            description: "เรื่องราวเกี่ยวกับการบวช",
            post_count: 5
          },
          {
            id: 2,
            name: "นครศรีธรรมราช",
            slug: "nakhonsithammarat", 
            description: "ข่าวสารจากจังหวัดนครศรีธรรมราช",
            post_count: 3
          },
          {
            id: 3,
            name: "สุขภาพ",
            slug: "health",
            description: "เรื่องราวเกี่ยวกับสุขภาพ",
            post_count: 4
          }
        ]
      };
      return NextResponse.json(mockCategories);
    }

    const data = await response.json();
    console.log('✅ Successfully fetched categories');
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching categories:', error);
    
    // Return empty fallback for errors
    return NextResponse.json({ count: 0, results: [] });
  }
}