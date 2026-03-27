import type { Metadata } from "next";
import { Inter, Outfit } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Peeeky — Share documents. Know who reads them.",
    template: "%s | Peeeky",
  },
  description:
    "Secure document sharing with page-level analytics and AI intelligence. Track who reads your pitch decks, proposals, and contracts.",
  metadataBase: new URL("https://peeeky.com"),
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://peeeky.com",
    siteName: "Peeeky",
    title: "Peeeky — Share documents. Know who reads them.",
    description:
      "Secure document sharing with page-level analytics and AI intelligence.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Peeeky — Share documents. Know who reads them.",
    description:
      "Track who reads your pitch decks, proposals, and contracts. AI-powered document intelligence.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${outfit.variable}`}>
      <body className="font-sans antialiased">{children}</body>
    </html>
  );
}
