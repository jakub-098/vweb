"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type Order = {
  id: number;
  user_email: string | null;
  is_company?: number | boolean | null;
  company_name?: string | null;
  company_address?: string | null;
  ico?: string | null;
  dic?: string | null;
  total_price?: number | string | null;
  status?: number | null;
  delivery_speed?: string | null;
  section_about?: number | boolean;
  section_cards?: number | boolean;
  section_faq?: number | boolean;
  section_gallery?: number | boolean;
  section_offer?: number | boolean;
  section_contact_form?: number | boolean;
  // header/footer sú povinné sekcie, takže ich v objednávke nemusíme mať ako flagy,
  // ale v detaile ich chceme vedieť zobraziť
};

function isTruthyFlag(value: number | boolean | undefined | null): boolean {
  if (value == null) return false;
  if (typeof value === "boolean") return value;
  return value !== 0;
}

export default function AdminOrderDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [order, setOrder] = useState<Order | null>(null);
  const [sections, setSections] = useState<Record<string, any | null>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        if (typeof window === "undefined") return;
        let pw: string | null = null;
        try {
          pw = window.localStorage.getItem("vwebAdminPassword");
        } catch {
          pw = null;
        }
        if (!pw) {
          router.replace("/admin");
          return;
        }

        const res = await fetch(`/api/admin/orders/${id}`, {
          headers: {
            "x-admin-password": pw,
          },
        });

        if (res.status === 401) {
          router.replace("/admin");
          return;
        }

        if (!res.ok) {
          setError("Nepodarilo sa načítať objednávku.");
          setLoading(false);
          return;
        }

        const data = await res.json();
        if (!data.success || !data.order) {
          setError("Objednávka nebola nájdená.");
          setLoading(false);
          return;
        }

        const loadedOrder = data.order as Order;
        setOrder(loadedOrder);

        // načítaj obsah jednotlivých sekcií cez existujúce API endpoints
        const sectionPromises: Promise<void>[] = [];
        const newSections: Record<string, any | null> = {};

        const orderId = loadedOrder.id;

        const fetchSection = async (key: string, url: string) => {
          try {
            const res = await fetch(url);
            if (!res.ok) return;
            const json = await res.json();
            newSections[key] = json;
          } catch {
            // ignore
          }
        };

        // Header a footer sú povinné sekcie – načítame ich vždy.
        sectionPromises.push(fetchSection("header", `/api/sections/header?orderId=${orderId}`));

        if (isTruthyFlag(loadedOrder.section_about)) {
          sectionPromises.push(fetchSection("about", `/api/sections/about?orderId=${orderId}`));
        }
        if (isTruthyFlag(loadedOrder.section_cards)) {
          sectionPromises.push(fetchSection("cards", `/api/sections/cards?orderId=${orderId}`));
        }
        if (isTruthyFlag(loadedOrder.section_faq)) {
          sectionPromises.push(fetchSection("faq", `/api/sections/faq?orderId=${orderId}`));
        }
        if (isTruthyFlag(loadedOrder.section_gallery)) {
          sectionPromises.push(fetchSection("gallery", `/api/sections/gallery?orderId=${orderId}`));
        }
        if (isTruthyFlag(loadedOrder.section_offer)) {
          sectionPromises.push(fetchSection("offer", `/api/sections/offer?orderId=${orderId}`));
        }
        if (isTruthyFlag(loadedOrder.section_contact_form)) {
          sectionPromises.push(fetchSection("contactForm", `/api/sections/contact-form?orderId=${orderId}`));
        }

        sectionPromises.push(fetchSection("footer", `/api/sections/footer?orderId=${orderId}`));

        await Promise.all(sectionPromises);
        setSections(newSections);
        setLoading(false);
      } catch (err) {
        console.error("Failed to load admin order detail", err);
        setError("Pri načítaní objednávky nastala chyba.");
        setLoading(false);
      }
    }

    load();
  }, [id, router]);

  const priceText = (() => {
    if (!order || order.total_price == null) return "-";
    const num = Number(order.total_price);
    if (Number.isNaN(num)) return "-";
    return num.toFixed(2) + " €";
  })();

  const statusText = (() => {
    const status = order?.status;
    if (status === 0) return "Odoslaná";
    if (status === 1) return "Zaplatená";
    if (status === 2) return "Hotová";
    return "Neznáma";
  })();

  const isPaid = order?.status === 1 || order?.status === 2;
  const isCompleted = order?.status === 2;

  return (
    <section className="min-h-screen w-full bg-gradient-to-b from-black via-zinc-950 to-black px-4 py-16 text-zinc-50 sm:px-8">
      <div className="mx-auto w-full max-w-5xl">
        <button
          type="button"
          onClick={() => router.push("/admin")}
          className="mb-4 text-xs text-zinc-400 hover:text-zinc-200"
        >
          ← Späť na zoznam objednávok
        </button>

        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl md:text-4xl">
          Objednávka #{id}
        </h1>

        {loading && <p className="mt-4 text-sm text-zinc-300">Načítavam objednávku...</p>}
        {error && !loading && <p className="mt-4 text-sm text-red-300">{error}</p>}

        {!loading && !error && order && (
          <>
            <div className="mt-6 grid gap-6 rounded-2xl border border-purple-300/25 bg-black/60 px-6 py-6 text-sm text-zinc-200 shadow-[0_24px_80px_rgba(0,0,0,0.95)] sm:grid-cols-[2fr,1fr]">
              <div className="space-y-2">
                <p><span className="text-zinc-400">E-mail:</span> {order.user_email ?? "(bez e-mailu)"}</p>
                {order.is_company ? (
                  <>
                    <p><span className="text-zinc-400">Firma:</span> {order.company_name ?? "(nešpecifikované)"}</p>
                    <p><span className="text-zinc-400">Sídlo:</span> {order.company_address ?? "(nešpecifikované)"}</p>
                    <p><span className="text-zinc-400">IČO / DIČ:</span> {order.ico ?? "-"} / {order.dic ?? "-"}</p>
                  </>
                ) : null}
                <p><span className="text-zinc-400">Stav:</span> {statusText}</p>
                <p><span className="text-zinc-400">Cena:</span> {priceText}</p>
                {order.delivery_speed && (
                  <p><span className="text-zinc-400">Dodanie:</span> {order.delivery_speed}</p>
                )}
              </div>
              <div className="flex items-center justify-end gap-3">
                {!isPaid && (
                  <button
                    type="button"
                    onClick={async () => {
                      try {
                        await fetch("/api/orders/status", {
                          method: "POST",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({ orderId: order.id, status: 1 }),
                        });
                        setOrder((prev) => (prev ? { ...prev, status: 1 } : prev));
                      } catch (err) {
                        console.error("Failed to set status to paid", err);
                      }
                    }}
                    className="inline-flex items-center rounded-full bg-emerald-500/20 px-4 py-1.5 text-xs font-semibold text-emerald-100/80 shadow-[0_0_18px_rgba(16,185,129,0.7)] transition hover:bg-emerald-500/40"
                  >
                    Zaplatené
                  </button>
                )}

                <button
                  type="button"
                  onClick={async () => {
                    if (isCompleted) return;
                    try {
                      await fetch("/api/orders/status", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ orderId: order.id, status: 2 }),
                      });
                      setOrder((prev) => (prev ? { ...prev, status: 2 } : prev));
                    } catch (err) {
                      console.error("Failed to set status to completed", err);
                    }
                  }}
                  className={`inline-flex items-center rounded-full px-4 py-1.5 text-xs font-semibold shadow-[0_0_18px_rgba(249,115,22,0.7)] transition
                    ${
                      isCompleted
                        ? "bg-orange-500/90 text-white hover:bg-orange-400"
                        : "bg-orange-500/20 text-orange-100/80 hover:bg-orange-500/40"
                    }`}
                >
                  Dokončené
                </button>
              </div>
            </div>

            <div className="mt-8 space-y-6">
              {sections.header && (
                <div className="rounded-2xl border border-purple-300/25 bg-black/60 px-5 py-4">
                  <h2 className="text-lg font-semibold text-zinc-50">Sekcia: Header</h2>
                  <pre className="mt-3 whitespace-pre-wrap break-words text-xs text-zinc-300">
                    {JSON.stringify(sections.header, null, 2)}
                  </pre>
                </div>
              )}

              {isTruthyFlag(order.section_about) && (
                <div className="rounded-2xl border border-purple-300/25 bg-black/60 px-5 py-4">
                  <h2 className="text-lg font-semibold text-zinc-50">Sekcia: O projekte</h2>
                  <pre className="mt-3 whitespace-pre-wrap break-words text-xs text-zinc-300">
                    {JSON.stringify(sections.about, null, 2)}
                  </pre>
                </div>
              )}

              {isTruthyFlag(order.section_cards) && (
                <div className="rounded-2xl border border-purple-300/25 bg-black/60 px-5 py-4">
                  <h2 className="text-lg font-semibold text-zinc-50">Sekcia: Karty / výhody</h2>
                  <pre className="mt-3 whitespace-pre-wrap break-words text-xs text-zinc-300">
                    {JSON.stringify(sections.cards, null, 2)}
                  </pre>
                </div>
              )}

              {isTruthyFlag(order.section_offer) && (
                <div className="rounded-2xl border border-purple-300/25 bg-black/60 px-5 py-4">
                  <h2 className="text-lg font-semibold text-zinc-50">Sekcia: Ponuka / služby</h2>
                  <pre className="mt-3 whitespace-pre-wrap break-words text-xs text-zinc-300">
                    {JSON.stringify(sections.offer, null, 2)}
                  </pre>
                </div>
              )}

              {isTruthyFlag(order.section_gallery) && (
                <div className="rounded-2xl border border-purple-300/25 bg-black/60 px-5 py-4">
                  <h2 className="text-lg font-semibold text-zinc-50">Sekcia: Galéria</h2>
                  <pre className="mt-3 whitespace-pre-wrap break-words text-xs text-zinc-300">
                    {JSON.stringify(sections.gallery, null, 2)}
                  </pre>
                </div>
              )}

              {isTruthyFlag(order.section_faq) && (
                <div className="rounded-2xl border border-purple-300/25 bg-black/60 px-5 py-4">
                  <h2 className="text-lg font-semibold text-zinc-50">Sekcia: FAQ</h2>
                  <pre className="mt-3 whitespace-pre-wrap break-words text-xs text-zinc-300">
                    {JSON.stringify(sections.faq, null, 2)}
                  </pre>
                </div>
              )}

              {isTruthyFlag(order.section_contact_form) && (
                <div className="rounded-2xl border border-purple-300/25 bg-black/60 px-5 py-4">
                  <h2 className="text-lg font-semibold text-zinc-50">Sekcia: Kontaktný formulár</h2>
                  <pre className="mt-3 whitespace-pre-wrap break-words text-xs text-zinc-300">
                    {JSON.stringify(sections.contactForm, null, 2)}
                  </pre>
                </div>
              )}

              {sections.footer && (
                <div className="rounded-2xl border border-purple-300/25 bg-black/60 px-5 py-4">
                  <h2 className="text-lg font-semibold text-zinc-50">Sekcia: Footer</h2>
                  <pre className="mt-3 whitespace-pre-wrap break-words text-xs text-zinc-300">
                    {JSON.stringify(sections.footer, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </section>
  );
}
