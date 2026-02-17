"use client";

export default function Header() {
  return (
    <div
      id="top"
      className="flex min-h-screen w-full items-center justify-center px-4 text-zinc-50 sm:px-8"
    >
      <main className="relative w-full max-w-6xl sm:w-4/5 lg:w-2/3">
        <div
          className="pointer-events-none absolute -inset-[3px] rounded-2xl bg-gradient-to-b from-purple-500/45 via-transparent to-transparent opacity-70 blur-xl"
          aria-hidden
        />

        <section className="relative overflow-hidden rounded-2xl border border-purple-300/20 bg-black/50 px-7 py-12 shadow-[0_24px_80px_rgba(0,0,0,0.95)] backdrop-blur-3xl sm:px-11 sm:py-14">
          <div className="pointer-events-none absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-white/40 to-transparent opacity-70" />

          <div className="relative flex flex-col items-center text-center">
            <p className="mb-4 text-[0.7rem] font-semibold uppercase tracking-[0.35em] text-purple-200/80">
              Vas Web
            </p>

            <h1 className="mb-5 max-w-2xl text-balance text-4xl font-semibold leading-tight tracking-tight sm:text-5xl md:text-6xl">
              Moderný, Rýchly, Bezkonkurenčný 
              <span className="mt-1 inline-block bg-gradient-to-r from-purple-200 via-white to-purple-400 bg-clip-text text-transparent drop-shadow-[0_0_18px_rgba(168,85,247,0.65)]">
                do 24 hodín.
              </span>
            </h1>

            <p className="mb-9 max-w-xl text-pretty text-sm leading-relaxed text-zinc-200/90 sm:text-base md:text-lg">
              Moderný a responzívny web do 24h — od prvého návrhu po hotovú stránku,
              optimalizovanú pre mobil, rýchlosť a silný prvý dojem.
            </p>

            <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
              
              <a
                href="/config"
                className="group inline-flex items-center justify-center rounded-2xl bg-purple-500 px-10 py-3.5 text-sm font-semibold text-white transition duration-200 hover:bg-purple-400"
              >
                Zistiť Cenu (30s)
                <span className="text-xs opacity-80 transition-transform duration-200 group-hover:translate-x-0.5">
                  ↗
                </span>
              </a>
              <a
                href="#ako-to-funguje"
                onClick={(e) => {
                  e.preventDefault();
                  const el = document.getElementById("ako-to-funguje");
                  el?.scrollIntoView({ behavior: "smooth", block: "start" });
                }}
                className="inline-flex items-center justify-center rounded-2xl border border-purple-300/60 bg-white/5 px-10 py-3.5 text-sm font-semibold text-zinc-100 backdrop-blur-md transition duration-200 hover:bg-white/10 hover:border-purple-200/80"
              >
                <span className="mr-1">Zistiť viac</span>
                
              </a>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
