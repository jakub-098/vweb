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
  title: "Váš Web",
  description:
    "Váš Web – tvorba moderných, responzívnych webov a e‑shopov do 24 hodín s jasným procesom od nápadu po hotové riešenie.",
  metadataBase: new URL("https://www.vweb.sk"),
  themeColor: "#000000",
  icons: {
    icon: "/Logo_white_s.png",
    shortcut: "/Logo_white_s.png",
    apple: "/Logo_white_s.png",
  },
  openGraph: {
    title: "Váš Web – Moderný web do 24 hodín",
    description:
      "Váš Web stavia moderné, rýchle a responzívne weby a e‑shopy do 24 hodín. Pozri si proces, ponuku a kontakt na jednej stránke.",
    url: "https://www.vweb.sk",
    locale: "sk_SK",
    type: "website",
    images: [
      {
        url: "/Logo_Black.png",
        width: 800,
        height: 800,
        alt: "Váš Web – logo",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Váš Web – Moderný web do 24 hodín",
    description:
      "Tvorba moderných, responzívnych webov a e‑shopov do 24 hodín s dôrazom na rýchlosť a prvý dojem.",
    images: ["/Logo_Black.png"],
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
