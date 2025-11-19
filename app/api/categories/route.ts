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
      console.error(`Categories API error: ${response.status} ${response.statusText}`);
      throw new Error(`Categories API error: ${response.status}`);
    }

    const data = await response.json();
    console.log('✅ Successfully fetched categories');
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching categories:', error);
    return NextResponse.json(
      { error: 'Failed to fetch categories from external API' },
      { status: 500 }
    );
  }
}