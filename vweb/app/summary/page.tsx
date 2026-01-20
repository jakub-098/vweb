"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type Order = {
  id: number;
  user_email: string | null;
  section_about?: number | boolean;
  section_cards?: number | boolean;
  section_faq?: number | boolean;
  section_gallery?: number | boolean;
  section_offer?: number | boolean;
  section_contact_form?: number | boolean;
  total_price?: number | null;
  delivery_speed?: string | null;
  domain_option?: string | null;
  mail_option?: string | null;
};

function isTruthyFlag(value: number | boolean | undefined | null): boolean {
  if (value == null) return false;
  if (typeof value === "boolean") return value;
  return value !== 0;
}

export default function SummaryPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [order, setOrder] = useState<Order | null>(null);
  const [termsAccepted, setTermsAccepted] = useState(false);

  useEffect(() => {
    async function loadOrder() {
      try {
        let email: string | null = null;
        if (typeof window !== "undefined") {
          try {
            email = window.localStorage.getItem("vwebOrderEmail");
          } catch {
            email = null;
          }
        }

        if (!email) {
          router.replace("/config");
          return;
        }

        const res = await fetch("/api/orders/find-by-email", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email }),
        });

        if (!res.ok) {
          router.replace("/config");
          return;
        }

        const data = await res.json();
        if (!data.success || !data.found || !data.order) {
          router.replace("/config");
          return;
        }

        setOrder(data.order as Order);
        setLoading(false);
      } catch (err) {
        console.error("Failed to load order for summary page", err);
        setError("Pri načítaní konfigurácie nastala chyba. Skús to neskôr.");
        setLoading(false);
      }
    }

    loadOrder();
  }, []);

  const selectedSections: { key: string; label: string }[] = [];
  if (order) {
    if (isTruthyFlag(order.section_about)) selectedSections.push({ key: "section_about", label: "O projekte" });
    if (isTruthyFlag(order.section_cards)) selectedSections.push({ key: "section_cards", label: "Karty / výhody" });
    if (isTruthyFlag(order.section_offer)) selectedSections.push({ key: "section_offer", label: "Ponuka / služby" });
    if (isTruthyFlag(order.section_gallery)) selectedSections.push({ key: "section_gallery", label: "Galéria" });
    if (isTruthyFlag(order.section_faq)) selectedSections.push({ key: "section_faq", label: "FAQ" });
    if (isTruthyFlag(order.section_contact_form)) selectedSections.push({ key: "section_contact_form", label: "Kontaktný formulár" });
  }

  const deliveryLabel = (() => {
    if (!order || !order.delivery_speed) return "48 h";
    return order.delivery_speed === "24h" ? "24 h (expres)" : "48 h";
  })();

  const totalPriceValue = (() => {
    if (!order || order.total_price == null) return null;
    const num = Number(order.total_price);
    if (Number.isNaN(num)) return null;
    return num;
  })();

  return (
    <section className="min-h-screen w-full bg-gradient-to-b from-black via-zinc-950 to-black px-4 py-16 text-zinc-50 sm:px-8">
      <div className="mx-auto w-full max-w-4xl">
        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl md:text-4xl">
          Zhrnutie tvojej konfigurácie
        </h1>
        <p className="mt-3 max-w-2xl text-sm text-zinc-300 sm:text-base">
          Tu nájdeš prehľad sekcií, ktoré si si vybral. Odtiaľto sa môžeš vrátiť späť do konfigurátora a upraviť svoje nastavenia.
        </p>

        <div className="mt-8 rounded-2xl border border-purple-300/25 bg-black/60 px-6 py-6 text-sm text-zinc-200 shadow-[0_24px_80px_rgba(0,0,0,0.95)]">
          {loading && <p>Načítavam tvoju konfiguráciu...</p>}
          {!loading && error && <p className="text-sm text-red-300">{error}</p>}
          {!loading && !error && order && (
            <>
              {selectedSections.length === 0 ? (
                <p>Pre túto konfiguráciu nemáme žiadne aktívne sekcie.</p>
              ) : (
                <ul className="space-y-3">
                  {selectedSections.map((s) => (
                    <li
                      key={s.key}
                      className="flex items-center justify-between rounded-lg border border-purple-300/30 bg-black/60 px-4 py-3 text-sm text-zinc-100"
                    >
                      <span>{s.label}</span>
                    </li>
                  ))}
                </ul>
              )}
              <div className="mt-6 flex justify-end">
                <button
                  type="button"
                  className="inline-flex items-center rounded-md border border-purple-400/70 bg-purple-500/30 px-4 py-1.5 text-[0.8rem] font-semibold text-purple-50 hover:bg-purple-500/40"
                  onClick={() => router.push("/config?edit=1")}
                >
                  Upraviť konfiguráciu
                </button>
              </div>
            </>
          )}
        </div>

        {!loading && !error && order && (
          <>
            <div className="mt-5 rounded-2xl border border-purple-400/40 bg-black/40 px-5 py-4 text-sm text-zinc-100 shadow-[0_18px_60px_rgba(0,0,0,0.9)] sm:px-6 sm:py-5">
              <p className="text-[0.7rem] font-semibold uppercase tracking-[0.3em] text-purple-200">
                Cena projektu
              </p>
              <p className="mt-2 text-3xl font-bold tracking-tight text-zinc-50">
                {totalPriceValue != null ? totalPriceValue.toFixed(2) : "-"} €
              </p>
              <div className="mt-3 text-[0.8rem] text-zinc-300">
                <p>Dodanie: {deliveryLabel}</p>
              </div>
            </div>

            <div className="mt-5 flex items-start gap-2 text-xs text-zinc-300 sm:text-sm">
              <input
                id="terms-checkbox"
                type="checkbox"
                className="mt-0.5 h-4 w-4 cursor-pointer rounded border-zinc-500 bg-transparent text-purple-500 focus:ring-purple-500"
                checked={termsAccepted}
                onChange={(e) => setTermsAccepted(e.target.checked)}
              />
              <label htmlFor="terms-checkbox" className="cursor-pointer select-none">
                Súhlasím s{" "}
                <a
                  href="/podmienky"
                  target="_blank"
                  rel="noreferrer"
                  className="underline underline-offset-2"
                >
                  všeobecnými podmienkami vweb.sk
                </a>
              </label>
            </div>

            <div className="mt-5 flex justify-end">
              <button
                type="button"
                disabled={!termsAccepted}
                onClick={() => {
                  if (!termsAccepted) return;
                  // TODO: Integrácia platby
                }}
                className="inline-flex items-center rounded-full bg-purple-500/90 px-6 py-2 text-sm font-semibold text-white shadow-[0_0_25px_rgba(168,85,247,0.6)] transition hover:bg-purple-400 disabled:cursor-not-allowed disabled:bg-purple-500/50"
              >
                Dokončiť a zaplatiť
              </button>
            </div>
          </>
        )}
      </div>
    </section>
  );
}
