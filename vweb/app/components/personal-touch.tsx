"use client";

import Image from "next/image";

export default function PersonalTouch() {
  return (
    <section className="w-full max-w-5xl px-6 pt-10 pb-30">
      <div className="mx-auto flex flex-col items-center gap-10 text-center md:flex-row md:items-center md:justify-center md:text-left">
        <div className="flex justify-center md:justify-start">
          <div className="relative h-40 w-40 overflow-hidden rounded-full bg-black/40 shadow-[0_24px_80px_rgba(0,0,0,0.85)] sm:h-45 sm:w-45">
            <Image
              src="/profile.jpg"
              alt="Profil developera"
              fill
              className="object-cover"
            />
          </div>
        </div>

        <div className="max-w-xl md:max-w-lg">
          <h3 className="text-xl font-semibold text-zinc-50 sm:text-2xl md:text-3xl">
            Jakub Virlic
          </h3>
          <p className="mt-1 text-xs font-medium uppercase tracking-[0.18em] text-purple-300/90 sm:text-sm">
            Vedúci web developmentu
          </p>
          <p className="mt-3 text-xs leading-relaxed text-zinc-400 sm:text-sm">
            Každý web beriem osobne – ako vizitku vašej značky aj svojej práce.
            Postarám sa o to, aby bol váš web hotový nielen rýchlo ale hlavne kvalitne
          </p>
        </div>
      </div>
    </section>
  );
}
