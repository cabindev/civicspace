import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import SessionProvider from "./components/SessionProvider";
import { getServerSession } from "next-auth";
import authOptions from "./lib/configs/auth/authOptions";
import ConditionalNavbar from "./components/ConditionalNavbar";
import AntdProvider from "./components/AntdProvider";
import 'antd/dist/reset.css';

const seppuriSemibold = localFont({
  src: "./fonts/seppuri-semibold-webfont.woff2",
  variable: "--font-seppuri-semibold",
  weight: "600",
  display: "swap",
});

const seppuriThin = localFont({
  src: "./fonts/seppuri-thin-webfont.woff",
  variable: "--font-seppuri-thin",
  weight: "100",
  display: "swap",
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
      <body
        className={`${seppuriSemibold.variable} ${seppuriThin.variable} antialiased`}
      >
        <SessionProvider session={session}>
          <AntdProvider>
            <ConditionalNavbar />
            {children}
          </AntdProvider>
        </SessionProvider>
      </body>
    </html>
  );
}