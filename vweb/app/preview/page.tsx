"use client";

import { useEffect, useState } from "react";

export default function PreviewPage() {
  const [showAllGallery, setShowAllGallery] = useState(false);
  const galleryCount = showAllGallery ? 9 : 6;
  const [navScrolled, setNavScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (typeof window === "undefined") return;
      setNavScrolled(window.scrollY > 40);
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="relative flex min-h-screen flex-col items-center overflow-hidden bg-zinc-100 text-slate-900">
      {/* NAVBAR */}
      <header
        className={`fixed top-0 z-20 flex w-full justify-center transition-colors duration-300 ${
          navScrolled ? "bg-white/90 border-b border-slate-200/70 backdrop-blur-xl" : "bg-transparent"
        }`}
      >
        <div
          className={`flex w-full max-w-6xl items-center justify-between text-sm text-slate-700 sm:w-4/5 lg:w-2/3 transition-all duration-300 ${
            navScrolled
              ? "px-4 py-2 sm:px-8 rounded-none shadow-none"
              : "mt-4 px-5 py-3 sm:px-8 rounded-full border border-white/70 bg-white/80 shadow-[0_10px_30px_rgba(15,23,42,0.08)] backdrop-blur-xl"
          }`}
        >
          <span className="text-sm font-semibold tracking-tight text-slate-900">
            <span className="text-sky-600">vas</span>web.sk
          </span>
          <nav className="flex items-center gap-4 text-xs font-medium text-slate-600 sm:text-sm">
            <a href="#about" className="transition hover:text-slate-900">
              O projekte
            </a>
            <a href="#services" className="transition hover:text-slate-900">
              Služby
            </a>
            <a href="#kontakt" className="transition hover:text-slate-900">
              Kontakt
            </a>
          </nav>
        </div>
      </header>

      {/* Top hero background image (visible upper 100vh) */}
      <div
		className="pointer-events-none absolute inset-x-0 top-0 z-0 h-screen bg-[url('/bg.webp')] bg-cover bg-center opacity-90"
        aria-hidden
      />
      <div
		className="pointer-events-none absolute inset-x-0 top-0 z-0 h-screen bg-gradient-to-t from-slate-900/70 via-slate-400/30 to-transparent"
        aria-hidden
      />
      {/* HERO */}
      <section className="flex min-h-[90vh] w-full items-center justify-center px-4 pt-28 sm:px-8">
        <div className="relative w-full max-w-6xl sm:w-4/5 lg:w-2/3">
          <div className="relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white/70 px-7 py-12 shadow-[0_14px_32px_rgba(15,23,42,0.12)] backdrop-blur-xl sm:px-11 sm:py-14">
            <div className="pointer-events-none absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-white/40 to-transparent opacity-70" />
            <div className="relative flex flex-col items-center text-center text-slate-900">
              <p className="mb-3 text-[0.7rem] font-semibold uppercase tracking-[0.35em] text-sky-500/90">
                Ukážka
              </p>
              <h1 className="mb-4 max-w-2xl text-balance text-4xl font-semibold leading-tight tracking-tight text-slate-800 sm:text-5xl md:text-6xl">
                Takto môže vyzerať tvoj hotový web.
              </h1>
              <p className="max-w-xl text-sm leading-relaxed text-slate-500 sm:text-base md:text-lg">
                Moderný, čistý dizajn so zameraním na prehľadnosť, čitateľnosť a jasnú štruktúru obsahu.
              </p>
              <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
                <a
                  href="#about"
                  className="rounded-full bg-sky-600 px-6 py-2.5 text-sm font-medium text-white shadow-[0_10px_30px_rgba(37,99,235,0.45)] transition hover:bg-sky-500"
                >
                  Pozrieť sekcie nižšie
                </a>
                <a
                  href="#services"
                  className="rounded-full border border-slate-300 bg-white/70 px-6 py-2.5 text-sm font-medium text-slate-700 shadow-[0_4px_16px_rgba(15,23,42,0.14)] backdrop-blur-sm transition hover:bg-slate-100 hover:text-slate-800"
                >
                  Služby a spolupráca
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ABOUT */}
      <section id="about" className="w-full max-w-6xl px-4 pt-16 sm:w-4/5 lg:w-2/3 sm:px-0">
        <div className="relative overflow-hidden rounded-2xl border border-white/70 bg-white/80 px-8 py-10 shadow-[0_18px_40px_rgba(15,23,42,0.08)] backdrop-blur-xl sm:px-12 sm:py-14">
          <div className="grid gap-10 md:grid-cols-2 md:items-center">
            <div>
              <p className="text-[0.7rem] font-semibold uppercase tracking-[0.3em] text-sky-500">
                O projekte
              </p>
              <h2 className="mt-3 text-2xl font-semibold text-slate-900 sm:text-3xl">
                Predstavte si, že váš web pôsobí profesionálne od prvej sekundy.
              </h2>
              <p className="mt-4 text-sm leading-relaxed text-slate-600 sm:text-base">
                Tento náhľad ukazuje štýl, v akom budeme stavať vašu stránku – tmavý, elegantný podklad,
                  čitateľná typografia a jasne oddelené sekcie, ktoré klientovi pomôžu rýchlo sa zorientovať.
              </p>
            </div>
            <div className="space-y-4 text-sm text-slate-600 sm:text-base">
              <p>
                Na tomto mieste môže byť krátky príbeh vašej značky, prečo robíte to, čo robíte, a čo je vaším hlavným
                  cieľom – či už ide o získanie nových klientov, predaj produktov alebo prezentáciu portfólia.
              </p>
              <p>
                Text je pripravený tak, aby sa dal jednoducho vymeniť za váš vlastný obsah bez toho, aby sa rozbil dizajn
                  alebo rytmus stránky.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CARDS / BENEFITS */}
      <section className="w-full max-w-6xl px-4 pt-16 sm:w-4/5 lg:w-2/3 sm:px-0">
        <div className="relative mx-auto w-full">
          <div className="mb-8 text-center">
            <p className="text-[0.7rem] font-semibold uppercase tracking-[0.3em] text-sky-500">
              Čo získate
            </p>
            <h2 className="mt-3 text-2xl font-semibold text-slate-900 sm:text-3xl">
              Kľúčové bloky vášho webu.
            </h2>
          </div>

          <div className="relative">
            <div className="pointer-events-none absolute inset-0 -z-10 rounded-[2.25rem] border border-white/80 bg-white/80 shadow-[0_18px_40px_rgba(15,23,42,0.08)] backdrop-blur-xl" />
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {["Hero", "O nás", "Služby", "Kontakt"].map((title, i) => (
                <div
                  key={title}
                  className="group relative overflow-hidden rounded-2xl border border-white/70 bg-white/80 px-6 py-7 text-left text-sm text-slate-700 shadow-[0_14px_32px_rgba(15,23,42,0.08)] backdrop-blur-xl transition duration-200 hover:-translate-y-1.5 hover:border-slate-300 hover:bg-white"
                >
                  <div className="pointer-events-none absolute inset-x-5 top-0 h-px bg-gradient-to-r from-transparent via-white/45 to-transparent opacity-80" />
                  <p className="text-[0.7rem] font-medium uppercase tracking-[0.3em] text-sky-500">
                    Blok {i + 1}
                  </p>
                  <h3 className="mt-3 text-lg font-semibold text-slate-900 sm:text-xl">
                    {title}
                  </h3>
                  <p className="mt-3 text-xs leading-relaxed text-slate-600 sm:text-sm">
                    Tu bude stručný popis, čo sa v tomto bloku objaví – či už je to hlavný nadpis, predstavenie firmy,
                    nabídka služieb alebo kontaktný formulár.
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* SERVICES / SEKCIA AKO E-SHOPY */}
      <section id="services" className="w-full max-w-6xl px-4 pt-16 sm:w-4/5 lg:w-2/3 sm:px-0">
        <div className="relative overflow-hidden rounded-2xl border border-white/70 bg-white/80 shadow-[0_18px_40px_rgba(15,23,42,0.08)] backdrop-blur-xl">
          <div className="relative px-8 py-10 sm:px-12 sm:py-14">
            <p className="text-[0.7rem] font-semibold uppercase tracking-[0.3em] text-sky-500">
              Služby
            </p>
            <h2 className="mt-3 max-w-xl text-2xl font-semibold text-slate-900 sm:text-3xl">
              Ukážka, ako môžu byť vaše služby odprezentované.
            </h2>
            <p className="mt-4 max-w-2xl text-sm leading-relaxed text-slate-600 sm:text-base">
              Každú službu vieme premeniť na samostatný blok – s krátkym opisom, benefitmi a jasnou výzvou k akcii,
              tak ako v sekcii e-shopov na hlavnej stránke.
            </p>
            <div className="mt-8 space-y-5">
              {["Služba A", "Služba B", "Služba C"].map((service) => (
                <div
                  key={service}
                   className="flex flex-col overflow-hidden rounded-2xl bg-white/80 text-sm text-slate-700 shadow-[0_18px_40px_rgba(15,23,42,0.1)] backdrop-blur-xl sm:flex-row"
                >
                  <div className="h-48 w-full bg-[url('/bg.webp')] bg-cover bg-center sm:h-52 sm:w-1/3" />
                  <div className="flex w-full flex-1 flex-col justify-center px-7 py-7 sm:px-8 sm:py-8 min-h-[11rem]">
                    <h3 className="text-xl font-semibold text-slate-900 sm:text-2xl">{service}</h3>
                    <p className="mt-3 text-sm leading-relaxed text-slate-600 sm:text-base">
                      Stručný opis služby – čo presne pre klienta spraví a prečo je dôležitá.
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* GALLERY */}
      <section className="w-full max-w-6xl px-4 pt-16 sm:w-4/5 lg:w-2/3 sm:px-0">
        <div className="relative overflow-hidden rounded-2xl border border-white/70 bg-white/80 px-8 py-10 shadow-[0_18px_40px_rgba(15,23,42,0.08)] backdrop-blur-xl sm:px-12 sm:py-14">
          <div className="mb-8 flex items-baseline justify-between gap-4">
            <div>
              <p className="text-[0.7rem] font-semibold uppercase tracking-[0.3em] text-sky-500">
                Galéria
              </p>
              <h2 className="mt-3 text-2xl font-semibold text-slate-900 sm:text-3xl">
                Priestor pre vaše ukážky.
              </h2>
            </div>
            <p className="max-w-sm text-xs text-slate-600 sm:text-sm">
              Mriežka, do ktorej doplníme vaše reálne projekty, fotky alebo screenshoty webu.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
            {Array.from({ length: galleryCount }).map((_, i) => (
              <div
                key={i}
                className="relative aspect-square overflow-hidden rounded-2xl border border-white/70 bg-[url('/bg.webp')] bg-cover bg-center shadow-[0_14px_32px_rgba(15,23,42,0.08)]"
              />
            ))}
          </div>

          {!showAllGallery && (
            <div className="mt-8 flex justify-center">
              <button
                type="button"
                onClick={() => setShowAllGallery(true)}
                className="inline-flex items-center gap-2 rounded-full border border-slate-300 bg-white/90 px-7 py-2.5 text-sm font-medium text-slate-700 shadow-[0_4px_16px_rgba(15,23,42,0.12)] backdrop-blur-sm transition hover:bg-slate-100 hover:text-slate-900 hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(15,23,42,0.18)]"
              >
                Zobraziť viac fotiek
                <span className="text-xs">↓</span>
              </button>
            </div>
          )}
        </div>
      </section>

      {/* FAQ */}
      <section className="w-full max-w-6xl px-4 pt-16 sm:w-4/5 lg:w-2/3 sm:px-0">
        <div className="relative overflow-hidden rounded-2xl border border-white/70 bg-white/80 px-8 py-10 shadow-[0_18px_40px_rgba(15,23,42,0.08)] backdrop-blur-xl sm:px-12 sm:py-14">
          <div className="mb-8">
            <p className="text-[0.7rem] font-semibold uppercase tracking-[0.3em] text-sky-500">
              FAQ
            </p>
            <h2 className="mt-3 text-2xl font-semibold text-slate-900 sm:text-3xl">
              Časté otázky, ktoré môžete klientom zodpovedať.
            </h2>
          </div>
          <div className="divide-y divide-slate-200">
            {["Ako rýchlo web dodáte?", "Čo všetko je v cene?", "Ako bude vyzerať spolupráca?"]
              .map((q) => (
                <details key={q} className="group py-4">
                  <summary className="flex cursor-pointer items-center justify-between text-sm font-medium text-slate-900 sm:text-base">
                    <span>{q}</span>
                    <span className="ml-4 text-xs text-slate-400 transition-transform duration-200 group-open:rotate-90">
                      ↗
                    </span>
                  </summary>
                  <p className="mt-2 text-xs leading-relaxed text-slate-600 sm:text-sm">
                    Tu môžete klientom vysvetliť, čo môžu od spolupráce čakať – od termínov cez obsah až po technické detaily.
                  </p>
                </details>
              ))}
          </div>
        </div>
      </section>

      {/* CONTACT - light preview-styled form */}
      <section
        id="kontakt"
        className="w-full max-w-6xl px-4 pt-16 pb-10 sm:w-4/5 lg:w-2/3 sm:px-0"
      >
        <div className="relative overflow-hidden rounded-2xl border border-white/70 bg-white/80 px-8 py-10 shadow-[0_18px_40px_rgba(15,23,42,0.08)] backdrop-blur-xl sm:px-12 sm:py-14">
          <div className="mb-8 text-left">
            <p className="text-[0.7rem] font-semibold uppercase tracking-[0.3em] text-sky-500">
              Kontakt
            </p>
            <h2 className="mt-3 text-2xl font-semibold text-slate-900 sm:text-3xl">
              Napíšte mi správu
            </h2>
            <p className="mt-3 max-w-xl text-sm leading-relaxed text-slate-600 sm:text-base">
              Zanechajte svoj e-mail a krátku správu. V reálnom projekte tu bude
              plne funkčný kontaktný formulár napojený na váš mail.
            </p>
          </div>

          <form className="space-y-8">
            <div className="space-y-3">
              <label
                htmlFor="preview-email"
                className="text-xs font-medium uppercase tracking-[0.2em] text-sky-600"
              >
                Váš e-mail
              </label>
              <input
                id="preview-email"
                type="email"
                required
                className="w-full rounded-xl border border-slate-200 bg-white/70 px-4 py-3 text-sm text-slate-900 outline-none ring-0 transition placeholder:text-slate-400 focus:border-slate-400 focus:bg-white"
                placeholder="vas@email.sk"
              />
            </div>

            <div className="space-y-3">
              <label
                htmlFor="preview-message"
                className="text-xs font-medium uppercase tracking-[0.2em] text-sky-600"
              >
                Správa
              </label>
              <textarea
                id="preview-message"
                required
                rows={4}
                className="w-full resize-none rounded-xl border border-slate-200 bg-white/70 px-4 py-3 text-sm text-slate-900 outline-none ring-0 transition placeholder:text-slate-400 focus:border-slate-400 focus:bg-white"
                placeholder="Stručne napíšte, čo potrebujete..."
              />
            </div>

            <div className="pt-2">
              <button
                type="button"
                className="inline-flex items-center justify-center rounded-2xl bg-slate-900 px-10 py-3.5 text-sm font-semibold text-slate-50 shadow-[0_10px_30px_rgba(15,23,42,0.3)] transition duration-200 hover:scale-[1.01] hover:bg-slate-800"
              >
                Odoslať (ukážka)
              </button>
            </div>
          </form>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="w-full border-t border-slate-200/70 bg-white/80 px-4 py-8 text-sm text-slate-600 sm:px-8">
        <div className="mx-auto flex w-full max-w-6xl flex-col items-center justify-between gap-4 sm:w-4/5 sm:flex-row lg:w-2/3">
          <div className="text-center sm:text-left">
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-500">
              vasweb.sk
            </p>
            <p className="mt-2 max-w-md text-xs leading-relaxed text-slate-500 sm:text-sm">
              Jednoduché prezentačné weby na mieru, navrhnuté tak, aby pôsobili
              profesionálne a boli ľahko zrozumiteľné pre vašich klientov.
            </p>
          </div>
          <div className="flex flex-col items-center gap-1 text-xs text-slate-500 sm:items-end sm:text-sm">
            <a href="mailto:studio@vasweb.sk" className="transition hover:text-slate-900">
              studio@vasweb.sk
            </a>
            <a href="tel:+421900000000" className="transition hover:text-slate-900">
              +421 900 000 000
            </a>
            <p className="mt-1 text-[0.7rem] text-slate-400">
              © {new Date().getFullYear()} vasweb.sk – všetky práva vyhradené.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
