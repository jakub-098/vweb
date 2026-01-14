export default function HowItWorks() {
  return (
    <section
      id="ako-to-funguje"
      className="relative w-full max-w-6xl -mt-24 pt-0 pb-24 sm:w-4/5 lg:w-2/3 sm:-mt-32 sm:pb-32"
    >
      <div className="relative mx-auto w-full">
        <div className="mb-12 text-center">
          <p className="text-[0.7rem] font-semibold uppercase tracking-[0.3em] text-purple-200/70">
            Proces
          </p>
          <h2 className="mt-3 text-3xl font-semibold text-zinc-50 sm:text-4xl">
            Ako to funguje?
          </h2>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <div className="group relative overflow-hidden rounded-2xl border border-purple-300/25 bg-black/55 px-7 py-9 text-left shadow-[0_24px_80px_rgba(0,0,0,0.95)] backdrop-blur-3xl transition duration-200 hover:-translate-y-1.5 hover:border-purple-200/60 hover:bg-black/70">
            <div className="pointer-events-none absolute inset-x-5 top-0 h-px bg-gradient-to-r from-transparent via-white/45 to-transparent opacity-80" />
            <span className="text-[0.7rem] font-medium uppercase tracking-[0.3em] text-purple-200/90">
              Krok 1
            </span>
            <h3 className="mt-4 text-base font-semibold text-zinc-50 sm:text-lg">
              Nápad
            </h3>
            <p className="mt-4 text-xs leading-relaxed text-zinc-300/90 sm:text-sm">
              Sem pôjde krátky popis, ako spoločne zladíme tvoju predstavu o webe
              do jasného, konkrétneho zadania.
            </p>
          </div>

          <div className="group relative overflow-hidden rounded-2xl border border-purple-300/25 bg-black/55 px-7 py-9 text-left shadow-[0_24px_80px_rgba(0,0,0,0.95)] backdrop-blur-3xl transition duration-200 hover:-translate-y-1.5 hover:border-purple-200/60 hover:bg-black/70">
            <div className="pointer-events-none absolute inset-x-5 top-0 h-px bg-gradient-to-r from-transparent via-white/45 to-transparent opacity-80" />
            <span className="text-[0.7rem] font-medium uppercase tracking-[0.3em] text-purple-200/90">
              Krok 2
            </span>
            <h3 className="mt-4 text-base font-semibold text-zinc-50 sm:text-lg">
              Konfigurátor
            </h3>
            <p className="mt-4 text-xs leading-relaxed text-zinc-300/90 sm:text-sm">
              Tu vysvetlíš, ako si klient jednoducho nakliká, čo chce na stránke
              mať, bez zbytočného e‑mailovania.
            </p>
          </div>

          <div className="group relative overflow-hidden rounded-2xl border border-purple-300/25 bg-black/55 px-7 py-9 text-left shadow-[0_24px_80px_rgba(0,0,0,0.95)] backdrop-blur-3xl transition duration-200 hover:-translate-y-1.5 hover:border-purple-200/60 hover:bg-black/70">
            <div className="pointer-events-none absolute inset-x-5 top-0 h-px bg-gradient-to-r from-transparent via-white/45 to-transparent opacity-80" />
            <span className="text-[0.7rem] font-medium uppercase tracking-[0.3em] text-purple-200/90">
              Krok 3
            </span>
            <h3 className="mt-4 text-base font-semibold text-zinc-50 sm:text-lg">
              24h
            </h3>
            <p className="mt-4 text-xs leading-relaxed text-zinc-300/90 sm:text-sm">
              Miesto, kde doplníš, čo všetko vieš pripraviť do 24 hodín a ako
              vyzerá priebeh práce v tomto čase.
            </p>
          </div>

          <div className="group relative overflow-hidden rounded-2xl border border-purple-300/25 bg-black/55 px-7 py-9 text-left shadow-[0_24px_80px_rgba(0,0,0,0.95)] backdrop-blur-3xl transition duration-200 hover:-translate-y-1.5 hover:border-purple-200/60 hover:bg-black/70">
            <div className="pointer-events-none absolute inset-x-5 top-0 h-px bg-gradient-to-r from-transparent via-white/45 to-transparent opacity-80" />
            <span className="text-[0.7rem] font-medium uppercase tracking-[0.3em] text-purple-200/90">
              Krok 5
            </span>
            <h3 className="mt-4 text-base font-semibold text-zinc-50 sm:text-lg">
              Hotovo
            </h3>
            <p className="mt-4 text-xs leading-relaxed text-zinc-300/90 sm:text-sm">
              Stručný text o odovzdaní hotového webu, podpore po spustení a
              prípadných ďalších krokoch, ktoré môžeš klientovi ponúknuť.
            </p>
          </div>
        </div>

        <div className="mt-12 flex justify-center">
          <button className="inline-flex items-center justify-center gap-2 rounded-2xl bg-purple-500 px-12 py-3.5 text-base font-semibold text-white transition duration-200 hover:scale-[1.02] hover:bg-purple-400">
            <span>Nakonfigurovať</span>
            <span className="text-xs opacity-90">↗</span>
          </button>
        </div>
      </div>
    </section>
  );
}
