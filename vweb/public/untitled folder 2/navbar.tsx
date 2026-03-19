"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

const links = [
  { href: "#top", label: "Úvod" },
  { href: "#ponuka", label: "Ponuka" },
  { href: "#faq", label: "FAQ" },
  { href: "#kontakt", label: "Kontakt" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 10);
    };

    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-40 flex justify-center transition-all duration-300 ${
        scrolled ? "h-16 bg-white shadow-lg shadow-purple-500/5 backdrop-blur-3xl" : "h-20 bg-white/80 backdrop-blur-sm"
      }`}
    >
      <nav className="flex h-full w-full max-w-6xl items-center justify-between px-4 text-sm text-zinc-50 sm:w-4/5 sm:px-0 lg:w-2/3">
        <div className="flex items-center">
          <Image
            src="/Logo_White.png"
            alt="Vas Web logo"
            width={scrolled ? 60 : 75}
            height={scrolled ? 12 : 16}
            priority
            className="transition-all duration-300"
          />
        </div>

        <div className="hidden gap-8 text-xs font-semibold text-zinc-600 sm:flex">
          {links.map((link) => (
            <button
              key={link.href}
              type="button"
              onClick={() => {
                const id = link.href.startsWith("#") ? link.href.slice(1) : link.href;
                const el = document.getElementById(id);
                el?.scrollIntoView({ behavior: "smooth", block: "start" });
              }}
              className="transition-colors duration-300 hover:text-purple-600"
            >
              {link.label}
            </button>
          ))}
        </div>

        <button
          type="button"
          onClick={() => {
            const el = document.getElementById("ponuka");
            el?.scrollIntoView({ behavior: "smooth", block: "start" });
          }}
          className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-purple-600 to-purple-500 px-4 py-2 text-xs font-semibold text-white shadow-lg shadow-purple-500/30 transition-all duration-300 hover:from-purple-500 hover:to-purple-400 hover:shadow-purple-500/50 active:scale-95"
        >
          <span>Vybrať</span>
          <span>→</span>
        </button>
      </nav>
    </header>
  );
}
