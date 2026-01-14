"use client";

import { useEffect, useState } from "react";

const links = [
  { href: "#top", label: "Úvod" },
  { href: "#ako-to-funguje", label: "Ako to funguje" },
  { href: "#eshops", label: "E-shopy" },
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
        <div className="font-semibold tracking-tight">
          <span className="text-xs uppercase tracking-[0.3em] text-purple-200">
            Vas Web
          </span>
        </div>
        <div className="hidden gap-7 text-xs font-semibold text-zinc-200 sm:flex">
          {links.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="transition-colors hover:text-white"
            >
              {link.label}
            </a>
          ))}
        </div>
      </nav>
    </header>
  );
}
