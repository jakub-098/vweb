"use client";

export default function Faq() {
  return (
    <section
      id="faq"
      className="w-full max-w-6xl px-6 pt-0 pb-16 mb-12"
    >
    <div className="text-center">
      <p className="text-[0.7rem] font-semibold uppercase tracking-[0.3em] text-purple-300/80">
      FAQ
      </p>
      <h2 className="mt-4 text-3xl font-semibold text-zinc-50 sm:text-4xl">
      Časté otázky na nás
      </h2>
    </div>

    <div className="mt-12 space-y-8 text-left">
        <details className="group">
        <summary className="flex cursor-pointer items-center justify-between text-base font-semibold text-zinc-50 transition-colors duration-200 hover:text-purple-300 sm:text-lg">
          <span>Ako bude vyzerať naša spolupráca?</span>
          <span className="ml-6 text-sm text-zinc-500 transition-transform duration-300 group-open:rotate-90">
            +
          </span>
        </summary>
        <p className="mt-3 text-sm leading-relaxed text-zinc-400 sm:text-base">

            Po zakúpení balíka vám príde e‑mail s odkazom na náš konfigurátor, kde sa vás spýtame zopár otázok a následne nahráte potrebné podklady. Na odovzdanie podkladov máte ľubovoľné množstvo času a viete sa k tomu kedykoľvek vrátiť. Po odovzdaní podkladov nám začína bežať čas a púšťame sa do práce, aby ste mali stránku online do termínu v závislosti od zvoleného balíka. Po dokončení stránky vám príde email s potvrdením. Ak niečo nebude sedieť alebo budete chcieť niečo doplniť, bezplatne to vyriešime v čo najkratšom čase. 
        </p>
      </details>

      
    <details className="group">
        <summary className="flex cursor-pointer items-center justify-between text-base font-semibold text-zinc-50 transition-colors duration-200 hover:text-purple-300 sm:text-lg">
          <span>Čo ak si niesom istý výberom balíka?</span>
          <span className="ml-6 text-sm text-zinc-500 transition-transform duration-300 group-open:rotate-90">
            +
          </span>
        </summary>
        <p className="mt-3 text-sm leading-relaxed text-zinc-400 sm:text-base">
            Ak si nie ste istý, ktorý balík je pre vás najvhodnejší, neváhajte nás kontaktovat. Radi vám pomôžeme s výberom a navrhneme najlepšie riešenie pre váš projekt.
        </p>
      </details>

        <details className="group">
        <summary className="flex cursor-pointer items-center justify-between text-base font-semibold text-zinc-50 transition-colors duration-200 hover:text-purple-300 sm:text-lg">
          <span>Aký je rozdiel medzi Business a Express balíkom?</span>
          <span className="ml-6 text-sm text-zinc-500 transition-transform duration-300 group-open:rotate-90">
            +
          </span>
        </summary>
        <p className="mt-3 text-sm leading-relaxed text-zinc-400 sm:text-base">
          Balíky ponúkajú identický výsledok, líšia sa len v dobe dodania. Business doručíme do 48 hodín a Express do 24 hodín. 
        </p>
      </details>

      <details className="group">
        <summary className="flex cursor-pointer items-center justify-between text-base font-semibold text-zinc-50 transition-colors duration-200 hover:text-purple-300 sm:text-lg">
          <span>Čo všetko je v cene?</span>
          <span className="ml-6 text-sm text-zinc-500 transition-transform duration-300 group-open:rotate-90">
            +
          </span>
        </summary>
        <p className="mt-3 text-sm leading-relaxed text-zinc-400 sm:text-base">
          V cene je kompletný web, technický setup (doména, hosting, e‑maily),
            responzívny dizajn a základná SEO príprava. Pri Custom riešení
            zahrnieme aj individuálne požiadavky.
        </p>
      </details>
      

      
    </div>
	</section>
  );
}
