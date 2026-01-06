import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Modern Blog - AI-Powered Content Platform",
  description: "A modern blog platform with AI-powered search, smart summaries, and interactive content. Built with Next.js 15, TypeScript, and shadcn/ui.",
  keywords: ["Next.js", "TypeScript", "Tailwind CSS", "shadcn/ui", "AI blog", "digital garden", "portfolio"],
  authors: [{ name: "Z.ai Team" }],
  icons: {
    icon: "https://z-cdn.chatglm.cn/z-ai/static/logo.svg",
  },
  openGraph: {
    title: "Modern Blog - AI-Powered Content Platform",
    description: "A modern blog platform with AI-powered features",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Modern Blog",
    description: "AI-powered blog platform",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
