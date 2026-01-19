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
      </div>
    </section>
  );
}
