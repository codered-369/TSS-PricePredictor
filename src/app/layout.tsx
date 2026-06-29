import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "TSS Arecanut Price Sirsi Today | Daily Market Rates & 7-Day Forecast",
  description: "Get the exact, 100% accurate daily market prices for TSS Sirsi Arecanut (Rashi, Chali, Kempu Gotu, Pepper). Check live APMC rates and our exclusive AI-powered 7-day price prediction to know exactly when to sell your crop.",
  keywords: ["TSS Sirsi", "Arecanut price Sirsi today", "Sirsi supari price", "TSS market rate", "Sirsi APMC arecanut", "betel nut price Sirsi", "Rashi arecanut price", "Chali kempu price", "Totagars Cooperative Sale Society"],
  openGraph: {
    title: "TSS Arecanut Price Sirsi | Live Rates & AI Forecast",
    description: "Check today's true TSS Sirsi Arecanut prices. View 7-day AI predictions for Rashi, Kempu Gotu, Chali, and Pepper to maximize your profits.",
    type: "website",
    locale: "en_IN",
    siteName: "TSS Sirsi Price Predictor",
  },
  twitter: {
    card: "summary_large_image",
    title: "TSS Arecanut Price Sirsi Today",
    description: "Daily market rates and AI predictions for Sirsi Arecanut farmers.",
  },
  robots: "index, follow",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable}`}>
      <body>{children}</body>
    </html>
  );
}
