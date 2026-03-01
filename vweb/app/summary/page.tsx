"use client";

import { useEffect, useState, type ReactElement } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}

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

type ConfigSummary = {
  theme: "tmava" | "svetla";
  accentColor: string;
  accentCustom?: string | null;
  mailOption: "potrebujem" | "mam";
  sectionAbout: boolean;
  sectionCards: boolean;
  sectionFaq: boolean;
  sectionGallery: boolean;
  sectionOffer: boolean;
  sectionContactForm: boolean;
  customFont?: string | null;
  domainOption: "own" | "request";
  domainOwn: string;
  domainRequest: string;
  totalPrice: number;
  deliverySpeed: "24h" | "48h";
  packageName?: string;
  priceId?: string | null;
  discountPriceId?: string | null;
};

function isTruthyFlag(value: number | boolean | undefined | null): boolean {
  if (value == null) return false;
  if (typeof value === "boolean") return value;
  return value !== 0;
}

type SummaryProps = {
  onEditConfig?: () => void;
  liveConfigSummary?: ConfigSummary | null;
  priceBreakdown?: string[];
};

function gtagSendEvent(url?: string): boolean {
  if (typeof window === "undefined") return false;

  const callback = () => {
    if (typeof url === "string") {
      window.location.href = url;
    }
  };

  const gtag = window.gtag;
  if (typeof gtag !== "function") {
    callback();
    return false;
  }

  try {
    gtag("event", "purchase", {
      event_callback: callback,
      event_timeout: 2000,
      // <event_parameters>
    });
  } catch {
    callback();
  }

  return false;
}

export default function SummaryPage({ liveConfigSummary, priceBreakdown }: SummaryProps = {}) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [paymentStartError, setPaymentStartError] = useState<string | null>(null);
  const [order, setOrder] = useState<Order | null>(null);
  const [mode, setMode] = useState<"local" | "order" | null>(null);
  const [configSummary, setConfigSummary] = useState<ConfigSummary | null>(null);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [isCompany, setIsCompany] = useState(false);
  const [companyName, setCompanyName] = useState("");
  const [companyAddress, setCompanyAddress] = useState("");
  const [ico, setIco] = useState("");
  const [dic, setDic] = useState("");
  const [companyError, setCompanyError] = useState<string | null>(null);
  const [thankYouOpen, setThankYouOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [userEmail, setUserEmail] = useState("");
  const [emailError, setEmailError] = useState<string | null>(null);
  const [note] = useState("");
  const [domainRequest, setDomainRequest] = useState("");
  const [domainChecking, setDomainChecking] = useState(false);
  const [domainAvailable, setDomainAvailable] = useState<boolean | null>(null);
  const [domainCheckMessage, setDomainCheckMessage] = useState<string | null>(
    null,
  );
  const [promoCode, setPromoCode] = useState("");
  const [promoChecking, setPromoChecking] = useState(false);
  const [promoMessage, setPromoMessage] = useState<string | null>(null);
  const [promoOk, setPromoOk] = useState<boolean | null>(null);
  const [promoDiscountPercent, setPromoDiscountPercent] = useState<number | null>(null);

  // Google Ads: conversion event on Summary page load
  useEffect(() => {
    if (typeof window === "undefined") return;

    let sent = false;
    const trySend = () => {
      if (sent) return;
      const gtag = window.gtag;
      if (typeof gtag !== "function") return;

      sent = true;
      try {
        gtag("config", "AW-17955579995");
        gtag("event", "add_to_cart");
        gtag("event", "conversion", {
          send_to: "AW-17955579995/hLVHCM6CsP8bENvQ8fFC",
        });
      } catch {
        // ignore
      }
    };

    trySend();

    const intervalId = window.setInterval(trySend, 250);
    const timeoutId = window.setTimeout(() => {
      window.clearInterval(intervalId);
    }, 2000);

    return () => {
      window.clearInterval(intervalId);
      window.clearTimeout(timeoutId);
    };
  }, []);

  // Analytics: summary page visited
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      if (window.sessionStorage.getItem("vwebSummaryTracked") === "1") return;
      window.sessionStorage.setItem("vwebSummaryTracked", "1");
    } catch {
      // ignore
    }

    (async () => {
      try {
        await fetch("/api/analytics/increment", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: 1 }),
        });
      } catch (err) {
        console.error("Failed to track summary visit", err);
      }
    })();
  }, []);

  useEffect(() => {
    // Inline live mode from configurator
    if (liveConfigSummary) {
      setConfigSummary(liveConfigSummary);
      setMode("local");
      setLoading(false);
      return;
    }

    async function init() {
      try {
        if (typeof window !== "undefined") {
          try {
            const raw = window.localStorage.getItem("vwebConfigSummary");
            if (raw) {
              const parsed = JSON.parse(raw) as ConfigSummary;
              setConfigSummary(parsed);
              setMode("local");
              setLoading(false);
              return;
            }
          } catch (err) {
            console.error("Failed to read local config summary", err);
          }
        }

        // fallback – načítanie existujúcej objednávky podľa e-mailu (pôvodné správanie)
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
        setMode("order");
        setLoading(false);
      } catch (err) {
        console.error("Failed to load data for summary page", err);
        setError("Pri načítaní konfigurácie nastala chyba. Skús to neskôr.");
        setLoading(false);
      }
    }

    if (!liveConfigSummary) {
      init();
    }
  }, [liveConfigSummary, router]);

  async function checkDomainAvailability(): Promise<boolean> {
    const raw = domainRequest.trim();
    if (!raw) {
      setDomainAvailable(null);
      setDomainCheckMessage("Zadaj doménu, ktorú chceš skontrolovať.");
      return false;
    }

    const normalized = raw
      .replace(/^https?:\/\//, "")
      .replace(/^www\./, "");
    const domainRegex = /^[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!domainRegex.test(normalized)) {
      setDomainAvailable(null);
      setDomainCheckMessage("Zadaj platný tvar domény (napr. vasweb.sk).");
      return false;
    }

    try {
      setDomainChecking(true);
      const res = await fetch("/api/domain-check", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ domain: normalized }),
      });
      if (!res.ok) {
        setDomainAvailable(null);
        setDomainCheckMessage(
          "Nepodarilo sa overiť doménu. Skús to neskôr.",
        );
        return false;
      }
      const data = await res.json();
      if (data && typeof data.available === "boolean") {
        setDomainAvailable(data.available);
        setDomainCheckMessage(
          data.available
            ? "Doména je voľná – super!"
            : "Doména je obsadená – vyber prosím inú.",
        );
        return data.available === true;
      } else {
        setDomainAvailable(null);
        setDomainCheckMessage(
          "Nepodarilo sa overiť doménu. Skús to neskôr.",
        );
        return false;
      }
    } catch (error) {
      console.error("Domain check failed", error);
      setDomainAvailable(null);
      setDomainCheckMessage(
        "Nepodarilo sa overiť doménu. Skús to neskôr.",
      );
    } finally {
      setDomainChecking(false);
    }
    return false;
  }

  async function applyPromoCode() {
    const raw = promoCode.trim();
    if (!raw) {
      setPromoOk(null);
      setPromoMessage("Zadaj promo kód.");
      return;
    }

    try {
      setPromoChecking(true);
      const res = await fetch("/api/promo/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: raw }),
      });

      const data = await res.json().catch(() => null);

      if (!res.ok || !data || !data.success || !data.found) {
        setPromoOk(false);
        setPromoDiscountPercent(null);
        setPromoMessage("Tento promo kód neexistuje alebo už nie je platný.");
        return;
      }

      const percentage = Number(data.percentage);
      if (!Number.isFinite(percentage) || percentage <= 0) {
        setPromoOk(false);
        setPromoDiscountPercent(null);
        setPromoMessage("Tento promo kód nie je možné použiť.");
        return;
      }

      setPromoOk(true);
      setPromoDiscountPercent(percentage);
      setPromoMessage(`Promo kód bol uplatnený – zľava ${percentage}% z ceny projektu.`);
    } catch (err) {
      console.error("Failed to validate promo code", err);
      setPromoOk(false);
      setPromoDiscountPercent(null);
      setPromoMessage("Nepodarilo sa overiť promo kód. Skús to neskôr.");
    } finally {
      setPromoChecking(false);
    }
  }

  const selectedSections: { key: string; label: string }[] = [];
  if (mode === "local" && configSummary) {
    if (configSummary.sectionAbout) selectedSections.push({ key: "section_about", label: "O projekte" });
    if (configSummary.sectionCards) selectedSections.push({ key: "section_cards", label: "Karty / výhody" });
    if (configSummary.sectionOffer) selectedSections.push({ key: "section_offer", label: "Ponuka / služby" });
    if (configSummary.sectionGallery) selectedSections.push({ key: "section_gallery", label: "Galéria" });
    if (configSummary.sectionFaq) selectedSections.push({ key: "section_faq", label: "FAQ" });
    if (configSummary.sectionContactForm) selectedSections.push({ key: "section_contact_form", label: "Kontaktný formulár" });
  } else if (order) {
    if (isTruthyFlag(order.section_about)) selectedSections.push({ key: "section_about", label: "O projekte" });
    if (isTruthyFlag(order.section_cards)) selectedSections.push({ key: "section_cards", label: "Karty / výhody" });
    if (isTruthyFlag(order.section_offer)) selectedSections.push({ key: "section_offer", label: "Ponuka / služby" });
    if (isTruthyFlag(order.section_gallery)) selectedSections.push({ key: "section_gallery", label: "Galéria" });
    if (isTruthyFlag(order.section_faq)) selectedSections.push({ key: "section_faq", label: "FAQ" });
    if (isTruthyFlag(order.section_contact_form)) selectedSections.push({ key: "section_contact_form", label: "Kontaktný formulár" });
  }

  const deliveryLabel = (() => {
    if (mode === "local" && configSummary) {
      return configSummary.deliverySpeed === "24h" ? "24 h (expres)" : "48 h";
    }
    if (!order || !order.delivery_speed) return "48 h";
    return order.delivery_speed === "24h" ? "24 h (expres)" : "48 h";
  })();

  const totalPriceValue = (() => {
    if (mode === "local" && configSummary) {
      const num = Number(configSummary.totalPrice);
      if (Number.isNaN(num)) return null;
      return num;
    }
    if (!order || order.total_price == null) return null;
    const num = Number(order.total_price);
    if (Number.isNaN(num)) return null;
    return num;
  })();

  const finalPriceValue = (() => {
    if (totalPriceValue == null) return null;
    if (promoDiscountPercent == null || !Number.isFinite(promoDiscountPercent)) {
      return totalPriceValue;
    }
    const discountFactor = 1 - promoDiscountPercent / 100;
    const discounted = totalPriceValue * discountFactor;
    if (!Number.isFinite(discounted) || discounted < 0) return totalPriceValue;
    return discounted;
  })();

  const hasSummaryContent =
    !loading &&
    !error &&
    (order || (mode === "local" && configSummary));

  let summaryContent: ReactElement | null = null;
  if (hasSummaryContent) {
    summaryContent = (
      <div className="mt-14 grid gap-10 lg:grid-cols-3">
        {/* LEFT SIDE */}
        <div className="space-y-7 lg:col-span-2">
          {/* Domain check */}
          <div className="rounded-2xl bg-white/5 px-6 py-6 text-sm text-zinc-200 shadow-[0_24px_80px_rgba(0,0,0,0.95)] backdrop-blur-xl">
            <p className="text-[0.75rem] font-semibold uppercase tracking-[0.3em] text-purple-200">
              Overenie domény
            </p>
            <p className="mt-2 text-xs text-zinc-300 sm:text-sm">
              Overte si, či je vaša doména voľná ešte pred odoslaním objednávky.
            </p>
            <div className="mt-4 space-y-2">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                <div className="flex flex-1 items-center gap-2">
                  <span className="rounded-2xl border border-white/15 bg-black/50 px-3 py-2 text-xs text-zinc-400">
                    www.
                  </span>
                  <input
                    type="text"
                    placeholder="napr. vasweb.sk"
                    className=" w-full rounded-2xl border border-white/20 bg-black/50 px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-500 focus:border-purple-400 focus:outline-none"
                    value={domainRequest}
                    onChange={(e) => {
                      setDomainRequest(e.target.value);
                      setDomainAvailable(null);
                      setDomainCheckMessage(null);
                    }}
                  />
                </div>
                <button
                  type="button"
                  onClick={checkDomainAvailability}
                  disabled={domainChecking}
                  className="w-full whitespace-nowrap rounded-2xl bg-purple-500 px-4 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-purple-400 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
                >
                  {domainChecking ? "Kontrolujem..." : "Skontrolovať"}
                </button>
              </div>
              {domainCheckMessage && (
                <p
                  className={`rounded-md border px-3 py-2 text-xs ${
                    domainAvailable === true
                      ? "border-emerald-500/60 bg-emerald-500/10 text-emerald-200"
                      : "border-red-500/60 bg-red-500/10 text-red-200"
                  }`}
                >
                  {domainCheckMessage}
                </p>
              )}
            </div>
          </div>

          {/* Company toggle & fields */}
          <div className="rounded-2xl bg-white/5 px-6 py-5 text-sm text-zinc-200 backdrop-blur-xl">
            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                className="h-4 w-4 rounded border-white/30 bg-black/50 text-purple-500 focus:ring-purple-500"
                checked={isCompany}
                onChange={(e) => setIsCompany(e.target.checked)}
              />
              <span className="text-sm text-zinc-200">Som firma (vyplniť fakturačné údaje)</span>
            </label>

            {isCompany && (
              <div className="mt-4 grid gap-4 text-xs text-zinc-200 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <label className="block text-[0.75rem] text-zinc-400">Názov firmy</label>
                  <input
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    className="mt-1 w-full rounded-2xl border border-white/20 bg-black/50 px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-500 focus:border-purple-400 focus:outline-none"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-[0.75rem] text-zinc-400">Sídlo</label>
                  <input
                    value={companyAddress}
                    onChange={(e) => setCompanyAddress(e.target.value)}
                    className="mt-1 w-full rounded-2xl border border-white/20 bg-black/50 px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-500 focus:border-purple-400 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[0.75rem] text-zinc-400">IČO</label>
                  <input
                    value={ico}
                    onChange={(e) => setIco(e.target.value.replace(/\D/g, ""))}
                    maxLength={8}
                    className="mt-1 w-full rounded-2xl border border-white/20 bg-black/50 px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-500 focus:border-purple-400 focus:outline-none"
                    placeholder="8 číslic"
                  />
                </div>
                <div>
                  <label className="block text-[0.75rem] text-zinc-400">DIČ</label>
                  <input
                    value={dic}
                    onChange={(e) => setDic(e.target.value.replace(/\D/g, ""))}
                    maxLength={10}
                    className="mt-1 w-full rounded-2xl border border-white/20 bg-black/50 px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-500 focus:border-purple-400 focus:outline-none"
                    placeholder="10 číslic"
                  />
                </div>
                {companyError && (
                  <p className="sm:col-span-2 text-xs text-red-300">
                    {companyError}
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Email, note & promo – only for local mode */}
          {mode === "local" && (
            <>
              <div className="rounded-2xl bg-white/5 px-6 py-5 text-xs text-zinc-200 backdrop-blur-xl sm:text-sm">
                <label className="block text-[0.75rem] text-zinc-400">
                  Váš e-mail
                </label>
                <input
                  type="email"
                  className="mt-2 w-full rounded-2xl border border-white/20 bg-black/50 px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-500 focus:border-purple-400 focus:outline-none"
                  placeholder="tvojmail@gmail.com"
                  value={userEmail}
                  onChange={(e) => setUserEmail(e.target.value)}
                />
                {emailError && (
                  <p className="mt-1 text-xs text-red-300">{emailError}</p>
                )}

                
              </div>

              <div className="rounded-2xl bg-white/5 px-6 py-5 text-xs text-zinc-200 backdrop-blur-xl sm:text-sm">
                <p className="text-[0.75rem] font-semibold uppercase tracking-[0.3em] text-purple-200">
                  Promo kód
                </p>
                <p className="mt-2 text-xs text-zinc-300 sm:text-sm">
                  Máš zľavový kód? Zadaj ho sem a my automaticky znížime cenu projektu.
                </p>
                <div className="mt-4 space-y-2">
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                    <input
                      type="text"
                      className="flex-1 rounded-2xl border border-white/15 bg-black/50 px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-500 backdrop-blur-xl focus:border-purple-400 focus:outline-none"
                      placeholder="NAPR. START10"
                      value={promoCode}
                      onChange={(e) => {
                        setPromoCode(e.target.value);
                        setPromoOk(null);
                        setPromoMessage(null);
                      }}
                    />
                    <button
                      type="button"
                      onClick={applyPromoCode}
                      disabled={promoChecking || totalPriceValue == null}
                      className="w-full whitespace-nowrap rounded-2xl bg-purple-500 px-4 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-purple-400 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
                    >
                      {promoChecking ? "Overujem..." : "Použiť kód"}
                    </button>
                  </div>
                  {promoMessage && (
                    <p
                      className={`rounded-md border px-3 py-2 text-xs ${
                        promoOk
                          ? "border-emerald-500/60 bg-emerald-500/10 text-emerald-200"
                          : "border-red-500/60 bg-red-500/10 text-red-200"
                      }`}
                    >
                      {promoMessage}
                    </p>
                  )}
                </div>
              </div>
            </>
          )}

          {/* What happens next */}
          <div className="mt-2 rounded-2xl bg-white/5 px-6 py-5 text-sm text-zinc-200 backdrop-blur-xl">
            <h2 className="text-base font-semibold tracking-tight sm:text-lg">
              Čo bude ďalej?
            </h2>
            <p className="mt-3 text-xs text-zinc-300 sm:text-sm">
              Po obdržaní platby Vám na e-mail pošleme vstup do nášho formulára, ktorý vyplníte potrebnými detailmi. Tieto údaje následne použijeme na vytvorenie Vašej webovej stránky. Po odoslaní formulára sa okamžite pustíme do práce a stránku Vám doručíme v zvolenom termíne (24 alebo 48 hodín). Po doručení máte možnosť požiadať o úpravy, aby sme zabezpečili, že budete s výsledkom maximálne spokojný.
            </p>
          </div>
        </div>

        {/* RIGHT SIDE – price card */}
        <div className="h-fit rounded-3xl bg-white/10 p-6 text-sm text-zinc-100 shadow-[0_0_60px_rgba(168,85,247,0.3)] backdrop-blur-2xl sm:p-8">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-purple-200">
            {mode === "local" && configSummary?.packageName
              ? `Balík ${configSummary.packageName}`
              : "Cena projektu"}
          </p>
          <p className="mt-4 text-3xl font-bold tracking-tight text-zinc-50 sm:text-4xl">
            {finalPriceValue != null ? finalPriceValue.toFixed(2) : "-"} €
          </p>
          {promoDiscountPercent != null && totalPriceValue != null && finalPriceValue != null && finalPriceValue !== totalPriceValue && (
            <p className="mt-1 text-xs text-emerald-300">
              Pôvodná cena: <span className="line-through opacity-70">{totalPriceValue.toFixed(2)} €</span>, zľava {promoDiscountPercent}%.
            </p>
          )}
          <div className="mt-4 text-[0.8rem] text-zinc-300">
            <p>Dodanie: {deliveryLabel}</p>
            {Array.isArray(priceBreakdown) && priceBreakdown.length > 0 && (
              <div className="mt-2 space-y-0.5 text-[0.8rem] text-zinc-300">
                {priceBreakdown.map((line, idx) => (
                  <p key={idx}>{line}</p>
                ))}
              </div>
            )}
          </div>

          <div className="mt-6 flex items-start gap-2 text-xs text-zinc-300 sm:text-sm">
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
            Čas dodania začína po odoslaní vyplneného Formulára, ktorý po uhradení sumy obdržíte na váš e-mail.
          </p>

          <div className="mt-6 flex flex-col gap-3">
            <div className="flex items-center justify-center gap-2">
              <Image
                src="/stripe_white.png"
                alt="Platby spracúva Stripe"
                width={92}
                height={32}
                className="h-8 w-auto opacity-90"
                priority={false}
              />
              <Image
                src="/ApplePay.png"
                alt="Apple Pay"
                width={64}
                height={32}
                className="h-8 w-auto opacity-80"
                priority={false}
              />
              <Image
                src="/GooglePay.png"
                alt="Google Pay"
                width={80}
                height={32}
                className="h-8 w-auto rounded-md bg-white px-2 py-0.5"
                priority={false}
              />
            </div>

            <button
              type="button"
              disabled={!termsAccepted || submitting}
              onClick={async () => {
                if (!termsAccepted || submitting) return;

                setPaymentStartError(null);

                // domain must be filled and available; re-check on submit
                const domainOk = await checkDomainAvailability();
                if (!domainOk) {
                  return;
                }

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

                const basePriceId =
                  mode === "local" &&
                  configSummary &&
                  typeof configSummary.priceId === "string" &&
                  configSummary.priceId.trim().length > 0
                    ? configSummary.priceId.trim()
                    : null;

                const discountPriceId =
                  mode === "local" &&
                  configSummary &&
                  typeof configSummary.discountPriceId === "string" &&
                  configSummary.discountPriceId.trim().length > 0
                    ? configSummary.discountPriceId.trim()
                    : null;

                const useDiscountPrice = promoOk === true && discountPriceId != null;
                const priceIdForCheckout = useDiscountPrice ? discountPriceId : basePriceId;

                // Stripe flow: do NOT create an order or send any emails before payment.
                // We only create a Checkout Session and let the Stripe webhook create the order after payment succeeds.
                if (priceIdForCheckout && mode === "local") {
                  if (!configSummary) {
                    setSubmitting(false);
                    return;
                  }

                  const trimmedEmail = userEmail.trim();
                  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                  if (!trimmedEmail) {
                    setEmailError("Prosím zadajte svoj e-mail.");
                    setSubmitting(false);
                    return;
                  }
                  if (!emailPattern.test(trimmedEmail)) {
                    setEmailError("Zadajte prosím platnú e-mailovú adresu.");
                    setSubmitting(false);
                    return;
                  }
                  setEmailError(null);

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
                  } else {
                    setCompanyError(null);
                  }

                  const normalizedDomain = domainRequest
                    .trim()
                    .replace(/^https?:\/\//, "")
                    .replace(/^www\./, "");

                  try {
                    const res = await fetch("/api/checkout_sessions", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({
                        priceId: priceIdForCheckout,
                        customerEmail: trimmedEmail,
                        // If we're switching to a pre-discounted Stripe Price, don't apply an additional coupon.
                        promoPercent: useDiscountPrice ? undefined : promoDiscountPercent ?? undefined,
                        packageName: configSummary.packageName ?? undefined,
                        orderDraft: {
                          // mirror what the old pre-stripe flow used to store
                          theme: configSummary.theme,
                          accentColor: configSummary.accentColor,
                          accentCustom: configSummary.accentCustom ?? null,
                          customFont: configSummary.customFont ?? null,

                          userEmail: trimmedEmail,
                          totalPrice: finalPriceValue ?? configSummary.totalPrice,
                          deliverySpeed: configSummary.deliverySpeed,

                          hostingOption: "potrebujem",
                          mailOption: configSummary.mailOption,

                          domainOption: "request",
                          domainOwn: "",
                          domainRequest: normalizedDomain,

                          sectionAbout: true,
                          sectionCards: true,
                          sectionFaq: true,
                          sectionGallery: true,
                          sectionOffer: true,
                          sectionContactForm: true,

                          is_company: isCompany,
                          company_name: isCompany ? companyName || null : null,
                          company_address: isCompany ? companyAddress || null : null,
                          ico: isCompany ? ico || null : null,
                          dic: isCompany ? dic || null : null,
                        },
                      }),
                    });

                    const data = (await res.json().catch(() => null)) as
                      | { url?: string; error?: string }
                      | null;

                    if (!res.ok || !data?.url) {
                      throw new Error(data?.error ?? "Failed to create checkout session");
                    }

                    // Google tag (gtag.js) event - delayed navigation helper
                    gtagSendEvent(data.url);
                    return;
                  } catch (err) {
                    console.error("Failed to start Stripe checkout", err);
                    setPaymentStartError(
                      "Nepodarilo sa spustiť platbu kartou. Skús to prosím neskôr.",
                    );
                    setSubmitting(false);
                    return;
                  }
                }

                let finalOrderId: number | null = null;

                if (mode === "local") {
                  if (!configSummary) {
                    setSubmitting(false);
                    return;
                  }

                  const trimmedEmail = userEmail.trim();
                  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                  if (!trimmedEmail) {
                    setEmailError("Prosím zadajte svoj e-mail.");
                    setSubmitting(false);
                    return;
                  }
                  if (!emailPattern.test(trimmedEmail)) {
                    setEmailError("Zadajte prosím platnú e-mailovú adresu.");
                    setSubmitting(false);
                    return;
                  }
                  setEmailError(null);

                  try {
                    const normalizedDomain = domainRequest
                      .trim()
                      .replace(/^https?:\/\//, "")
                      .replace(/^www\./, "");

                    const res = await fetch("/api/orders", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({
                        // only send values that are actually present on the summary page
                        userEmail: trimmedEmail,
                        totalPrice: finalPriceValue ?? configSummary.totalPrice,
                        deliverySpeed: configSummary.deliverySpeed,
                        hostingOption: "potrebujem",
                        domainOption: "request",
                        domainOwn: "",
                        domainRequest: normalizedDomain,
                        note: note || null,
                        sectionAbout: true,
                        sectionCards: true,
                        sectionFaq: true,
                        sectionGallery: true,
                        sectionOffer: true,
                        sectionContactForm: true,
                      }),
                    });

                    if (!res.ok) {
                      throw new Error("Failed to create order");
                    }

                    const data = await res.json();
                    finalOrderId = typeof data.orderId === "number" ? data.orderId : null;

                    if (typeof window !== "undefined") {
                      try {
                        window.localStorage.setItem("vwebOrderEmail", trimmedEmail);
                        window.localStorage.removeItem("vwebConfigSummary");
                      } catch {}
                    }
                  } catch (err) {
                    console.error("Failed to create order from summary", err);
                    setSubmitting(false);
                    return;
                  }
                } else {
                  if (!order) {
                    setSubmitting(false);
                    return;
                  }
                  finalOrderId = order.id;
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
                        orderId: finalOrderId,
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
                } else if (finalOrderId != null) {
                  // if unchecked, clear any existing company info on order
                  try {
                    await fetch("/api/orders/company", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ orderId: finalOrderId, is_company: false }),
                    });
                  } catch (err) {
                    console.error("Failed to clear company info", err);
                  }
                }

                if (finalOrderId != null) {
                  try {
                    await fetch("/api/orders/status", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ orderId: finalOrderId, status: 0 }),
                    });
                  } catch (err) {
                    console.error("Failed to update status to submitted", err);
                  }
                }

                // fallback – keep the original flow if we don't have a Stripe price id
                setThankYouOpen(true);
                setSubmitting(false);
              }}
              className="inline-flex w-full items-center justify-center rounded-full bg-purple-500 px-4 py-3 text-sm font-semibold text-white transition hover:bg-purple-400 disabled:cursor-not-allowed disabled:bg-purple-500/50"
            >
              {submitting ? "Odosielam..." : "Dokončiť a zaplatiť"}
            </button>
          </div>

          {paymentStartError && (
            <p className="mt-3 text-xs text-red-300">
              {paymentStartError}
            </p>
          )}
        </div>
      </div>
    );
  }

  return (
    <section className="min-h-screen w-full bg-gradient-to-b from-black via-zinc-950 to-black px-4 py-16 text-zinc-50 sm:px-8">
      <div className="mx-auto w-full max-w-6xl px-2 sm:px-4">
        <div className="text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.35em] text-purple-400">
            Objednávka
          </p>
          <h1 className="mt-4 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
            Zhrnutie Objednávky
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-sm text-zinc-300 sm:text-base">
            Vyplňte e-mail, overte doménu a potvrďte objednávku svojho nového webu.
          </p>
        </div>

        {loading && (
          <p className="mt-10 text-center text-sm text-zinc-300">
            Načítavam tvoju konfiguráciu...
          </p>
        )}
        {!loading && error && (
          <p className="mt-10 text-center text-sm text-red-300">
            {error}
          </p>
        )}

        {summaryContent}

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
      </div>

    </section>
  );
}
