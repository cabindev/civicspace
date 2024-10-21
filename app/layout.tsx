import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import SessionProvider from "./components/SessionProvider";
import { getServerSession } from "next-auth";
import authOptions from "./lib/configs/auth/authOptions";
import AntdProvider from "./components/AntdProvider";
import 'antd/dist/reset.css';

const seppuri = localFont({
  src: [
    {
      path: './fonts/seppuri-thin-webfont.woff2',
      weight: '100',
      style: 'normal',
    },
    {
      path: './fonts/seppuri-extralight-webfont.woff2',
      weight: '200',
      style: 'normal',
    },
    {
      path: './fonts/seppuri-regular-webfont.woff2',
      weight: '400',
      style: 'normal',
    },
    {
      path: './fonts/seppuri-medium-webfont.woff2',
      weight: '500',
      style: 'normal',
    },
    {
      path: './fonts/seppuri-semibold-webfont.woff2',
      weight: '600',
      style: 'normal',
    },
    {
      path: './fonts/seppuri-bold-webfont.woff2',
      weight: '700',
      style: 'normal',
    },
  ],
  variable: '--font-seppuri',
  display: 'swap',
});

export const metadata: Metadata = {
  title: "SSN Thailand",
  description: "Social Security Number Thailand",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await getServerSession(authOptions);

  return (
    <html lang="th">
      <body className={`${seppuri.variable} font-sans antialiased`}>
        <SessionProvider session={session}>
          <AntdProvider>
            {children}
          </AntdProvider>
        </SessionProvider>
      </body>
    </html>
  );
}