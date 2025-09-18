// layout.tsx
import type { Metadata } from "next";
import "./globals.css";
import SessionProvider from "./components/SessionProvider";
import { getServerSession } from "next-auth";
import authOptions from "./lib/configs/auth/authOptions";

export const metadata: Metadata = {
  title: "CivicSpace : พื้นที่พลเมืองร่วมหาทางออกปัญหาแอลกอฮอล์",
  description: "ศูนย์ข้อมูลและพื้นที่สำหรับเจ้าหน้าที่ในการทำงานร่วมกันหาทางออกปัญหาแอลกอฮอล์ รวบรวมข้อมูล บทความ และโครงการต่างๆ",
  keywords: ["CivicSpace", "พลเมือง", "แอลกอฮอล์", "นโยบายสาธารณะ", "ศูนย์ข้อมูล"],
  authors: [{ name: "CivicSpace Team" }],
  creator: "CivicSpace",
  publisher: "CivicSpace : พื้นที่พลเมืองร่วมหาทางออกปัญหาแอลกอฮอล์",
  openGraph: {
    type: 'website',
    title: 'CivicSpace : พื้นที่พลเมืองร่วมหาทางออกปัญหาแอลกอฮอล์',
    description: 'ศูนย์ข้อมูลสำหรับเจ้าหน้าที่ในการทำงานร่วมกันหาทางออกปัญหาแอลกอฮอล์',
    url: 'https://civicspace.com',
    siteName: 'CivicSpace',
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