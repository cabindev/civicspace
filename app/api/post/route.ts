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
      console.error(`Posts API error: ${response.status} ${response.statusText}`);
      throw new Error(`Posts API error: ${response.status}`);
    }

    const data = await response.json();
    console.log(`✅ Successfully fetched posts, type: ${type || 'all'}`);
    
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching posts:', error);
    return NextResponse.json(
      { error: 'Failed to fetch posts from external API' },
      { status: 500 }
    );
  }
}