import { NextRequest, NextResponse } from 'next/server';

const API_BASE = 'https://civicspace-gqdcg0dxgjbqe8as.southeastasia-01.azurewebsites.net/api/v1';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = searchParams.get('page') || '1';
    const pageSize = searchParams.get('page_size') || '20';
    const type = searchParams.get('type');
    const limit = searchParams.get('limit');

    let url: string;
    if (type === 'popular') {
      url = `${API_BASE}/posts/popular/?limit=${limit || '4'}`;
    } else {
      url = `${API_BASE}/posts/?page=${page}&page_size=${pageSize}`;
    }

    console.log('Fetching from CivicSpace API:', url);

    const response = await fetch(url, {
      cache: 'no-store',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      signal: AbortSignal.timeout(30000),
    });

    if (!response.ok) {
      console.log(`❌ API failed: ${response.status}, falling back to mock data`);
      // Fallback to mock data when API is not available
      if (type === 'popular') {
        return NextResponse.json([
          {
            id: 1,
            title: "งานพระบวช 1 รูป...คนอ่างทองต้องเสียเงินเท่าไหร่กัน?",
            slug: "1",
            content: "การพิจารณาค่าใช้จ่ายในงานบวชที่เหมาะสม",
            author: "CivicSpace Team",
            category: { id: 1, name: "บวช", slug: "ordain" },
            tags: [],
            featured_image_url: "https://picsum.photos/400/600?random=1",
            created_at: "2024-01-15T10:00:00Z",
            view_count: 1250,
            reading_time: 5
          },
          {
            id: 2,
            title: "เส้นทางงานบุญสารทเดือนสิบ",
            slug: "timeline", 
            content: "การจัดงานบุญประเพณีสารทเดือนสิบ",
            author: "CivicSpace Team",
            category: { id: 2, name: "นครศรีธรรมราช", slug: "nakhonsithammarat" },
            tags: [],
            featured_image_url: "https://picsum.photos/400/800?random=2",
            created_at: "2024-01-14T09:00:00Z",
            view_count: 980,
            reading_time: 4
          }
        ]);
      } else {
        return NextResponse.json({
          count: 12,
          results: [
            {
              id: 1,
              title: "งานพระบวช 1 รูป...คนอ่างทองต้องเสียเงินเท่าไหร่กัน?",
              slug: "1",
              content: "การพิจารณาค่าใช้จ่ายในงานบวชที่เหมาะสม",
              author: "CivicSpace Team",
              category: { id: 1, name: "บวช", slug: "ordain" },
              tags: [],
              featured_image_url: "https://picsum.photos/400/600?random=1",
              created_at: "2024-01-15T10:00:00Z",
              view_count: 1250,
              reading_time: 5
            },
            {
              id: 2,
              title: "เส้นทางงานบุญสารทเดือนสิบ",
              slug: "timeline",
              content: "การจัดงานบุญประเพณีสารทเดือนสิบ",
              author: "CivicSpace Team",
              category: { id: 2, name: "นครศรีธรรมราช", slug: "nakhonsithammarat" },
              tags: [],
              featured_image_url: "https://picsum.photos/400/800?random=2",
              created_at: "2024-01-14T09:00:00Z",
              view_count: 980,
              reading_time: 4
            }
          ]
        });
      }
    }

    const data = await response.json();
    console.log(`✅ Successfully fetched posts, type: ${type || 'all'}`);
    
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching posts:', error);
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    
    // Fallback data for errors
    if (type === 'popular') {
      return NextResponse.json([]);
    }
    return NextResponse.json({ count: 0, results: [] });
  }
}