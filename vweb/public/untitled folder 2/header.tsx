"use client";

export default function Header() {
  return (
    <section
      id="top"
      className="relative w-full overflow-hidden pt-24 pb-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-white via-purple-50/30 to-white"
    >
      {/* Subtle background elements */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-purple-100/40 rounded-full blur-3xl opacity-30" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-purple-100/30 rounded-full blur-3xl opacity-20" />
      </div>

      <div className="mx-auto max-w-5xl">
        <div className="flex flex-col items-center text-center">
          {/* Badge */}
          <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-purple-600/10 px-4 py-2 border border-purple-200/50">
            <span className="h-2 w-2 rounded-full bg-purple-600 animate-pulse"></span>
            <span className="text-xs font-semibold text-purple-700 uppercase tracking-widest">Dostupné Teraz</span>
          </div>

          {/* Main Headline - Bold & Clear */}
          <h1 className="mb-6 max-w-4xl text-5xl sm:text-6xl lg:text-7xl font-black leading-tight tracking-tight text-zinc-900">
            Webový Dizajn, Ktorý
            <br />
            <span className="bg-gradient-to-r from-purple-600 to-purple-700 bg-clip-text text-transparent">
              Naozaj Predáva
            </span>
          </h1>

          {/* Subheadline */}
          <p className="mb-10 max-w-2xl text-lg sm:text-xl text-zinc-600 leading-relaxed">
            Hotový web za 24 hodín + overená email stratégia. Buď konkurenčný od prvého dňa. Bez čakania, bez komplikácií.
          </p>

          {/* Trust Row - Stats */}
          <div className="mb-12 flex flex-wrap justify-center gap-6 sm:gap-10">
            <div className="flex flex-col items-center">
              <p className="text-3xl sm:text-4xl font-black text-purple-700">50+</p>
              <p className="text-xs sm:text-sm text-zinc-600 font-medium mt-1">Spokojných Firiem</p>
            </div>
            <div className="h-12 w-px bg-purple-200" />
            <div className="flex flex-col items-center">
              <p className="text-3xl sm:text-4xl font-black text-purple-700">24h</p>
              <p className="text-xs sm:text-sm text-zinc-600 font-medium mt-1">Rýchla Dodávka</p>
            </div>
            <div className="h-12 w-px bg-purple-200" />
            <div className="flex flex-col items-center">
              <p className="text-3xl sm:text-4xl font-black text-purple-700">250%</p>
              <p className="text-xs sm:text-sm text-zinc-600 font-medium mt-1">Priemerný Rast</p>
            </div>
          </div>

          {/* CTAs - Primary & Secondary */}
          <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto sm:justify-center mb-8">
            {/* Primary CTA */}
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                const el = document.getElementById("ponuka");
                el?.scrollIntoView({ behavior: "smooth", block: "start" });
              }}
              className="group inline-flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-purple-600 to-purple-700 px-8 sm:px-10 py-4 text-base sm:text-lg font-bold text-white shadow-lg shadow-purple-600/30 transition duration-300 hover:shadow-purple-600/50 hover:from-purple-500 hover:to-purple-600 active:scale-95"
            >
              <span>Vybrať Balík Teraz</span>
              <span className="text-lg transition-transform duration-300 group-hover:translate-x-1">→</span>
            </button>

            {/* Secondary CTA */}
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                const el = document.getElementById("stretnutie");
                el?.scrollIntoView({ behavior: "smooth", block: "start" });
              }}
              className="group inline-flex items-center justify-center gap-2 rounded-lg border-2 border-purple-600 px-8 sm:px-10 py-4 text-base sm:text-lg font-bold text-purple-700 transition duration-300 hover:bg-purple-50 active:scale-95"
            >
              <span>📞 Bezplatný Pohovor</span>
              <span className="text-lg transition-transform duration-300 group-hover:translate-x-1">→</span>
            </button>
          </div>

          {/* Trust Badges */}
          <div className="flex flex-wrap justify-center gap-3 text-xs sm:text-sm text-zinc-600">
            <div className="flex items-center gap-2 rounded-full bg-white px-4 py-2 shadow-sm border border-purple-100">
              <span className="text-purple-600">✓</span>
              <span className="font-medium">Bez Skrytých Poplatkov</span>
            </div>
            <div className="flex items-center gap-2 rounded-full bg-white px-4 py-2 shadow-sm border border-purple-100">
              <span className="text-purple-600">✓</span>
              <span className="font-medium">30 Dní Záruka</span>
            </div>
            <div className="flex items-center gap-2 rounded-full bg-white px-4 py-2 shadow-sm border border-purple-100">
              <span className="text-purple-600">✓</span>
              <span className="font-medium">24/7 Podpora</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
