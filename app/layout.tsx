import type { Metadata, Viewport } from "next";
import { Fraunces, Inter, JetBrains_Mono } from "next/font/google";
import { ThemeProvider } from "next-themes";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Suspense } from "react";
import { siteUrl } from "@/lib/utils";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { JsonLd } from "@/components/seo/JsonLd";
import {
  websiteJsonLd,
  organizationJsonLd,
} from "@/lib/seo/structured-data";
import { GoogleAnalytics } from "@/components/analytics/GoogleAnalytics";
import { WebVitalsReporter } from "@/components/analytics/WebVitalsReporter";
import {
  HeaderUserSlot,
  HeaderUserSlotFallback,
  MobileSignInSlot,
} from "@/components/auth/HeaderUserSlot";
import "./globals.css";

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  display: "swap",
  weight: ["500", "600", "700"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500", "600", "700"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500"],
});

const SITE_NAME = process.env.NEXT_PUBLIC_SITE_NAME ?? "Boardly";
const SITE_DESC =
  "Free step-by-step textbook solutions, question banks, past papers, MCQs and notes for every Indian board and class.";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl()),
  title: {
    default: `${SITE_NAME} — Free Textbook Solutions for Every Board & Class`,
    template: `%s | ${SITE_NAME}`,
  },
  description: SITE_DESC,
  applicationName: SITE_NAME,
  generator: "Next.js",
  authors: [{ name: SITE_NAME }],
  keywords: [
    "textbook solutions",
    "question bank",
    "past papers",
    "MCQs",
    "CBSE",
    "ICSE",
    "Maharashtra Board",
    "free education",
  ],
  alternates: { canonical: "/" },
  manifest: "/manifest.webmanifest",
  category: "education",
  openGraph: {
    type: "website",
    siteName: SITE_NAME,
    locale: "en_IN",
    url: "/",
    title: `${SITE_NAME} — Free Textbook Solutions for Every Board & Class`,
    description: SITE_DESC,
    images: [
      {
        url: "/api/og?type=site",
        width: 1200,
        height: 630,
        alt: SITE_NAME,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `${SITE_NAME} — Free Textbook Solutions for Every Board & Class`,
    description: SITE_DESC,
    images: ["/api/og?type=site"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-snippet": -1,
      "max-image-preview": "large",
      "max-video-preview": -1,
    },
  },
  icons: {
    icon: [{ url: "/icon", type: "image/png", sizes: "32x32" }],
    apple: [{ url: "/apple-icon", sizes: "180x180", type: "image/png" }],
  },
  formatDetection: {
    telephone: false,
    email: false,
    address: false,
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#FAFBF9" },
    { media: "(prefers-color-scheme: dark)", color: "#0A0F0E" },
  ],
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${fraunces.variable} ${inter.variable} ${jetbrainsMono.variable} antialiased`}
    >
      <body className="min-h-svh bg-bg text-fg flex flex-col">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50 focus:rounded focus:bg-primary focus:px-3 focus:py-2 focus:text-primary-fg"
        >
          Skip to main content
        </a>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <Header
            userSlot={
              <Suspense fallback={<HeaderUserSlotFallback />}>
                <HeaderUserSlot />
              </Suspense>
            }
            mobileSignInSlot={
              <Suspense fallback={null}>
                <MobileSignInSlot />
              </Suspense>
            }
          />
          {children}
          <Footer />
        </ThemeProvider>
        <JsonLd data={websiteJsonLd()} id="ld-website" />
        <JsonLd data={organizationJsonLd()} id="ld-organization" />
        <Analytics />
        <SpeedInsights />
        <GoogleAnalytics id={process.env.NEXT_PUBLIC_GA_ID ?? ""} />
        <WebVitalsReporter />
      </body>
    </html>
  );
}
