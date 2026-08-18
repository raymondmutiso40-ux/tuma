import type { Metadata, Viewport } from "next";
import { Inter, Archivo_Black, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import Providers from "./providers";

// Self-hosted via next/font: no render-blocking request to Google, no
// layout shift, and only the weights we actually use get shipped.
const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-body",
});

const archivoBlack = Archivo_Black({
  subsets: ["latin"],
  weight: "400",
  display: "swap",
  variable: "--font-display",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  display: "swap",
  variable: "--font-mono",
});

export const metadata: Metadata = {
  title: {
    default: "tuma. — Skip the line. Print your ticket at home.",
    template: "%s · tuma.",
  },
  description:
    "Pre-book your parcel with any carrier in Kenya, pay on M-Pesa and arrive at the counter with a ready QR ticket. No forms. No queue.",
  keywords: [
    "parcel booking Kenya",
    "courier Nairobi",
    "bus parcel service",
    "M-Pesa parcel",
  ],
  openGraph: {
    title: "tuma. — Skip the line. Print your ticket at home.",
    description:
      "Book a parcel with any carrier, pay on M-Pesa and skip the counter queue.",
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: "#1B1F2B",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${archivoBlack.variable} ${jetbrainsMono.variable}`}
    >
      <body className="font-body bg-paper text-ink antialiased">
        {/* Keyboard and screen-reader users can jump straight past the nav. */}
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-md focus:bg-ink focus:px-4 focus:py-2.5 focus:text-sm focus:font-semibold focus:text-paper"
        >
          Skip to content
        </a>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
