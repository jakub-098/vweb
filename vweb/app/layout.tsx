import type { Metadata } from "next";
import Script from "next/script";
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

const FB_PIXEL_ID = process.env.NEXT_PUBLIC_FB_PIXEL_ID;

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
        <Script
          async
          src="https://www.googletagmanager.com/gtag/js?id=G-NX5P0ZDE14"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-NX5P0ZDE14');
            gtag('config', 'AW-17955579995');
          `}
        </Script>
        
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebSite",
              url: "https://www.vweb.sk/",
              name: "Váš Web",
              alternateName: "Vweb",
              potentialAction: {
                "@type": "SearchAction",
                target: "https://www.vweb.sk/?s={search_term_string}",
                "query-input": "required name=search_term_string",
              },
            }),
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "ItemList",
              itemListElement: [
                {
                  "@type": "SiteNavigationElement",
                  position: 1,
                  name: "Spustiť Konfigurátor",
                  url: "https://www.vweb.sk/config",
                },
                
                
              ],
            }),
          }}
        />
        {FB_PIXEL_ID && (
          <>
            <script
              dangerouslySetInnerHTML={{
                __html: `
                  !function(f,b,e,v,n,t,s)
                  {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
                  n.callMethod.apply(n,arguments):n.queue.push(arguments)};
                  if(!f._fbq)n=f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
                  n.queue=[];t=b.createElement(e);t.async=!0;
                  t.src='https://connect.facebook.net/en_US/fbevents.js';
                  s=b.getElementsByTagName(e)[0];
                  s.parentNode.insertBefore(t,s)}(window, document,'script');
                  fbq('init', '${FB_PIXEL_ID}');
                  fbq('track', 'PageView');
                `.replace(/\s+/g, " "),
              }}
            />
            <noscript>
              <img
                alt="fb pixel"
                height="1"
                width="1"
                style={{ display: "none" }}
                src={`https://www.facebook.com/tr?id=${FB_PIXEL_ID}&ev=PageView&noscript=1`}
              />
            </noscript>
          </>
        )}
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
