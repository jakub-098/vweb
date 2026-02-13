"use client";

import Image from "next/image";
import { useEffect } from "react";
import Header from "./components/header";
import HowItWorks from "./components/how-it-works";
import Eshops from "./components/eshops";
import CustomWeb from "./components/custom-web";
import Contact from "./components/contact";
import Navbar from "./components/navbar";
//import HappyCustomers from "./components/happy-customers";

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
  }, []);

  return (
    <div className="flex min-h-screen flex-col items-center bg-[radial-gradient(circle_at_top,_#4c1d95_0,_#02010a_25%,_#02010a_55%,_transparent_70%),radial-gradient(circle_at_bottom,_#4c1d95_0,_#02010a_35%,_#000_80%)] text-zinc-50">
      <Navbar />
      <Header />
      <HowItWorks />
      {/* <Eshops /> */}
      <CustomWeb />
      <Contact />
      
      <footer className="w-full border-t border-purple-500/30 bg-black/70 px-4 py-8 text-xs text-zinc-400 sm:px-8 sm:text-sm">
        <div className="mx-auto flex w-full max-w-6xl flex-col items-center justify-between gap-4 sm:w-4/5 sm:flex-row lg:w-2/3">
          <div className="text-center sm:text-left">
            <div className="flex justify-center sm:justify-start">
              <Image
                src="/Logo_White.png"
                alt="Vas Web logo"
					width={75}
					height={16}
              />
            </div>
            <nav className="mt-2 flex justify-center gap-4 text-xs text-zinc-400 sm:justify-start sm:text-sm">
              {[
                { href: "#top", label: "Úvod" },
                { href: "#ako-to-funguje", label: "Proces" },
                { href: "#web-na-mieru", label: "Web na mieru" },
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
          <div className="flex flex-col items-center gap-1 text-center text-xs text-zinc-400 sm:items-end sm:text-right sm:text-sm">
            <p className="text-sm font-semibold text-zinc-50 sm:text-base">
              Jakub Virlic
            </p>
            <p className="text-[0.7rem] text-zinc-400/80 sm:text-xs">
              vedúci webdevelopmentu
            </p>
            <a href="mailto:info@vvweb.sk" className="transition hover:text-zinc-100">
              info@vvweb.sk
            </a>
            <a href="tel:+421917641379" className="transition hover:text-zinc-100">
              0917 641 379
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
