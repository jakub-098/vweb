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
  status?: number | null;
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
  const [isCompany, setIsCompany] = useState(false);
  const [companyName, setCompanyName] = useState("");
  const [companyAddress, setCompanyAddress] = useState("");
  const [ico, setIco] = useState("");
  const [dic, setDic] = useState("");
  const [companyError, setCompanyError] = useState<string | null>(null);
  const [thankYouOpen, setThankYouOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

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
            <div className="mt-6 rounded-2xl border border-purple-300/25 bg-black/60 px-6 py-4 text-sm text-zinc-200">
              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  className="h-4 w-4 accent-purple-500"
                  checked={isCompany}
                  onChange={(e) => setIsCompany(e.target.checked)}
                />
                <span className="text-sm">Som firma</span>
              </label>

              {isCompany && (
                <div className="mt-3 space-y-3 text-xs text-zinc-200">
                  <div>
                    <label className="block text-[0.75rem] text-zinc-400">Názov firmy</label>
                    <input value={companyName} onChange={(e) => setCompanyName(e.target.value)} className="mt-1 w-full rounded-md border border-white/20 bg-black/60 px-3 py-1.5 text-sm text-zinc-100" />
                  </div>
                  <div>
                    <label className="block text-[0.75rem] text-zinc-400">Sídlo</label>
                    <input value={companyAddress} onChange={(e) => setCompanyAddress(e.target.value)} className="mt-1 w-full rounded-md border border-white/20 bg-black/60 px-3 py-1.5 text-sm text-zinc-100" />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[0.75rem] text-zinc-400">IČO</label>
                      <input value={ico} onChange={(e) => setIco(e.target.value.replace(/\D/g, ""))} maxLength={8} className="mt-1 w-full rounded-md border border-white/20 bg-black/60 px-3 py-1.5 text-sm text-zinc-100" placeholder="8 číslic" />
                    </div>
                    <div>
                      <label className="block text-[0.75rem] text-zinc-400">DIČ</label>
                      <input value={dic} onChange={(e) => setDic(e.target.value.replace(/\D/g, ""))} maxLength={10} className="mt-1 w-full rounded-md border border-white/20 bg-black/60 px-3 py-1.5 text-sm text-zinc-100" placeholder="10 číslic" />
                    </div>
                  </div>
                  {companyError && <p className="text-xs text-red-300">{companyError}</p>}
                </div>
              )}
            </div>
            <div className="mt-10 mb-10">
              <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl md:text-4xl">
                  Čo bude ďalej?
              </h1>
              <p className="mt-3 max-w-2xl text-sm text-zinc-300 sm:text-base">
                  Po obdržaní platby vám zašleme na e-mail vstup do nášho formulára, ktorý vyplníte detailmi. Tieto údaje následne použijeme na vytvorenie vašej webovej stránky.
Po odoslaní formulára sa okamžite pustíme do práce a stránku vám doručíme v zvolenom termíne (24 alebo 48 hodín). Po doručení máte možnosť požiadať o úpravy, aby sme zabezpečili, že budete s výsledkom maximálne spokojní.
              </p>
            </div>
              
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
                  všeobecnými obchodnými podmienkami vweb.sk
                </a>
              </label>
            </div>

            <p className="mt-2 text-xs text-zinc-400 sm:text-[0.8rem]">
              Čas dodania začína po odoslaní vyplneného Formulára, ktorý po uhradení sumy obdržíte na email.
            </p>

            <div className="mt-5 flex flex-wrap items-center justify-end gap-3">
              <div className="flex items-center gap-2">
                <img
                  src="/ApplePay.png"
                  alt="Apple Pay"
                  className="h-8 w-auto opacity-80"
                />
                <img
                  src="/GooglePay.png"
                  alt="Google Pay"
                  className="h-8 w-auto rounded-md bg-white px-2 py-0.5"
                />
              </div>

              <button
                type="button"
                disabled={!termsAccepted || submitting}
                onClick={async () => {
                  if (!termsAccepted || !order || submitting) return;
                  setSubmitting(true);

                  // track final purchase click
                  try {
                    await fetch("/api/analytics/increment", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ id: 3 }),
                    });
                  } catch (err) {
                    console.error("Failed to track purchase", err);
                  }

                  // validate company fields if enabled
                  if (isCompany) {
                    if (ico.length !== 8) {
                      setCompanyError("IČO musí mať presne 8 číslic.");
                      setSubmitting(false);
                      return;
                    }
                    if (dic.length !== 10) {
                      setCompanyError("DIČ musí mať presne 10 číslic.");
                      setSubmitting(false);
                      return;
                    }
                    setCompanyError(null);

                    try {
                      await fetch("/api/orders/company", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                          orderId: order.id,
                          is_company: true,
                          company_name: companyName || null,
                          company_address: companyAddress || null,
                          ico: ico || null,
                          dic: dic || null,
                        }),
                      });
                    } catch (err) {
                      console.error("Failed to save company info", err);
                    }
                  } else {
                    // if unchecked, clear any existing company info on order
                    try {
                      await fetch("/api/orders/company", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ orderId: order.id, is_company: false }),
                      });
                    } catch (err) {
                      console.error("Failed to clear company info", err);
                    }
                  }

                  try {
                    await fetch("/api/orders/status", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ orderId: order.id, status: 0 }),
                    });
                  } catch (err) {
                    console.error("Failed to update status to submitted", err);
                  }

                  // po odoslaní objednávky zobrazíme ďakovné okno
                  setThankYouOpen(true);
                  setSubmitting(false);
                }}
                className="inline-flex items-center rounded-full bg-purple-500/90 px-6 py-2 text-sm font-semibold text-white shadow-[0_0_25px_rgba(168,85,247,0.6)] transition hover:bg-purple-400 disabled:cursor-not-allowed disabled:bg-purple-500/50"
              >
                {submitting ? "Odosielam..." : "Dokončiť a zaplatiť"}
              </button>
            </div>
          </>
        )}
      </div>

    {thankYouOpen && (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
        <div className="w-full max-w-md rounded-2xl border border-purple-300/40 bg-black/90 px-6 py-7 text-sm text-zinc-100 shadow-[0_20px_60px_rgba(0,0,0,0.95)]">
          <h2 className="text-lg font-semibold tracking-tight sm:text-xl">
            Ďakujeme za vašu objednávku
          </h2>
          <p className="mt-3 text-xs text-zinc-300 sm:text-sm">
            Vašu objednávku sme prijali a informácie k úhrade sme
            odoslali na váš e-mail. Skontrolujte si prosím schránku,
            prípadne aj priečinok nevyžiadanej pošty.
          </p>
          <div className="mt-5 flex justify-end gap-2 text-xs sm:text-sm">
            <button
              type="button"
              onClick={() => {
                setThankYouOpen(false);
                router.push("/");
              }}
              className="rounded-full bg-purple-500/90 px-5 py-2 text-[0.75rem] font-semibold text-white shadow-[0_0_20px_rgba(168,85,247,0.5)] transition hover:bg-purple-400"
            >
              OK
            </button>
          </div>
        </div>
      </div>
    )}

  </section>
  );
}
