// app/api/surveys/route.ts
import { NextResponse } from 'next/server';

const API_BASE = 'https://civicspace-gqdcg0dxgjbqe8as.southeastasia-01.azurewebsites.net/api/v1';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const limit = searchParams.get('limit') || '10';

    let endpoint = `${API_BASE}/surveys/`;

    if (type === 'latest') {
      endpoint = `${API_BASE}/surveys/latest/?limit=${limit}`;
    } else if (type === 'popular') {
      endpoint = `${API_BASE}/surveys/popular/?limit=${limit}`;
    }

    const response = await fetch(endpoint, {
      headers: {
        'Content-Type': 'application/json',
      },
      cache: 'no-store'
    });

    if (!response.ok) {
      console.log('Surveys API endpoint not available yet');
      return NextResponse.json([]);
    }

    const data = await response.json();

    // Handle paginated response structure
    if (data.results && Array.isArray(data.results)) {
      return NextResponse.json(data.results);
    }

    // Handle direct array response
    if (Array.isArray(data)) {
      return NextResponse.json(data);
    }

    return NextResponse.json([]);
  } catch (error) {
    console.error('Error fetching surveys:', error);
    return NextResponse.json([]);
  }
}
