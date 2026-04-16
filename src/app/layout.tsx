import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"], display: "swap" });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"], display: "swap" });

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://ai-tools-nav-two.vercel.app'

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: "AI 工具导航 — 最全 AI 工具测评与使用教程",
  description: "发现最好用的 AI 工具，包含 ChatGPT、Midjourney、Claude 等详细测评和中文使用教程。",
  verification: {
    google: "rJVzvX4F_LaDQR5GcbZVIsPMxTEnoB6zIf6BZB-NXeM",
  },
  openGraph: {
    type: 'website',
    url: SITE_URL,
    title: 'AI 工具导航 — 最全 AI 工具测评与使用教程',
    description: '发现最好用的 AI 工具，包含 ChatGPT、Midjourney、Claude 等详细测评和中文使用教程。',
    siteName: 'AI工具导航',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AI 工具导航 — 最全 AI 工具测评与使用教程',
    description: '发现最好用的 AI 工具，包含 ChatGPT、Midjourney、Claude 等详细测评和中文使用教程。',
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const baiduId = process.env.NEXT_PUBLIC_BAIDU_TONGJI_ID
  return (
    <html lang="zh-CN">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen flex flex-col`}>
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
        {baiduId && (
          <Script id="baidu-tongji" strategy="afterInteractive">
            {`var _hmt = _hmt || []; (function() { var hm = document.createElement("script"); hm.src = "https://hm.baidu.com/hm.js?${baiduId}"; var s = document.getElementsByTagName("script")[0]; s.parentNode.insertBefore(hm, s); })();`}
          </Script>
        )}
      </body>
    </html>
  );
}
