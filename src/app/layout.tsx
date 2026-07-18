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
  title: "Arecanut and Pepper Price at TSS Sirsi Today | Live Market Rates & AI Forecast",
  description: "Check today's exact, 100% accurate Arecanut and Pepper Price at TSS Sirsi market. View live APMC rates, Rashi, Chali, Kempu Gotu, and exclusive AI-powered 7-day price predictions.",
  keywords: ["Arecanut and Pepper Price at TSS Sirsi", "TSS Sirsi", "Arecanut price Sirsi today", "Sirsi supari price", "TSS market rate", "Sirsi APMC arecanut", "Sirsi Adike rate", "betel nut price Sirsi", "Rashi arecanut price", "Chali kempu price", "Totagars Cooperative Sale Society", "kalumenasu price", "black pepper price Sirsi", "Sirsi adike price", "arecanut prediction", "Sirsi", "Adike", "TSS", "TSS black pepper", "APMC Sirsi market rates", "Arecanut price prediction 2026", "TSS Sirsi tender price", "Kempu Gotu price", "Sirsi market arecanut price today", "Sirsi adike market online", "tomorrow sirsi adike price", "ಶಿರಸಿ ಅಡಿಕೆ ಮಾರುಕಟ್ಟೆ ದರ tss", "ಅಡಿಕೆ ಇಂದಿನ ದರ", "ಶಿರಸಿ ಟಿಎಸ್ಎಸ್ ಅಡಿಕೆ ಬೆಲೆ", "Sirsi adike dara today"],
  metadataBase: new URL('https://tss-price-predictor.vercel.app'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: "Arecanut and Pepper Price at TSS Sirsi Today | Live Rates & AI Forecast",
    description: "Check today's true TSS Sirsi Arecanut and Pepper prices. View 7-day AI predictions for Rashi, Kempu Gotu, Chali, and Pepper to maximize your profits.",
    type: "article",
    locale: "en_IN",
    siteName: "TSS Sirsi Price Predictor",
    authors: ["TSS Price Predictor"],
  },
  twitter: {
    card: "summary_large_image",
    title: "Arecanut and Pepper Price at TSS Sirsi Today",
    description: "Daily market rates and AI predictions for Sirsi Arecanut farmers.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  manifest: "/manifest.json",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": "TSS Sirsi Smart Price Predictor",
    "description": "Live daily market prices and AI-powered 7-day price predictions for TSS Sirsi Arecanut (Rashi, Chali, Kempu Gotu, Pepper).",
    "applicationCategory": "BusinessApplication",
    "operatingSystem": "All",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "INR"
    },
    "provider": {
      "@type": "Organization",
      "name": "TSS Price Predictor"
    },
    "keywords": "TSS Sirsi, Arecanut price, Sirsi APMC, Rashi arecanut price, Chali arecanut"
  };

  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable}`}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
