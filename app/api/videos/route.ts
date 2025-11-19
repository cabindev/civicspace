// app/api/videos/route.ts
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
    console.error('Error fetching videos from CivicSpace API:', error);
    return NextResponse.json(
      { error: 'Failed to fetch videos from external API' },
      { status: 500 }
    );
  }
}