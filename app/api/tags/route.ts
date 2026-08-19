import { NextResponse } from 'next/server';

const API_BASE = 'https://civicspace-gqdcg0dxgjbqe8as.southeastasia-01.azurewebsites.net/api/v1';

export async function GET() {
  try {
    const response = await fetch(`${API_BASE}/tags/`, {
      cache: 'no-store',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      signal: AbortSignal.timeout(30000),
    });

    if (!response.ok) {
      console.error(`Tags API error: ${response.status} ${response.statusText}`);
      throw new Error(`Tags API error: ${response.status}`);
    }

    const data = await response.json();
    console.log('✅ Successfully fetched tags');
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching tags:', error);
    return NextResponse.json(
      { error: 'Failed to fetch tags from external API' },
      { status: 500 }
    );
  }
}
