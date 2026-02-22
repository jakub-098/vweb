"use client";

export default function BalikyDetail() {
  return (
    <section className="relative w-full pb-24">
  <div className="mx-auto max-w-6xl px-6">

    {/* ===================== */}
    {/* Business / Express */}
    {/* ===================== */}

    <div className="text-center">
      <h2 className="text-4xl font-semibold text-white sm:text-5xl">
        Business / Express
      </h2>

      {/* <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-zinc-400">
        Vy si vyberiete balík, nahráte obsah a o všetko ostatné sa postaráme my.
        Bez technických komplikácií. Bez zbytočného čakania.
      </p> */}
    </div>
    <div className="relative mt-10">
    {/* Horizontal line (posunutá nižšie) */}
    <div className="absolute top-16 left-0 right-0 hidden h-px bg-gradient-to-r from-purple-500/20 via-purple-400/60 to-purple-500/20 sm:block" />

    <div className="flex flex-col items-center gap-16 sm:flex-row sm:items-start sm:justify-between sm:gap-8">
      
      {/* Step 1 */}
      <div className="relative flex flex-col items-center text-center sm:w-1/3">
        <div className="z-10 flex h-12 w-12 items-center justify-center rounded-full bg-purple-500/15 text-lg font-semibold text-purple-200">
          1
        </div>
        <h3 className="mt-8 text-lg font-semibold text-zinc-50">
          Výber balíka a domény
        </h3>
        <p className="mt-3 text-base leading-relaxed text-zinc-400">
          Vyberiete si balík a skontrolujete dostupnosť vašej domény.
        </p>
      </div>

      {/* Step 2 */}
      <div className="relative flex flex-col items-center text-center sm:w-1/3">
        <div className="z-10 flex h-12 w-12 items-center justify-center rounded-full bg-purple-500/15 text-lg font-semibold text-purple-200">
          2
        </div>
        <h3 className="mt-8 text-lg font-semibold text-zinc-50">
          Vyplnenie formulára
        </h3>
        <p className="mt-3 text-base leading-relaxed text-zinc-400">
          Po objednávke vyplníte jednoduchý formulár a nahráte podklady k webu.
        </p>
      </div>

      {/* Step 3 */}
      <div className="relative flex flex-col items-center text-center sm:w-1/3">
        <div className="z-10 flex h-12 w-12 items-center justify-center rounded-full bg-purple-500/15 text-lg font-semibold text-purple-200">
          3
        </div>
        <h3 className="mt-8 text-lg font-semibold text-zinc-50">
          Realizácia & spustenie
        </h3>
        <p className="mt-3 text-base leading-relaxed text-zinc-400">
          Po dodaní podkladov začíname pracovať. Vy už len čakáte na spustenie.
        </p>
      </div>

    </div>
  </div>
    <div className="mt-20 grid gap-8 sm:grid-cols-2">

      {/* Box 1 */}
      <div className="rounded-3xl bg-white/5 p-8 backdrop-blur-xl shadow-[0_10px_40px_rgba(0,0,0,0.4)] transition duration-300 hover:bg-white/10">
        <div className="flex items-start gap-4">
          <div className="mt-1 h-3 w-3 rounded-full bg-purple-500 shadow-[0_0_20px_rgba(168,85,247,0.7)]" />
          <div>
            <h3 className="text-xl font-semibold text-white">
              Kompletný technický setup
            </h3>
            <p className="mt-3 text-sm leading-relaxed text-zinc-400">
              Doména, hosting, SSL certifikát aj firemný email sú zahrnuté v cene.
              Nemusíte riešiť žiadne nastavenia ani externé služby.
            </p>
          </div>
        </div>
      </div>

      {/* Box 2 */}
      <div className="rounded-3xl bg-white/5 p-8 backdrop-blur-xl shadow-[0_10px_40px_rgba(0,0,0,0.4)] transition duration-300 hover:bg-white/10">
        <div className="flex items-start gap-4">
          <div className="mt-1 h-3 w-3 rounded-full bg-purple-500 shadow-[0_0_20px_rgba(168,85,247,0.7)]" />
          <div>
            <h3 className="text-xl font-semibold text-white">
              Moderný responzívny dizajn
            </h3>
            <p className="mt-3 text-sm leading-relaxed text-zinc-400">
              Stránka bude vyzerať profesionálne na mobile aj desktop zariadeniach.
              Pripravená reprezentovať vašu značku.
            </p>
          </div>
        </div>
      </div>

      {/* Box 3 */}
      <div className="rounded-3xl bg-white/5 p-8 backdrop-blur-xl shadow-[0_10px_40px_rgba(0,0,0,0.4)] transition duration-300 hover:bg-white/10">
        <div className="flex items-start gap-4">
          <div className="mt-1 h-3 w-3 rounded-full bg-purple-500 shadow-[0_0_20px_rgba(168,85,247,0.7)]" />
          <div>
            <h3 className="text-xl font-semibold text-white">
              Spustenie do 48 / 24 hodín
            </h3>
            <p className="mt-3 text-sm leading-relaxed text-zinc-400">
              Po dodaní podkladov začína bežať čas. Podľa zvoleného balíka bude stránka online do 48 (Business) alebo 24 (Express) hodín.
            </p>
          </div>
        </div>
      </div>

      {/* Box 4 */}
      <div id="custom" className="rounded-3xl bg-white/5 p-8 backdrop-blur-xl shadow-[0_10px_40px_rgba(0,0,0,0.4)] transition duration-300 hover:bg-white/10">
        <div className="flex items-start gap-4">
          <div className="mt-1 h-3 w-3 rounded-full bg-purple-500 shadow-[0_0_20px_rgba(168,85,247,0.7)]" />
          <div>
            <h3 className="text-xl font-semibold text-white">
              Jednoduchý proces
            </h3>
            <p className="mt-3 text-sm leading-relaxed text-zinc-400">
              Vyberiete balík, zaplatíte online a následne nahráte obsah cez
              jednoduchý formulár. O všetko ostatné sa postaráme my.
            </p>
          </div>
        </div>
      </div>

    </div>

    <div className="mt-8 text-center">
      <button
        type="button"
        onClick={() => window.open('/preview', '_blank')}
        className="rounded-2xl bg-purple-600 px-6 py-3 text-sm font-semibold text-white transition duration-300 hover:bg-purple-500 hover:shadow-[0_0_25px_rgba(168,85,247,0.6)]"
      >
        Prezrieť Demo stránku
      </button>
    </div>

    {/* ===================== */}
    {/* CUSTOM Timeline + Nadpis */}
    {/* ===================== */}

    


    <div  className="mt-16 text-center">
      <h2 className="text-4xl font-semibold text-white sm:text-5xl">
        Custom
      </h2>
    </div>

    {/* Custom Box */}
    <div className="mt-12 grid gap-8 sm:grid-cols-2">

      <div className="rounded-3xl bg-white/5 p-8 backdrop-blur-xl shadow-[0_10px_40px_rgba(0,0,0,0.4)] transition duration-300 hover:bg-white/10 sm:col-span-2">

        <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">

          <div className="max-w-xl">
            <div className="flex items-start gap-4">
              <div className="mt-1 h-3 w-3 rounded-full bg-purple-500 shadow-[0_0_20px_rgba(168,85,247,0.7)]" />
              <div>
                <h3 className="text-xl font-semibold text-white">
                  Riešenie pre komplexné projekty a e-shopy
                </h3>

                <p className="mt-3 text-sm leading-relaxed text-zinc-400">
                  Potrebujete pokročilé funkcionality, rezervačný systém alebo
                  individuálny dizajn? Pripravíme riešenie na mieru podľa vašich požiadaviek.
                </p>
              </div>
            </div>
          </div>

          <div className="flex-shrink-0">
            <button
              type="button"
              onClick={() => {
                const el = document.getElementById("kontakt");
                el?.scrollIntoView({ behavior: "smooth", block: "start" });
              }}
              className="rounded-2xl bg-purple-600 px-6 py-3 text-sm font-semibold text-white transition duration-300 hover:bg-purple-500 hover:shadow-[0_0_25px_rgba(168,85,247,0.6)]"
            >
              Požiadať o ponuku
            </button>
          </div>

        </div>

      </div>

    </div>

  </div>
</section>
  );
}
