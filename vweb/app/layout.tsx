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
  openGraph: {
    title: "Vas Web – Moderný web do 24 hodín",
    description:
      "Vas Web stavia moderné, rýchle a responzívne weby a e‑shopy do 24 hodín. Pozri si proces, ponuku a kontakt na jednej stránke.",
    url: "https://vasweb.sk",
    locale: "sk_SK",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Vas Web – Moderný web do 24 hodín",
    description:
      "Tvorba moderných, responzívnych webov a e‑shopov do 24 hodín s dôrazom na rýchlosť a prvý dojem.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
