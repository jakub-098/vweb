export default function CustomWeb() {
  return (
    <section className="w-full max-w-6xl px-4 pb-28 sm:w-4/5 lg:w-2/3 sm:px-0">
      <div className="relative overflow-hidden rounded-2xl border border-purple-300/20 bg-black/60 shadow-[0_24px_80px_rgba(0,0,0,0.95)] backdrop-blur-3xl">
        <div
          className="absolute inset-0 bg-[url('/vawes2.png')] bg-cover bg-center opacity-40 mix-blend-screen"
          aria-hidden
        />

        <div className="relative px-8 py-10 sm:px-12 sm:py-14">
          <p className="text-[0.7rem] font-semibold uppercase tracking-[0.3em] text-purple-200/80">
            Web na mieru
          </p>
          <h2 className="mt-3 max-w-xl text-2xl font-semibold text-zinc-50 sm:text-3xl">
            Web presne podľa toho, čo tvoj projekt potrebuje.
          </h2>
          <p className="mt-4 max-w-2xl text-sm leading-relaxed text-zinc-200/90 sm:text-base">
            Sem doplníš, ako pripravíš individuálne riešenia – od landing page po
            komplexnejší web, ktorý zapadne do tvojho brandu aj technických
            požiadaviek.
          </p>

          <div className="mt-8 flex flex-col items-start gap-3">
            <button className="inline-flex items-center justify-center gap-2 rounded-2xl bg-purple-500 px-10 py-3.5 text-sm font-semibold text-white transition duration-200 hover:scale-[1.02] hover:bg-purple-400">
              Kontaktuj ma
            </button>
            <p className="max-w-xs text-xs text-zinc-400/90 sm:text-sm">
              Krátka správa stačí – ozvem sa späť s návrhom riešenia.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
