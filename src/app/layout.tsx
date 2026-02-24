import type { Metadata } from "next";
import { Syne, DM_Sans } from "next/font/google";
import "../styles/globals.css";
import { LanguageProvider } from '../context/LanguageContext';

const syne = Syne({
  subsets: ["latin"],
  variable: "--font-syne",
  display: "swap",
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-dm-sans",
  display: "swap",
});

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ?? (typeof window !== "undefined" ? window.location.origin : "https://freestoksphoto.com");

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Free Stoks Photo — Free Stock Photos & Reverse Image Search",
    template: "%s | Free Stoks Photo",
  },
  description:
    "Find free stock photos and free alternatives to premium images. Free Stoks Photo lets you search by image and discover royalty-free photos from multiple sources.",
  keywords: [
    "free stoks photo",
    "free stock photos",
    "stock photo finder",
    "reverse image search",
    "free images",
    "royalty free photos",
    "stock photography free",
  ],
  authors: [{ name: "Free Stoks Photo" }],
  creator: "Free Stoks Photo",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: siteUrl,
    siteName: "Free Stoks Photo",
    title: "Free Stoks Photo — Free Stock Photos & Reverse Image Search",
    description:
      "Find free stock photos and free alternatives to premium images. Search by image and discover royalty-free photos.",
    images: [{ url: "/logo.svg", width: 512, height: 512, alt: "Free Stoks Photo" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Free Stoks Photo — Free Stock Photos & Reverse Image Search",
    description: "Find free stock photos and free alternatives to premium images.",
  },
  robots: {
    index: true,
    follow: true,
  },
  icons: {
    icon: [{ url: "/icon.svg", type: "image/svg+xml" }],
    apple: "/logo.svg",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="tr" className={`${syne.variable} ${dmSans.variable}`}>
      <body>
        <LanguageProvider>
          <div className="appRoot">
            {children}
          </div>
        </LanguageProvider>
      </body>
    </html>
  );
}
