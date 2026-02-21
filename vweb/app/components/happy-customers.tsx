"use client";

import Image from "next/image";
import { projects } from "@/data/reviews";

export default function HappyCustomers() {
  const items = [0, 1, 2, 3, 4] as const;

  return (
    <div className="customers-marquee-container mb-12 mt-4 w-full max-w-6xl px-4 sm:mb-16 sm:px-6">
      <div className="relative">
       
        <div className="customers-marquee-track">
        {[...items, ...items].map((index, i) => {
          const project = projects[index];

          let href = "#";
          let logoSrc = "";
          let logoAlt = project?.name || "";

          if (index === 0) {
            href = "https://www.limetka-jtl.sk";
            logoSrc = "/logos/limetka.png";
            
          } else if (index === 1) {
            href = "https://www.chaletrobinson.sk";
            logoSrc = "/logos/chalet_robinson.png";
          } else if (index === 2) {
            href = "https://www.zct3.eu";
            logoSrc = "/logos/zct3.png";
          }
          else if (index === 3) {
            href = "https://www.easy-project.sk";
            logoSrc = "/logos/easyproject.png";
          } else if (index === 4) {
            href = "https://www.adamvirlic.com";
            logoSrc = "/logos/adamvirlic.png";
          }

          let logoClass = "mx-auto h-20 w-auto object-contain grayscale opacity-80 transition hover:opacity-100 hover:grayscale-0";

          if (index === 1) {
            // Chalet – slightly larger without affecting text layout
            logoClass = "mx-auto h-20 w-auto origin-center scale-[1.1] object-contain grayscale opacity-80 transition hover:opacity-100 hover:grayscale-0";
          }

          return (
            <div
              key={`${index}-${i}`}
              className="w-64 flex-shrink-0 text-center text-sm text-zinc-200"
            >
              <a
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="block"
              >
                <Image
                  src={logoSrc}
                  alt={logoAlt}
                  width={180}
                  height={72}
                  className={logoClass}
                />
              </a>
              <div className="mt-3 flex items-center justify-center gap-2">
                <p className="text-sm font-semibold text-zinc-50">
                  {project?.name}
                </p>
                <div
                  className="flex items-center text-[0.7rem] text-yellow-400"
                  aria-hidden="true"
                >
                  <span>★★★★★</span>
                </div>
              </div>
              <p className="mt-2 text-xs text-zinc-400">{project?.text}</p>
            </div>
          );
        })}
        </div>
      </div>
    </div>
  );
}
