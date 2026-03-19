"use client";

import Image from "next/image";
import { useEffect } from "react";
import Header from "./components/header";
import HowItWorks from "./components/how-it-works";
import Contact from "./components/contact";
import Navbar from "./components/navbar";
import Baliky from "./components/baliky";
import BalikyDetail from "./components/baliky-detail";
import Faq from "./components/faq";
import PersonalTouch from "./components/personal-touch";
import SocialProof from "./components/social-proof";
import ValueProps from "./components/value-props";
import ClientReviews from "./components/client-reviews";
// import HappyCustomers from "./components/happy-customers";

export default function Home() {
  useEffect(() => {
    if (typeof window === "undefined") return;

    if (window.location.hash) {
      window.history.replaceState(
        null,
        "",
        window.location.pathname + window.location.search,
      );
    }

    window.scrollTo({ top: 0, left: 0, behavior: "auto" });

    // track main page visit in analytics (id: 4 -> 'main' column)
    (async () => {
      try {
        await fetch("/api/analytics/increment", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: 4 }),
        });
      } catch (err) {
        console.error("Failed to track main page visit", err);
      }
    })();
  }, []);

  return (
    <div className="flex min-h-screen flex-col items-center bg-[radial-gradient(circle_at_top,_#4c1d95_0,_#02010a_25%,_#02010a_55%,_transparent_70%),radial-gradient(circle_at_bottom,_#4c1d95_0,_#02010a_35%,_#000_80%)] text-zinc-50">
      <Navbar />
      <Header />
      <SocialProof />
      <HowItWorks />
      <ValueProps />
      <BalikyDetail />
      <Baliky />
      
      {/* <Eshops /> */}
      {/* <CustomWeb /> */}

      <Faq />
      <PersonalTouch />
      <ClientReviews />
      {/* <HappyCustomers /> */}
      <Contact />

      <footer className="w-full border-t border-purple-500/30 bg-black/70 px-4 py-10 text-xs text-zinc-400 sm:px-10 sm:py-12 sm:text-sm">
        <div className="mx-auto w-full max-w-6xl sm:w-4/5 lg:w-2/3">
          <div className="grid gap-10 text-center sm:grid-cols-3 sm:items-start sm:text-left">
            <div>
              <div className="flex justify-center sm:justify-start">
                <Image src="/Logo_White.png" alt="Váš Web logo" width={75} height={16} />
              </div>
              <nav className="mt-4 flex flex-wrap justify-center gap-x-5 gap-y-2 text-xs text-zinc-400 sm:justify-start sm:text-sm">
                {[
                  { href: "#top", label: "Úvod" },
                  { href: "#ponuka", label: "Ponuka" },
                  { href: "#faq", label: "FAQ" },
                  { href: "#kontakt", label: "Kontakt" },
                ].map((link) => (
                  <button
                    key={link.href}
                    type="button"
                    onClick={() => {
                      const id = link.href.slice(1);
                      const el = document.getElementById(id);
                      el?.scrollIntoView({ behavior: "smooth", block: "start" });
                    }}
                    className="transition hover:text-zinc-100"
                  >
                    {link.label}
                  </button>
                ))}
              </nav>
            </div>

            {/* Middle column: contact */}
            <div className="flex flex-col items-center gap-1.5 text-center text-xs text-zinc-400 sm:text-sm">
              <p className="text-base font-semibold text-zinc-50 sm:text-lg">Kontakty</p>
              
              <a
                href="mailto:info@vweb.sk"
                className="text-xs transition hover:text-zinc-100 sm:text-sm"
              >
                info@vweb.sk
              </a>
              <a
                href="tel:+421917641379"
                className="text-xs transition hover:text-zinc-100 sm:text-sm"
              >
                0917 641 379
              </a>
            </div>

            {/* Right column: company details (placeholders) */}
            <div className="flex flex-col items-center gap-1.5 text-center text-xs text-zinc-400 sm:items-end sm:text-right sm:text-sm">
              <p className="text-base font-semibold text-zinc-50 sm:text-lg">Fakturačné údaje</p>
              
              <p className="text-xs sm:text-sm">Smart Dom s.r.o.</p>
         
              <p className="text-xs sm:text-sm">IČO: 57368953</p>
              <p className="text-xs sm:text-sm">DIČ: 2122685587</p> 
              <p className="text-xs sm:text-sm">IČ DPH: SK2122685587</p> 
              
            </div>
          </div>
        </div>

        <div className="mx-auto mt-6 w-full max-w-6xl border-t border-purple-500/20 pt-4 text-center text-[0.7rem] text-zinc-100 sm:w-4/5 lg:w-2/3">
          <p>
            © 2026 vweb.sk – Všetky práva vyhradené. 
          </p>
        </div>
      </footer>
    </div>
  );
}
