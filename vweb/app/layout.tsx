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
  title: "Vas Web",
  description:
    "Vas Web – tvorba moderných, responzívnych webov a e‑shopov do 24 hodín s jasným procesom od nápadu po hotové riešenie.",
  metadataBase: new URL("https://www.vweb.sk"),
  themeColor: "#000000",
  icons: {
    icon: "/Logo_White.png",
    shortcut: "/Logo_White.png",
    apple: "/Logo_White.png",
  },
  openGraph: {
    title: "Vas Web – Moderný web do 24 hodín",
    description:
      "Vas Web stavia moderné, rýchle a responzívne weby a e‑shopy do 24 hodín. Pozri si proces, ponuku a kontakt na jednej stránke.",
    url: "https://www.vweb.sk",
    locale: "sk_SK",
    type: "website",
    images: [
      {
        url: "/previews/header.png",
        width: 1200,
        height: 630,
        alt: "Vas Web – moderný web do 24 hodín",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Vas Web – Moderný web do 24 hodín",
    description:
      "Tvorba moderných, responzívnych webov a e‑shopov do 24 hodín s dôrazom na rýchlosť a prvý dojem.",
    images: ["/previews/header.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="sk">
      <head>
        <meta name="theme-color" content="#000000" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta
          name="apple-mobile-web-app-status-bar-style"
          content="black-translucent"
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
