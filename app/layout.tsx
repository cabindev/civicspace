// layout.tsx
import type { Metadata } from "next";
import "./globals.css";
import SessionProvider from "./components/SessionProvider";
import { getServerSession } from "next-auth";
import authOptions from "./lib/configs/auth/authOptions";
import AntdProvider from "./components/AntdProvider";
import { seppuri } from './fonts';

export const metadata: Metadata = {
  title: "มูลนิธิเครือข่ายพลังสังคม | SSN Thailand",
  description: "ฐานข้อมูลมูลนิธิเครือข่ายพลังสังคม รวบรวมข้อมูลงานบุญประเพณี นโยบายสาธารณะ กลุ่มชาติพันธุ์ และกิจกรรมสร้างสรรค์",
  keywords: ["มูลนิธิเครือข่ายพลังสังคม", "SSN", "งานบุญประเพณี", "นโยบายสาธารณะ", "กลุ่มชาติพันธุ์"],
  authors: [{ name: "SSN Thailand" }],
  creator: "SSN Thailand",
  publisher: "มูลนิธิเครือข่ายพลังสังคม",
  openGraph: {
    type: 'website',
    title: 'มูลนิธิเครือข่ายพลังสังคม | SSN Thailand',
    description: 'ฐานข้อมูลมูลนิธิเครือข่ายพลังสังคม',
    url: 'https://database.ssnthailand.com',
    siteName: 'SSN Thailand',
  },
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);

  return (
    <html lang="th" className={seppuri.variable}>
      <body>
        <SessionProvider session={session}>
          <AntdProvider>
            {children}
          </AntdProvider>
        </SessionProvider>
      </body>
    </html>
  );
}