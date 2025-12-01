// app/api/videos/[slug]/route.ts
import { NextResponse } from 'next/server';

const API_BASE = 'https://civicspace-gqdcg0dxgjbqe8as.southeastasia-01.azurewebsites.net/api/v1';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;

  try {
    console.log('Fetching video from CivicSpace API:', `${API_BASE}/videos/${slug}/`);
    const response = await fetch(`${API_BASE}/videos/${slug}/`, {
      cache: 'no-store',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      console.error(`Video API error: ${response.status} ${response.statusText} for slug: ${slug}`);
      throw new Error(`Video API error: ${response.status}`);
    }

    const video = await response.json();
    console.log(`✅ Successfully fetched video: ${slug}`);

    return NextResponse.json(video);
  } catch (error) {
    console.error('Error fetching video:', error);
    return NextResponse.json(
      { error: 'Failed to fetch video from external API' },
      { status: 500 }
    );
  }
}
