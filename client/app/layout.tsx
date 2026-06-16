import type { Metadata } from "next";
import { Roboto, Tiro_Bangla, Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import ToastClient from "./_components/ToastContext";

// Default font (English / UI)
const roboto = Roboto({
  variable: "--font-roboto",
  subsets: ["latin"],
  weight: ["300", "400", "500", "700"],
});

// Bangla font
const tiroBangla = Tiro_Bangla({
  variable: "--font-tiro-bangla",
  subsets: ["bengali"],
  weight: "400",
});

// Optional (if you still want Geist)
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Niamah Shop",
  description: "Niamah Shop",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${roboto.variable} ${tiroBangla.variable} ${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-roboto">
        <ToastClient />
        {children}
      </body>
    </html>
  );
}
