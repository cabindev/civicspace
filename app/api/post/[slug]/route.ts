import { NextRequest, NextResponse } from 'next/server';

const API_BASE = 'https://civicspace-gqdcg0dxgjbqe8as.southeastasia-01.azurewebsites.net/api/v1';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    
    // Fetch single post from external API
    const response = await fetch(`${API_BASE}/posts/${slug}/`, {
      cache: 'no-store',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      console.error(`Post API error: ${response.status} ${response.statusText} for slug: ${slug}`);
      throw new Error(`Post API error: ${response.status}`);
    }

    const post = await response.json();
    console.log(`✅ Successfully fetched post: ${slug}`);
    
    return NextResponse.json(post);
  } catch (error) {
    console.error('Error fetching post:', error);
    return NextResponse.json(
      { error: 'Failed to fetch post from external API' },
      { status: 500 }
    );
  }
}