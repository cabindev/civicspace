import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const siteUrl = process.env.NEXTAUTH_URL || 'https://civicspace.sdnthailand.com';
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/dashboard/', '/auth/', '/api/', '/datatable/'],
      },
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
