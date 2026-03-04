import { MetadataRoute } from 'next';

const SITE_URL = process.env.NEXTAUTH_URL || 'https://civicspace.sdnthailand.com';
const API_BASE = 'https://civicspace-gqdcg0dxgjbqe8as.southeastasia-01.azurewebsites.net/api/v1';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticPages: MetadataRoute.Sitemap = [
    { url: SITE_URL, lastModified: new Date(), changeFrequency: 'daily', priority: 1 },
    { url: `${SITE_URL}/post`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.9 },
    { url: `${SITE_URL}/video`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.8 },
  ];

  try {
    const res = await fetch(`${API_BASE}/posts/`, { next: { revalidate: 3600 } });
    if (!res.ok) return staticPages;

    const data = await res.json();
    const posts: Array<{ slug: string; updated_at?: string; created_at: string }> =
      Array.isArray(data) ? data : (data.results || []);

    const postPages: MetadataRoute.Sitemap = posts.map((post) => ({
      url: `${SITE_URL}/post/${post.slug}`,
      lastModified: new Date(post.updated_at || post.created_at),
      changeFrequency: 'weekly',
      priority: 0.8,
    }));

    return [...staticPages, ...postPages];
  } catch {
    return staticPages;
  }
}
