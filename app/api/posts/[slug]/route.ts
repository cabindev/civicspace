import { NextRequest, NextResponse } from 'next/server';

const API_BASE = 'https://civicspace-gqdcg0dxgjbqe8as.southeastasia-01.azurewebsites.net/api/v1';

interface PostPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export async function GET(request: NextRequest, { params }: PostPageProps) {
  try {
    const { slug } = await params;

    console.log(`Fetching post: ${slug}`);

    const response = await fetch(`${API_BASE}/posts/${slug}/`, {
      cache: 'no-store',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      console.error(`CivicSpace post API error: ${response.status} ${response.statusText}`);
      return NextResponse.json(
        { error: 'ไม่สามารถดึงข้อมูลบทความได้' },
        { status: response.status }
      );
    }

    const data = await response.json();
    console.log(`Successfully fetched post: ${data.title}`);
    
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching post:', error);
    return NextResponse.json(
      { error: 'เกิดข้อผิดพลาดในการดึงข้อมูลบทความ' },
      { status: 500 }
    );
  }
}