import { NextRequest, NextResponse } from 'next/server';

const API_BASE = 'https://civicspace-gqdcg0dxgjbqe8as.southeastasia-01.azurewebsites.net/api/v1';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = searchParams.get('page') || '1';
    const pageSize = searchParams.get('page_size') || '20';
    const type = searchParams.get('type') || 'all'; // all, popular, categories

    let url = '';
    
    switch (type) {
      case 'popular':
        const limit = searchParams.get('limit') || '4';
        url = `${API_BASE}/posts/popular/?limit=${limit}`;
        break;
      case 'categories':
        url = `${API_BASE}/categories/`;
        break;
      default:
        url = `${API_BASE}/posts/?page=${page}&page_size=${pageSize}`;
    }

    console.log('Fetching from CivicSpace API:', url);

    const response = await fetch(url, {
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`CivicSpace API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    console.log(`Successfully fetched CivicSpace data, type: ${type}`);

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error in CivicSpace API route:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch CivicSpace data', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
}