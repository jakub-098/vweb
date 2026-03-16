"use client";

import { useRouter } from "next/navigation";

export default function Baliky() {
  const router = useRouter();
  const plans = [
    {
      name: "Classic",
      label: "Základný balík",
      featured: false,
      delivery: "48h",
      price: "590 €",
      monthly: "19,90€ mes",
      //price_id:"price_1T5uvkKXcEzYeCDYk5H6ua3K",
      price_id:"price_1TBOccKXcEzYeCDYVAPOqMAk",
      subscription:"price_1TBNp8KXcEzYeCDY4iidBXKr",
      fast_fee:"price_1TBOaNKXcEzYeCDYBkSlxj7w", 
      features: [
        "Kompletný web bez starostí",
        "Výber vlastnej domény",
        "Nastavenie e‑mailov",
        "Nastavenie hostingu",
        "SEO optimalizácia",
        "Responzívny dizajn",
        "jednoduché textové logo"
        
        
      ],
    },
    {
      name: "Business",
      label: "Najobľúbenejší balík",
      featured: true,
      delivery: "24h",
      price: "0 €",
      monthly: "79,90€ mesačne",
      subscription:"price_1TBOPBKXcEzYeCDYqmiFd7C8",
      fast_fee:"price_1TBOaNKXcEzYeCDYBkSlxj7w", 
      
      features: [
        "Zabezbečime online prezenciu vašej firmy ",
        "Rýchla podpora a úpravy podľa vašich požiadaviek",
        "Aktualizácia obsahu a údržba webu bez ďalších poplatkov",
        "Všetky výhody balíka Classic",
        "Možnosť viacerých e-mailových schránok ",
        "Profesionálne SEO nastavenie pre vyššiu návštevnosť",
      ],
    },
    {
      name: "Custom",
      label: "Balík na mieru",
      featured: false,
      delivery: "X h",
      price: "od 1990 €",
      features: [
        "Komplexné riešenie šité na mieru",
        "Rozšírená funkcionalita",
        "Admin panel",
        "Návrh a implementácia databázy",
        "Všetky výhody balíka Business",
      ],
    },
  ];

  return (
	<section id="ponuka" className="relative w-full mb-20">
  <div className="mx-auto max-w-6xl px-6">

    {/* Nadpis */}
    <div className="text-center">
      <p className="text-xs font-semibold uppercase tracking-[0.35em] text-purple-400">
        Možnosti
      </p>
      <h2 className="mt-4 text-4xl font-semibold text-white">
        Vyberte si z našich balíkov
      </h2>
    </div>

    {/* Karty */}
    <div className="mt-16 grid gap-8 lg:grid-cols-3">

      {plans.map((plan) => {
        const isFeatured = plan.featured

        return (
          <div
            key={plan.name}
            className={`relative flex h-full flex-col rounded-3xl bg-white/5 p-8 backdrop-blur-xl transition duration-300 
              hover:bg-white/10
              ${isFeatured ? "scale-105 bg-white/10 shadow-[0_0_60px_rgba(168,85,247,0.25)]" : "shadow-[0_0_40px_rgba(15,23,42,0.6)]"}
            `}
          >

            {/* Glow background for featured */}
            {isFeatured && (
              <div className="absolute inset-0 -z-10 rounded-3xl bg-[radial-gradient(circle_at_top,_rgba(168,85,247,0.25),_transparent_70%)]" />
            )}

            {/* Plan label */}
            <p className="text-xs uppercase tracking-[0.3em] text-purple-300">
              {plan.label}
            </p>

            {/* Name (delivery time hidden in UI) */}
            <h3 className="mt-3 text-2xl font-semibold text-white">
              {plan.name}
            </h3>

            {/* Price */}
            <div className="mt-6">
              <p className="text-5xl font-bold text-white">
                {plan.price}
                {plan.monthly && (
                  <span className="ml-2 text-2xl font-semibold text-zinc-300">
                    + {plan.monthly}
                  </span>
                )}
              </p>
            </div>

            {/* Features + CTA, pinned to bottom */}
            <div className="mt-8 flex flex-1 flex-col justify-between">
              <ul className="space-y-3 text-sm text-zinc-300">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-3">
                    <div className="mt-1 h-2 w-2 rounded-full bg-purple-400" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              <div className="mt-8">
                <button
                  type="button"
                  onClick={() => {
                    if (plan.name === "Custom") {
                      if (typeof window !== "undefined") {
                        const el = document.getElementById("custom");
                        el?.scrollIntoView({ behavior: "smooth", block: "start" });
                      }
                      return;
                    }

                    if (typeof window === "undefined") return;

                    const numericPrice = (() => {
                      const cleaned = plan.price.replace(/[^0-9,\.]/g, "").replace(",", ".");
                      const num = parseFloat(cleaned);
                      return Number.isNaN(num) ? 0 : num;
                    })();

                    const deliverySpeed = plan.delivery === "24h" ? "24h" : "48h" as const;

                    try {
                      window.localStorage.setItem(
                        "vwebConfigSummary",
                        JSON.stringify({
                          theme: "tmava",
                          accentColor: "#a855f7",
                          accentCustom: null,
                          mailOption: "potrebujem",
                          sectionAbout: true,
                          sectionCards: true,
                          sectionFaq: true,
                          sectionGallery: false,
                          sectionOffer: true,
                          sectionContactForm: true,
                          customFont: null,
                          domainOption: "request",
                          domainOwn: "",
                          domainRequest: "",
                          totalPrice: numericPrice,
                          deliverySpeed,
                          packageName: plan.name,
                          priceId: plan.price_id ?? null,
                          discountPriceId: null,
                          monthly: plan.monthly ?? null,
                          subscriptionPriceId: plan.subscription ?? null,
                          fastFeePriceId: plan.fast_fee ?? null,
                        }),
                      );
                    } catch {
                      // ignore localStorage errors
                    }

                    router.push("/summary");
                  }}
                  className={`w-full rounded-full py-3 text-sm font-semibold transition 
                    ${isFeatured 
                      ? "bg-purple-500 text-white hover:bg-purple-400" 
                      : "bg-white text-black hover:bg-zinc-200"}
                  `}
                >
                  Vybrať balík
                </button>
              </div>
            </div>

          </div>
        )
      })}

    </div>
  </div>
</section>
  );
}
