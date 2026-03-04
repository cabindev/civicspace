// layout.tsx
import type { Metadata } from "next";
import "./globals.css";
import SessionProvider from "./components/SessionProvider";
import { getServerSession } from "next-auth";
import authOptions from "./lib/configs/auth/authOptions";

const SITE_URL = process.env.NEXTAUTH_URL || 'https://civicspace.sdnthailand.com';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'CivicSpace : พื้นที่พลเมืองร่วมหาทางออกปัญหาแอลกอฮอล์',
    template: '%s | CivicSpace',
  },
  description: 'ศูนย์ข้อมูลและพื้นที่สำหรับเจ้าหน้าที่ในการทำงานร่วมกันหาทางออกปัญหาแอลกอฮอล์ รวบรวมข้อมูล บทความ และโครงการต่างๆ',
  keywords: ['CivicSpace', 'พลเมือง', 'แอลกอฮอล์', 'นโยบายสาธารณะ', 'ศูนย์ข้อมูล', 'เจ้าหน้าที่', 'บทความ', 'งานวิจัย'],
  authors: [{ name: 'CivicSpace Team' }],
  creator: 'CivicSpace',
  publisher: 'CivicSpace',
  alternates: { canonical: SITE_URL },
  openGraph: {
    type: 'website',
    title: 'CivicSpace : พื้นที่พลเมืองร่วมหาทางออกปัญหาแอลกอฮอล์',
    description: 'ศูนย์ข้อมูลสำหรับเจ้าหน้าที่ในการทำงานร่วมกันหาทางออกปัญหาแอลกอฮอล์',
    url: SITE_URL,
    siteName: 'CivicSpace',
    locale: 'th_TH',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'CivicSpace : พื้นที่พลเมืองร่วมหาทางออกปัญหาแอลกอฮอล์',
    description: 'ศูนย์ข้อมูลสำหรับเจ้าหน้าที่ในการทำงานร่วมกันหาทางออกปัญหาแอลกอฮอล์',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, 'max-image-preview': 'large' },
  },
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);

  return (
    <html lang="th">
      <body className="font-sans antialiased">
        <SessionProvider session={session}>
          {children}
        </SessionProvider>
      </body>
    </html>
  );
}