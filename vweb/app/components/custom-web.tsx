"use client";

export default function CustomWeb() {
  return (
    <section
      id="web-na-mieru"
      className="w-full max-w-6xl px-4 pb-28 sm:w-4/5 lg:w-2/3 sm:px-0"
    >
       <div className="mx-auto max-w-4xl px-6 text-center">

    {/* Small label */}
    <p className="text-sm uppercase tracking-[0.3em] text-purple-400/80">
      Potrebujete poradiť?
    </p>

    {/* Headline */}
    <h2 className="mt-6 text-4xl font-semibold text-white sm:text-5xl">
      Pomôžeme vám vybrať správne riešenie
    </h2>

    {/* Short text */}
    <p className="mt-6 text-lg text-zinc-400">
      Ozvite sa nám. Konzultácia je nezáväzná a radi vám odporučíme
      najvhodnejší balík pre váš projekt.
    </p>

    {/* Contact info */}
    <div className="mt-14 space-y-6">

      {/* Email */}
      <div className="flex items-center justify-center gap-4 text-2xl font-semibold text-white">
        <div className="h-10 w-10 rounded-full bg-white/5 flex items-center justify-center backdrop-blur-md">
          ✉️
        </div>
        <span>info@vweb.sk</span>
      </div>

      {/* Phone */}
      <div className="flex items-center justify-center gap-4 text-2xl font-semibold text-white">
        <div className="h-10 w-10 rounded-full bg-white/5 flex items-center justify-center backdrop-blur-md">
          📞
        </div>
        <span>+421 900 123 456</span>
      </div>

    </div>

    {/* CTA */}
    <div className="mt-14">
      <button className="rounded-2xl bg-purple-600 px-10 py-4 text-sm font-semibold uppercase tracking-[0.2em] text-white transition duration-300 hover:bg-purple-500 hover:shadow-[0_0_30px_rgba(168,85,247,0.6)]">
        Napísať správu
      </button>
    </div>

  </div>
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
            Chcete Eshop? Ste Reštaurácia? Potrebujete Blog alebo Portfólio?
            Vytvoríme vám web na mieru, ktorý bude presne spĺňať vaše požiadavky
            a očakávania.
          </p>

          <div className="mt-8 flex flex-col items-start gap-3">
            <button
              type="button"
              onClick={() => {
                const el = document.getElementById("kontakt");
                el?.scrollIntoView({ behavior: "smooth", block: "start" });
              }}
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-purple-500 px-10 py-3.5 text-sm font-semibold text-white transition duration-200 hover:scale-[1.02] hover:bg-purple-400"
            >
              Kontaktuj nás
            </button>
            <p className="max-w-xs text-xs text-zinc-400/90 sm:text-sm">
              Krátka správa stačí – ozveme sa späť s návrhom riešenia.
            </p>
          </div>
        </div> 
      </div>
    </section>
  );
}
