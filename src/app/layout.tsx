import type { Metadata } from "next";
import { Inter, Outfit, Plus_Jakarta_Sans } from "next/font/google";
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

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-jakarta",
  display: "swap",
  weight: ["700", "800"],
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
    <html lang="en" className={`${inter.variable} ${outfit.variable} ${plusJakartaSans.variable}`}>
      <head>
        {process.env.NEXT_PUBLIC_GTM_ID && (
          <script
            dangerouslySetInnerHTML={{
              __html: `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','${process.env.NEXT_PUBLIC_GTM_ID}');`,
            }}
          />
        )}
      </head>
      <body className="font-sans antialiased">{children}</body>
    </html>
  );
}
