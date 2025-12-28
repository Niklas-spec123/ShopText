import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/react";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "ShopText – Product descriptions for online stores",
    template: "%s · ShopText",
  },
  description:
    "Write product descriptions, SEO titles and ad copy in seconds. Built for Shopify sellers and small online stores that want to save time.",
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"
  ),

  openGraph: {
    type: "website",
    siteName: "ShopText",
    title: "ShopText – Product copy for online stores",
    description:
      "Create product descriptions, SEO titles and ad copy in seconds. A simple writing tool for Shopify sellers and side hustlers.",
    url: "/",
    images: [
      {
        url: "/og.png",
        width: 1200,
        height: 630,
        alt: "ShopText – Product descriptions made easy",
      },
    ],
  },

  twitter: {
    card: "summary_large_image",
    title: "ShopText – Product copy for online stores",
    description:
      "Write product descriptions, SEO titles and ads faster. Built for small e-commerce stores.",
    images: ["/og.png"],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-slate-950 text-slate-100 antialiased">
        {children}
        <Analytics />
      </body>
    </html>
  );
}
