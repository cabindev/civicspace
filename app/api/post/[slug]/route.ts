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
      console.log(`❌ Post API failed: ${response.status}, falling back to mock data for slug: ${slug}`);
      
      // Return mock data for development
      const mockPost = {
        id: parseInt(slug) || 1,
        title: slug === "1" ? "งานพระบวช 1 รูป...คนอ่างทองต้องเสียเงินเท่าไหร่กัน?" : "เส้นทางงานบุญสารทเดือนสิบ",
        slug: slug,
        content: `<p>เนื้อหาของบทความ ${slug}</p><p>นี่คือเนื้อหาตัวอย่างสำหรับบทความที่มี slug เป็น "${slug}"</p><p>เนื้อหานี้จะถูกแทนที่ด้วยข้อมูลจริงเมื่อ API พร้อมใช้งาน</p>`,
        author: "CivicSpace Team",
        category: { id: 1, name: "บวช", slug: "ordain" },
        tags: [
          { id: 1, name: "งานบุญ", slug: "ceremony" },
          { id: 2, name: "ค่าใช้จ่าย", slug: "expenses" }
        ],
        featured_image_url: `https://picsum.photos/800/600?random=${slug}`,
        created_at: "2024-01-15T10:00:00Z",
        view_count: 1250,
        reading_time: 5
      };
      
      return NextResponse.json(mockPost);
    }

    const post = await response.json();
    console.log(`✅ Successfully fetched post: ${slug}`);
    
    return NextResponse.json(post);
  } catch (error) {
    console.error('Error fetching post:', error);
    
    const { slug } = await params;
    
    // Return mock data even on error for development
    const mockPost = {
      id: parseInt(slug) || 1,
      title: slug === "1" ? "งานพระบวช 1 รูป...คนอ่างทองต้องเสียเงินเท่าไหร่กัน?" : "เส้นทางงานบุญสารทเดือนสิบ",
      slug: slug,
      content: `<p>เนื้อหาของบทความ ${slug}</p><p>นี่คือเนื้อหาตัวอย่างสำหรับบทความที่มี slug เป็น "${slug}"</p><p>เนื้อหานี้จะถูกแทนที่ด้วยข้อมูลจริงเมื่อ API พร้อมใช้งาน</p>`,
      author: "CivicSpace Team",
      category: { id: 1, name: "บวช", slug: "ordain" },
      tags: [
        { id: 1, name: "งานบุญ", slug: "ceremony" },
        { id: 2, name: "ค่าใช้จ่าย", slug: "expenses" }
      ],
      featured_image_url: `https://picsum.photos/800/600?random=${slug}`,
      created_at: "2024-01-15T10:00:00Z",
      view_count: 1250,
      reading_time: 5
    };
    
    console.log(`📝 Returning mock post data for slug: ${slug}`);
    return NextResponse.json(mockPost);
  }
}