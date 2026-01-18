"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

const links = [
  { href: "#top", label: "Úvod" },
  { href: "#ako-to-funguje", label: "Ako to funguje" },
  { href: "#web-na-mieru", label: "Web na mieru" },
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
        scrolled ? "h-14 bg-black/60 backdrop-blur-2xl" : "h-20 bg-transparent backdrop-blur-0"
      }`}
    >
      <nav className="flex h-full w-full max-w-6xl items-center justify-between px-4 text-sm text-zinc-50 sm:px-8">
        <div className="flex items-center">
          <Image
            src="/Logo_White.png"
            alt="Vas Web logo"
            width={75}
            height={16}
            priority
          />
        </div>
        <div className="hidden gap-7 text-xs font-semibold text-zinc-200 sm:flex">
          {links.map((link) => (
            <button
              key={link.href}
              type="button"
              onClick={() => {
                const id = link.href.startsWith("#") ? link.href.slice(1) : link.href;
                const el = document.getElementById(id);
                el?.scrollIntoView({ behavior: "smooth", block: "start" });
              }}
              className="transition-colors hover:text-white"
            >
              {link.label}
            </button>
          ))}
        </div>
      </nav>
    </header>
  );
}
