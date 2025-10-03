import { NextRequest, NextResponse } from 'next/server';

const API_BASE = 'https://civicspace-gqdcg0dxgjbqe8as.southeastasia-01.azurewebsites.net/api/v1';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get('type') || 'latest';
  const limit = searchParams.get('limit') || '6';
  
  try {
    
    let endpoint: string;
    if (type === 'latest') {
      endpoint = `/videos/latest/?limit=${limit}`;
    } else {
      endpoint = `/videos/?limit=${limit}`;
    }
    
    console.log('Fetching videos from CivicSpace API:', `${API_BASE}${endpoint}`);
    
    const response = await fetch(`${API_BASE}${endpoint}`, {
      cache: 'no-store',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      signal: AbortSignal.timeout(30000),
    });

    if (!response.ok) {
      console.log(`CivicSpace videos API error: ${response.status} ${response.statusText}`);
      throw new Error(`Videos API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    console.log(`Successfully fetched videos data, type: ${type}, count: ${data.length || data.results?.length || 0}`);
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching videos:', error);
    console.log('Videos API not yet implemented, returning mock data for testing');
    
    // Mock video data for development
    const mockVideos = [
      {
        id: 1,
        title: "การดื่มแอลกอฮอล์ในงานบุญ",
        slug: "alcohol-ceremony",
        description: "สำรวจการดื่มแอลกอฮอล์ในพิธีกรรมและงานบุญต่างๆ",
        video_url: "https://www.youtube.com/embed/dQw4w9WgXcQ",
        thumbnail_url: "https://picsum.photos/400/600?random=101",
        category: { id: 1, name: "บวช", slug: "ordain" },
        created_at: "2024-01-15T10:00:00Z",
        view_count: 1250,
        duration: "05:30"
      },
      {
        id: 2,
        title: "แนวทางลดการบริโภคแอลกอฮอล์",
        slug: "alcohol-reduction",
        description: "วิธีการและเทคนิคในการลดการดื่มแอลกอฮอล์",
        video_url: "https://www.youtube.com/embed/dQw4w9WgXcQ",
        thumbnail_url: "https://picsum.photos/400/600?random=102",
        category: { id: 2, name: "สุขภาพ", slug: "health" },
        created_at: "2024-01-14T09:00:00Z",
        view_count: 980,
        duration: "07:15"
      },
      {
        id: 3,
        title: "ผลกระทบของแอลกอฮอล์ต่อชุมชน",
        slug: "alcohol-community-impact",
        description: "การศึกษาผลกระทบของแอลกอฮอล์ต่อชุมชนไทย",
        video_url: "https://www.youtube.com/embed/dQw4w9WgXcQ",
        thumbnail_url: "https://picsum.photos/400/600?random=103",
        category: { id: 3, name: "สังคม", slug: "society" },
        created_at: "2024-01-13T14:30:00Z",
        view_count: 756,
        duration: "10:20"
      },
      {
        id: 4,
        title: "การป้องกันการดื่มแอลกอฮอล์ในเยาวชน",
        slug: "youth-alcohol-prevention",
        description: "มาตรการและแนวทางป้องกันเยาวชนจากการดื่มแอลกอฮอล์",
        video_url: "https://www.youtube.com/embed/dQw4w9WgXcQ",
        thumbnail_url: "https://picsum.photos/400/600?random=104",
        category: { id: 4, name: "เยาวชน", slug: "youth" },
        created_at: "2024-01-12T16:45:00Z",
        view_count: 642,
        duration: "08:45"
      },
      {
        id: 5,
        title: "การรักษาติดแอลกอฮอล์",
        slug: "alcohol-treatment",
        description: "วิธีการรักษาและฟื้นฟูผู้ติดแอลกอฮอล์",
        video_url: "https://www.youtube.com/embed/dQw4w9WgXcQ",
        thumbnail_url: "https://picsum.photos/400/600?random=105",
        category: { id: 5, name: "การรักษา", slug: "treatment" },
        created_at: "2024-01-11T11:20:00Z",
        view_count: 523,
        duration: "12:10"
      },
      {
        id: 6,
        title: "แอลกอฮอล์กับวัฒนธรรมไทย",
        slug: "alcohol-thai-culture",
        description: "ความสัมพันธ์ระหว่างแอลกอฮอล์และวัฒนธรรมไทย",
        video_url: "https://www.youtube.com/embed/dQw4w9WgXcQ",
        thumbnail_url: "https://picsum.photos/400/600?random=106",
        category: { id: 6, name: "วัฒนธรรม", slug: "culture" },
        created_at: "2024-01-10T13:15:00Z",
        view_count: 445,
        duration: "15:30"
      }
    ];
    
    const limitNum = parseInt(limit) || 6;
    return NextResponse.json(mockVideos.slice(0, limitNum));
  }
}