"use client";

import Image from "next/image";
import { projects } from "@/data/reviews";

const FEATURED_NAMES = ["Chalet Robinson", "Kraus Legal", "Easy Project"] as const;

function getMeta(text: string) {
  const parts = text.split("- balík");
  if (parts.length > 1) {
    return {
      body: parts[0].trim(),
      meta: parts[1].trim(),
    };
  }
  return { body: text, meta: "" };
}

function getLogo(name: string) {
  if (name === "Chalet Robinson") {
    return {
      href: "https://www.chaletrobinson.sk",
      src: "/logos/chalet_robinson.png",
      alt: "Chalet Robinson logo",
    };
  }
  if (name === "Kraus Legal") {
    return {
      href: "https://www.krauslegal.sk",
      src: "/logos/kl.png",
      alt: "Kraus Legal logo",
    };
  }
  if (name === "Easy Project") {
    return {
      href: "https://www.easy-project.sk",
      src: "/logos/easyproject.png",
      alt: "Easy Project logo",
    };
  }
  return null;
}

export default function ClientReviews() {
  const items = FEATURED_NAMES.map((name) => projects.find((p) => p.name === name)).filter(
    (p): p is (typeof projects)[number] => Boolean(p),
  );

  return (
    <section className="w-full py-16 mb-10  sm:py-20">
      <div className="mx-auto w-full max-w-6xl px-4 sm:w-4/5 sm:px-6 lg:w-2/3">
        <div className="mb-10 text-center sm:mb-12">
          <p className="mb-3 text-[0.7rem] font-semibold uppercase tracking-[0.35em] text-purple-300">
            Čo hovoria naši klienti
          </p>
          <h2 className="text-2xl font-semibold text-white sm:text-3xl">
            Skúsenosti firiem, s ktorými spolupracujeme
          </h2>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {items.map((project) => {
            const meta = getMeta(project.text);
            const logo = getLogo(project.name);

            if (!logo) {
              return (
                <article
                  key={project.name}
                  className="flex h-full flex-col rounded-3xl bg-white/5 p-6 text-left shadow-[0_10px_40px_rgba(0,0,0,0.4)] backdrop-blur-xl"
                >
                  <div className="mb-3 flex flex-col gap-1">
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-semibold text-zinc-50 sm:text-base">
                        {project.name}
                      </h3>
                      <span
                        className="text-[0.7rem] text-yellow-400"
                        aria-hidden="true"
                      >
                        ★★★★★
                      </span>
                    </div>
                    {project.about && (
                      <p className="text-xs font-medium text-zinc-400">
                        {project.about}
                      </p>
                    )}
                  </div>

                  <p className="flex-1 text-sm leading-relaxed text-zinc-300">
                    <span className="italic">“{meta.body}”</span>
                    {meta.meta && (
                      <span className="ml-1 text-zinc-400">
                        - balík {meta.meta}
                      </span>
                    )}
                  </p>
                </article>
              );
            }

            return (
              <a
                key={project.name}
                href={logo.href}
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-full flex-col rounded-3xl bg-white/5 p-6 text-left shadow-[0_10px_40px_rgba(0,0,0,0.4)] backdrop-blur-xl transition duration-300 hover:bg-white/10"
              >
                <div  className="mb-4 inline-flex items-center justify-start">
                  <Image
                    src={logo.src}
                    alt={logo.alt}
                    width={140}
                    height={56}
                    className="h-12 w-auto object-contain opacity-90 transition hover:opacity-100"
                  />
                </div>

                <div className="mb-3 flex flex-col gap-1">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-semibold text-zinc-50 sm:text-base">
                      {project.name}
                    </h3>
                    <span
                      className="text-[0.7rem] text-yellow-400"
                      aria-hidden="true"
                    >
                      ★★★★★
                    </span>
                  </div>
                  {project.about && (
                    <p className="text-xs font-medium text-zinc-400">
                      {project.about}
                    </p>
                  )}
                </div>

                <p id="kontakt" className="flex-1 text-sm leading-relaxed text-zinc-300">
                  <span className="italic">“{meta.body}”</span>
                  {meta.meta && (
                    <span className="ml-1 text-zinc-400">
                      - balík {meta.meta}
                    </span>
                  )}
                </p>
              </a>
            );
          })}
        </div>
      </div>
    </section>
  );
}
