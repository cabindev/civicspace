import { NextRequest, NextResponse } from 'next/server';

const API_BASE = 'https://civicspace-gqdcg0dxgjbqe8as.southeastasia-01.azurewebsites.net/api/v1';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'all';
    const limit = searchParams.get('limit') || '10';
    const page = searchParams.get('page') || '1';

    let endpoint = '';
    
    if (type === 'latest') {
      endpoint = `/videos/latest/?limit=${limit}`;
    } else if (type === 'popular') {
      endpoint = `/videos/popular/?limit=${limit}`;
    } else {
      endpoint = `/videos/?page=${page}`;
    }

    console.log('Fetching videos from CivicSpace API:', `${API_BASE}${endpoint}`);

    const response = await fetch(`${API_BASE}${endpoint}`, {
      cache: 'no-store',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      console.error(`CivicSpace videos API error: ${response.status} ${response.statusText}`);
      
      // If videos endpoint is not implemented yet (404), return empty result
      if (response.status === 404) {
        console.log('Videos API not yet implemented, returning empty result');
        return NextResponse.json({
          results: [],
          count: 0,
          next: null,
          previous: null
        });
      }
      
      return NextResponse.json(
        { error: 'ไม่สามารถดึงข้อมูลวิดีโอได้' },
        { status: response.status }
      );
    }

    const data = await response.json();
    console.log(`Successfully fetched videos data, type: ${type}, count: ${data.results?.length || data.length || 0}`);
    
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching videos:', error);
    return NextResponse.json(
      { error: 'เกิดข้อผิดพลาดในการดึงข้อมูลวิดีโอ' },
      { status: 500 }
    );
  }
}