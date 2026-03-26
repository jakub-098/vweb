"use client";

import Image from "next/image";
import { projects } from "@/data/reviews";

export default function SocialProof() {
  const items = [0, 1, 2, 3, 4, 5, 6] as const;

  return (
    <section className="w-full -mt-28 mb-20 pt-1 pb-4 sm:-mt-32 sm:mb-30 sm:pt-2 sm:pb-6">
      <div className="mx-auto w-full max-w-6xl px-4 sm:w-4/5 sm:px-6 lg:w-2/3">
        <p className="mb-8 text-center text-xs font-bold uppercase tracking-[0.4em] text-purple-300">
          Naši klienti 
        </p>

        <div className="customers-marquee-container w-full">
          <div className="customers-marquee-track">
            {[...items, ...items].map((index, i) => {
              const project = projects[index];

              let href = "#";
              let logoSrc = "";
              const logoAlt = project?.name || "";

              if (index === 0) {
                href = "";
                logoSrc = "/logos/limetka.png";
              } else if (index === 1) {
                href = "https://www.chaletrobinson.sk";
                logoSrc = "/logos/chalet_robinson.png";
              } else if (index === 2) {
                href = "https://www.zct3.eu";
                logoSrc = "/logos/zct3.png";
              } else if (index === 3) {
                href = "https://www.krauslegal.sk";
                logoSrc = "/logos/kl.png";
              } else if (index === 4) {
                href = "https://www.bizreach.sk";
                logoSrc = "/logos/bizreach.png";  
              } else if (index === 5) {
                href = "https://www.easy-project.sk";
                logoSrc = "/logos/easyproject.png";
              } else if (index === 6) {
                href = "https://www.adamvirlic.com";
                logoSrc = "/logos/adamvirlic.png";
              }

              let logoClass =
                "mx-auto h-16 w-auto object-contain grayscale opacity-60 transition duration-300 hover:opacity-100 hover:grayscale-0";

              if (index === 1) {
                logoClass =
                  "mx-auto h-16 w-auto origin-center scale-[1.1] object-contain grayscale opacity-60 transition duration-300 hover:opacity-100 hover:grayscale-0";
              }

              return (
                <div
                  key={`${index}-${i}`}
                  className="w-56 flex-shrink-0 text-center transition-all duration-300 hover:scale-110"
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
                      width={192}
                      height={72}
                      className={logoClass}
                    />
                  </a>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
