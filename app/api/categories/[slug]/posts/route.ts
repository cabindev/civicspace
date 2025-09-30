import { NextRequest, NextResponse } from 'next/server';

const API_BASE = 'https://civicspace-gqdcg0dxgjbqe8as.southeastasia-01.azurewebsites.net/api/v1';

interface CategoryPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export async function GET(request: NextRequest, { params }: CategoryPageProps) {
  try {
    const { slug } = await params;
    const { searchParams } = new URL(request.url);
    const page = searchParams.get('page') || '1';
    const pageSize = searchParams.get('page_size') || '20';

    console.log(`Fetching posts for category: ${slug}, page: ${page}, pageSize: ${pageSize}`);

    const response = await fetch(`${API_BASE}/categories/${slug}/posts/?page=${page}&page_size=${pageSize}`, {
      cache: 'no-store',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      console.error(`CivicSpace category posts API error: ${response.status} ${response.statusText}`);
      return NextResponse.json(
        { error: 'ไม่สามารถดึงข้อมูลบทความในหมวดหมู่ได้' },
        { status: response.status }
      );
    }

    const data = await response.json();
    console.log(`Successfully fetched category posts for ${slug}, posts count: ${data.videos?.length || 0}`);
    
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching category posts:', error);
    return NextResponse.json(
      { error: 'เกิดข้อผิดพลาดในการดึงข้อมูลบทความ' },
      { status: 500 }
    );
  }
}