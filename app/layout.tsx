import type { Metadata } from "next";
import "./globals.css";
import SessionProvider from "./components/SessionProvider";
import { getServerSession } from "next-auth";
import authOptions from "./lib/configs/auth/authOptions";
import AntdProvider from "./components/AntdProvider";
import 'antd/dist/reset.css';
import { seppuri } from './fonts';

export const metadata: Metadata = {
  title: "SSN Thailand",
  description: "Social Security Number Thailand",
};

type RootLayoutProps = {
  children: React.ReactNode;
};

export default async function RootLayout({ children }: RootLayoutProps) {
  const session = await getServerSession(authOptions);

  return (
    <html lang="th">  {/* ลบ className={`${seppuri.variable}`} */}
      <body>  {/* ลบ className={seppuri.className} */}
        <SessionProvider session={session}>
          <AntdProvider>
            {children}
          </AntdProvider>
        </SessionProvider>
      </body>
    </html>
  );
}