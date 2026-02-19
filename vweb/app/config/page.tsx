"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import SummaryPage from "../summary/page";

export default function ConfigPage() {
  const router = useRouter();
  const containerRef = useRef<HTMLDivElement | null>(null);
  const secondBlockRef = useRef<HTMLDivElement | null>(null);

  const [step, setStep] = useState<1 | 2>(1);

  const [theme, setTheme] = useState<"tmava" | "svetla">("svetla");
  const [accent, setAccent] = useState<
    | "purple"
    | "blue"
    | "green"
    | "orange"
    | "pink"
    | "red"
    | "yellow"
    | "teal"
    | "gray"
  >("purple");
  const [accentCustom, setAccentCustom] = useState("");

  const [mail, setMail] = useState<"potrebujem" | "mam">("potrebujem");
  const [sectionAbout, setSectionAbout] = useState(false);
  const [sectionCards, setSectionCards] = useState(false);
  const [sectionFaq, setSectionFaq] = useState(false);
  const [sectionGallery, setSectionGallery] = useState(false);
  const [sectionOffer, setSectionOffer] = useState(false);
  const [sectionContactForm, setSectionContactForm] = useState(false);

  const [domainOption, setDomainOption] = useState<"own" | "request" | "">(
    "request",
  );
  const [domainOwn, setDomainOwn] = useState("");
  const [domainRequest, setDomainRequest] = useState("");
  const [domainChecking, setDomainChecking] = useState(false);
  const [domainAvailable, setDomainAvailable] = useState<boolean | null>(null);
  const [domainCheckMessage, setDomainCheckMessage] = useState<string | null>(
    null,
  );

  const [fastDelivery, setFastDelivery] = useState<"yes" | "no">("no");

  const [submitting, setSubmitting] = useState(false);
  const [missingFieldsError, setMissingFieldsError] = useState<string | null>(
    null,
  );

  const [existingDialogOpen, setExistingDialogOpen] = useState(false);
  const [existingConfigEmail, setExistingConfigEmail] = useState("");
  const [existingConfigEmailError, setExistingConfigEmailError] = useState<
    string | null
  >(null);
  const [existingConfigChecking, setExistingConfigChecking] = useState(false);

  const [inlineSummaryVisible, setInlineSummaryVisible] = useState(false);
  const [prices, setPrices] = useState<Record<string, number>>({});

  // Analytics: konfigurátor navštívený
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      if (window.sessionStorage.getItem("vwebConfigTracked") === "1") return;
      window.sessionStorage.setItem("vwebConfigTracked", "1");
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
        console.error("Failed to track config visit", err);
      }
    })();
  }, []);

  // Načítaj ceny z databázy (cez /api/prices)
  useEffect(() => {
    async function loadPrices() {
      try {
        const res = await fetch("/api/prices");
        if (!res.ok) return;
        const data = await res.json();
        if (Array.isArray(data.prices)) {
          const map: Record<string, number> = {};
          for (const p of data.prices) {
            if (typeof p.code === "string" && p.amount != null) {
              const numeric = Number(p.amount);
              if (!Number.isNaN(numeric)) {
                map[p.code] = numeric;
              }
            }
          }
          setPrices(map);
        }
      } catch (error) {
        console.error("Failed to load prices", error);
      }
    }

    loadPrices();
  }, []);

  // Keď sa otvorí dialóg "Mám už konfiguráciu", posuň kartu do stredu
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!existingDialogOpen) return;

    if (containerRef.current) {
      containerRef.current.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    } else {
      const middle = Math.max(
        0,
        (document.documentElement.scrollHeight - window.innerHeight) / 2,
      );
      window.scrollTo({ top: middle, behavior: "smooth" });
    }
  }, [existingDialogOpen]);

  function validateRequiredFields(): boolean {
    const missing: string[] = [];

    const sectionsCount =
      (sectionAbout ? 1 : 0) +
      (sectionCards ? 1 : 0) +
      (sectionFaq ? 1 : 0) +
      (sectionGallery ? 1 : 0) +
      (sectionOffer ? 1 : 0) +
      (sectionContactForm ? 1 : 0);

    if (sectionsCount === 0) {
      missing.push("aspoň jednu sekciu");
    }

    const domainRegex = /^[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

    if (domainOption === "request") {
      const raw = domainRequest.trim();
      if (!raw) {
        missing.push("doménu, ktorú chceš zaregistrovať");
      } else {
        const normalized = raw
          .replace(/^https?:\/\//, "")
          .replace(/^www\./, "");
        if (!domainRegex.test(normalized)) {
          setMissingFieldsError("Zadaj platný tvar domény (napr. vasweb.sk).");
          return false;
        }
        if (domainAvailable === false) {
          setMissingFieldsError("Táto doména je obsadená. Vyber prosím inú.");
          return false;
        }
      }
    } else if (domainOption === "own") {
      const raw = domainOwn.trim();
      if (!raw) {
        missing.push("vlastnú doménu");
      } else {
        const normalized = raw
          .replace(/^https?:\/\//, "")
          .replace(/^www\./, "");
        if (!domainRegex.test(normalized)) {
          setMissingFieldsError(
            "Zadaj platný tvar vlastnej domény (napr. mojweb.sk).",
          );
          return false;
        }
      }
    } else {
      missing.push("výber domény");
    }

    if (missing.length > 0) {
      setMissingFieldsError(
        "Prosím doplň tieto údaje: " + missing.join(", ") + ".",
      );
      return false;
    }

    setMissingFieldsError(null);
    return true;
  }

  const selectedSectionsCount = [
    sectionAbout,
    sectionCards,
    sectionFaq,
    sectionGallery,
    sectionOffer,
    sectionContactForm,
  ].filter(Boolean).length;

  const estimatedPrice = (() => {
    let total = 0;
    if (prices.base) total += prices.base;
    if (selectedSectionsCount > 4 && prices.sections) total += prices.sections;

    const wantsDomain = domainOption === "request";
    const wantsMail = mail === "potrebujem";
    const hasCombo = prices.combo != null;

    if (wantsDomain && wantsMail) {
      if (hasCombo) {
        total += prices.combo as number;
      } else {
        if (prices.domain) total += prices.domain;
        if (prices.mail) total += prices.mail;
      }
    } else {
      if (wantsDomain && prices.domain) total += prices.domain;
      if (wantsMail && prices.mail) total += prices.mail;
    }

    if (fastDelivery === "yes" && prices["24h"]) total += prices["24h"];
    return total;
  })();

  const priceBreakdown: string[] = (() => {
    if (Object.keys(prices).length === 0) return [];

    const lines: string[] = [];
    if (prices.base) lines.push(`Základ: ${prices.base.toFixed(2)} €`);
    if (selectedSectionsCount >= 4 && prices.sections) {
      lines.push(`+ Sekcie (4+): ${prices.sections.toFixed(2)} €`);
    }

    const wantsDomain = domainOption === "request";
    const wantsMail = mail === "potrebujem";
    const hasCombo = prices.combo != null;

    if (wantsDomain && wantsMail && prices.combo) {
      lines.push(`+ Doména + mail (combo): ${prices.combo.toFixed(2)} €`);
    } else {
      if (wantsDomain && prices.domain) {
        lines.push(`+ Doména: ${prices.domain.toFixed(2)} €`);
      }
      if (wantsMail && prices.mail) {
        lines.push(`+ Mail: ${prices.mail.toFixed(2)} €`);
      }
    }

    if (fastDelivery === "yes" && prices["24h"]) {
      lines.push(`+ Rýchle dodanie: ${prices["24h"].toFixed(2)} €`);
    }

    return lines;
  })();

  async function checkDomainAvailability() {
    if (domainOption !== "request") return;

    const raw = domainRequest.trim();
    if (!raw) {
      setDomainAvailable(null);
      setDomainCheckMessage("Zadaj doménu, ktorú chceš skontrolovať.");
      return;
    }

    const normalized = raw
      .replace(/^https?:\/\//, "")
      .replace(/^www\./, "");
    const domainRegex = /^[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!domainRegex.test(normalized)) {
      setDomainAvailable(null);
      setDomainCheckMessage("Zadaj platný tvar domény (napr. vasweb.sk).");
      return;
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
        return;
      }
      const data = await res.json();
      if (data && typeof data.available === "boolean") {
        setDomainAvailable(data.available);
        setDomainCheckMessage(
          data.available
            ? "Doména je voľná – super!"
            : "Doména je obsadená – vyber prosím inú.",
        );
      } else {
        setDomainAvailable(null);
        setDomainCheckMessage(
          "Nepodarilo sa overiť doménu. Skús to neskôr.",
        );
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
  }

  function handleContinueClick() {
    const sectionsCount =
      (sectionAbout ? 1 : 0) +
      (sectionCards ? 1 : 0) +
      (sectionFaq ? 1 : 0) +
      (sectionGallery ? 1 : 0) +
      (sectionOffer ? 1 : 0) +
      (sectionContactForm ? 1 : 0);

    if (sectionsCount === 0) {
      setMissingFieldsError(
        "Vyber aspoň jednu sekciu, s ktorou chceš pracovať.",
      );
      return;
    }

    setMissingFieldsError(null);
    setStep(2);
    if (containerRef.current) {
      containerRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }

  async function handleSummarizeClick() {
    if (submitting) return;
    setSubmitting(true);

    try {
      const ok = validateRequiredFields();
      if (!ok) {
        return;
      }

      if (typeof window !== "undefined") {
        try {
          window.localStorage.setItem(
            "vwebConfigSummary",
            JSON.stringify({
              theme,
              accentColor: accent,
              accentCustom: accentCustom || null,
              mailOption: mail,
              sectionAbout,
              sectionCards,
              sectionFaq,
              sectionGallery,
              sectionOffer,
              sectionContactForm,
              customFont: null,
              domainOption: domainOption === "" ? "request" : domainOption,
              domainOwn,
              domainRequest,
              totalPrice: estimatedPrice,
              deliverySpeed: fastDelivery === "yes" ? "24h" : "48h",
            }),
          );
        } catch (error) {
          console.error("Failed to save config summary", error);
        }
      }

      try {
        await fetch("/api/analytics/increment", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: 2 }),
        });
      } catch (err) {
        console.error("Failed to track finished config", err);
      }
      setInlineSummaryVisible(true);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleExistingConfirm() {
    setExistingConfigEmailError(null);
    const trimmed = existingConfigEmail.trim();
    if (!trimmed) {
      setExistingConfigEmailError("Prosím zadaj e-mail použitý pri konfigurácii.");
      return;
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(trimmed)) {
      setExistingConfigEmailError("Zadaj prosím platnú e-mailovú adresu.");
      return;
    }

    try {
      setExistingConfigChecking(true);
      const res = await fetch("/api/orders/find-by-email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: trimmed }),
      });

      if (!res.ok) {
        setExistingConfigEmailError(
          "Nepodarilo sa overiť konfiguráciu. Skús to neskôr.",
        );
        return;
      }

      const data = await res.json();
      if (!data.success || !data.found) {
        setExistingConfigEmailError(
          "Pre tento e-mail sme nenašli konfiguráciu.",
        );
        return;
      }

      const orderStatus =
        data.order && typeof data.order.status === "number"
          ? data.order.status
          : null;
      if (orderStatus === 0) {
        alert(
          "Vasu objednávku registrujeme a čakáme na jej úhradu, Podrobné informácie boli zaslané na Váš email.",
        );
        setExistingDialogOpen(false);
        setExistingConfigEmail("");
        return;
      }

      if (orderStatus === 3) {
        alert(
          "Náš tím sa púšťa do práce na vašej objednávke. Ak niečo treba, kontaktujte nás na info@vweb.sk.",
        );
        setExistingDialogOpen(false);
        setExistingConfigEmail("");
        return;
      }

      if (orderStatus === 1 || orderStatus === 2) {
        if (typeof window !== "undefined") {
          try {
            window.localStorage.setItem("vwebOrderEmail", trimmed);
          } catch {}
        }
        setExistingDialogOpen(false);
        setExistingConfigEmail("");
        if (typeof window !== "undefined") {
          window.location.href = "/config";
        }
        return;
      }
      if (typeof window !== "undefined") {
        try {
          window.localStorage.setItem("vwebOrderEmail", trimmed);
        } catch {}
      }
      setExistingDialogOpen(false);
      setExistingConfigEmail("");
      router.push("/summary");
    } catch (error) {
      console.error("Error looking up existing configuration", error);
      setExistingConfigEmailError(
        "Pri overovaní nastala chyba. Skús to neskôr.",
      );
    } finally {
      setExistingConfigChecking(false);
    }
  }

  return (
    <section className="min-h-screen w-full bg-gradient-to-b from-black via-zinc-950 to-black px-4 py-10 text-zinc-50 sm:px-12 sm:py-16">
      <div
        ref={containerRef}
        className="mx-auto flex w-full max-w-6xl flex-col gap-7 rounded-3xl border border-purple-300/25 bg-black/70 px-6 py-6 text-base shadow-[0_24px_90px_rgba(0,0,0,0.95)] sm:px-12 sm:py-9"
      >
        <header className="border-b border-white/10 pb-4">
          <p className="text-xs font-semibold uppercase tracking-[0.35em] text-purple-200/80">
            Konfigurátor
          </p>
          <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <h1 className="text-3xl font-semibold sm:text-4xl md:text-5xl">
              Vyber si, z akých častí sa má tvoj web skladať.
            </h1>
            <div className="flex flex-wrap items-center gap-2" />
          </div>
        </header>

        <div className="mt-4">
          {/* Blok 1 – vzhľad a sekcie */}
          {step === 1 && (
          <div className="space-y-5 rounded-2xl border border-purple-300/30 bg-black/50 p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-purple-200/80">
              Krok 1 – Vzhľad a sekcie
            </p>
            <div className="flex flex-col gap-3 rounded-xl border border-purple-300/40 bg-black/60 p-4 sm:flex-row sm:items-center sm:justify-between">
              <a
                href="/preview"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center rounded-full bg-purple-500/90 px-4 py-2 text-xs font-semibold text-white shadow-[0_12px_36px_rgba(88,28,135,0.75)] transition hover:bg-purple-400 sm:text-sm"
              >
                Pozrieť demo stránku
              </a>
              <div className="text-sm text-zinc-200 sm:text-base">
                <p className="font-medium text-zinc-100">
                  Najprv si prezri demo stránku, aby si videl, ako môžu jednotlivé bloky pôsobiť v praxi.
                </p>
                <p className="mt-1 text-xs text-zinc-400 sm:text-sm">
                  Potom sa tu v konfigurátore rozhodni, ktoré komponenty potrebuješ.
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <p className="text-sm font-medium uppercase tracking-[0.2em] text-zinc-200">
                Téma
              </p>
              <div className="inline-flex rounded-full bg-black/60 p-1.5 text-xs sm:text-sm">
                <button
                  type="button"
                  onClick={() => setTheme("tmava")}
                  className={`rounded-full px-5 py-2 font-semibold transition ${
                    theme === "tmava" ? "bg-purple-500/90 text-white" : "text-zinc-200"
                  }`}
                >
                  Tmavá
                </button>
                <button
                  type="button"
                  onClick={() => setTheme("svetla")}
                  className={`rounded-full px-5 py-2 font-semibold transition ${
                    theme === "svetla" ? "bg-purple-500/90 text-white" : "text-zinc-200"
                  }`}
                >
                  Svetlá
                </button>
              </div>
            </div>

            <div className="space-y-3">
              <p className="text-sm font-medium uppercase tracking-[0.2em] text-zinc-200">
                Akcent farba
              </p>
              <div className="grid grid-cols-2 gap-2 text-xs sm:grid-cols-3">
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="accent"
                    value="purple"
                    checked={accent === "purple"}
                    onChange={() => setAccent("purple")}
                    className="h-3.5 w-3.5 accent-purple-500"
                  />
                  <span className="inline-flex items-center gap-2">
                    <span className="h-3 w-3 rounded-full bg-purple-500" />
                    <span>Fialová</span>
                  </span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="accent"
                    value="blue"
                    checked={accent === "blue"}
                    onChange={() => setAccent("blue")}
                    className="h-3.5 w-3.5 accent-purple-500"
                  />
                  <span className="inline-flex items-center gap-2">
                    <span className="h-3 w-3 rounded-full bg-blue-500" />
                    <span>Modrá</span>
                  </span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="accent"
                    value="green"
                    checked={accent === "green"}
                    onChange={() => setAccent("green")}
                    className="h-3.5 w-3.5 accent-purple-500"
                  />
                  <span className="inline-flex items-center gap-2">
                    <span className="h-3 w-3 rounded-full bg-emerald-500" />
                    <span>Zelená</span>
                  </span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="accent"
                    value="orange"
                    checked={accent === "orange"}
                    onChange={() => setAccent("orange")}
                    className="h-3.5 w-3.5 accent-purple-500"
                  />
                  <span className="inline-flex items-center gap-2">
                    <span className="h-3 w-3 rounded-full bg-amber-400" />
                    <span>Oranžová</span>
                  </span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="accent"
                    value="pink"
                    checked={accent === "pink"}
                    onChange={() => setAccent("pink")}
                    className="h-3.5 w-3.5 accent-purple-500"
                  />
                  <span className="inline-flex items-center gap-2">
                    <span className="h-3 w-3 rounded-full bg-pink-500" />
                    <span>Ružová</span>
                  </span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="accent"
                    value="red"
                    checked={accent === "red"}
                    onChange={() => setAccent("red")}
                    className="h-3.5 w-3.5 accent-purple-500"
                  />
                  <span className="inline-flex items-center gap-2">
                    <span className="h-3 w-3 rounded-full bg-red-500" />
                    <span>Červená</span>
                  </span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="accent"
                    value="yellow"
                    checked={accent === "yellow"}
                    onChange={() => setAccent("yellow")}
                    className="h-3.5 w-3.5 accent-purple-500"
                  />
                  <span className="inline-flex items-center gap-2">
                    <span className="h-3 w-3 rounded-full bg-yellow-400" />
                    <span>Žltá</span>
                  </span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="accent"
                    value="teal"
                    checked={accent === "teal"}
                    onChange={() => setAccent("teal")}
                    className="h-3.5 w-3.5 accent-purple-500"
                  />
                  <span className="inline-flex items-center gap-2">
                    <span className="h-3 w-3 rounded-full bg-teal-400" />
                    <span>Tyrkysová</span>
                  </span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="accent"
                    value="gray"
                    checked={accent === "gray"}
                    onChange={() => setAccent("gray")}
                    className="h-3.5 w-3.5 accent-purple-500"
                  />
                  <span className="inline-flex items-center gap-2">
                    <span className="h-3 w-3 rounded-full bg-zinc-400" />
                    <span>Neutrálna</span>
                  </span>
                </label>
              </div>
              <input
                type="text"
                placeholder="#A855F7 (vlastný kód, voliteľné)"
                value={accentCustom}
                onChange={(e) => setAccentCustom(e.target.value)}
                className="mt-2 w-full rounded-lg border border-white/15 bg-black/50 px-3 py-2.5 text-sm text-zinc-100 placeholder:text-zinc-500 focus:border-purple-400 focus:outline-none"
              />
            </div>

            <div className="space-y-4 pt-2">
              <p className="text-sm font-medium uppercase tracking-[0.2em] text-zinc-200">
                Sekcie
              </p>
              <p className="text-sm text-zinc-400/90 sm:text-base">
                Zaškrtni bloky, ktoré chceš mať na stránke. Náhľady ukazujú, ako bude sekcia približne vyzerať.
              </p>

              <div className="space-y-3">
                <label className="group flex flex-col cursor-pointer items-start gap-4 rounded-2xl border border-purple-300/40 bg-black/40 p-4 text-left text-sm text-zinc-100 transition hover:border-purple-200/80 hover:bg-black/70 sm:flex-row sm:items-center sm:gap-6">
                  <input
                    className="h-4 w-4 accent-purple-500"
                    type="checkbox"
                    checked={sectionAbout}
                    onChange={(e) => setSectionAbout(e.target.checked)}
                  />
                  <div className="h-40 w-full flex-none overflow-hidden rounded-xl bg-black/40 sm:h-44 sm:w-64">
                    <Image
                      src="/previews/about.png"
                      alt="Náhľad sekcie O nás"
                      width={256}
                      height={144}
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div className="flex-1">
                    <div className="text-lg font-semibold sm:text-xl">O nás / O projekte</div>
                    <p className="mt-1 text-xs text-zinc-400/90 sm:text-sm">
                      Krátke predstavenie firmy alebo projektu hneď na úvod.
                    </p>
                  </div>
                </label>

                <label className="group flex flex-col cursor-pointer items-start gap-4 rounded-2xl border border-purple-300/40 bg-black/40 p-4 text-left text-sm text-zinc-100 transition hover:border-purple-200/80 hover:bg-black/70 sm:flex-row sm:items-center sm:gap-6">
                  <input
                    className="h-4 w-4 accent-purple-500"
                    type="checkbox"
                    checked={sectionCards}
                    onChange={(e) => setSectionCards(e.target.checked)}
                  />
                  <div className="h-40 w-full flex-none overflow-hidden rounded-xl bg-black/40 sm:h-44 sm:w-64">
                    <Image
                      src="/previews/cards.png"
                      alt="Náhľad sekcie Karty / výhody"
                      width={256}
                      height={144}
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div className="flex-1">
                    <div className="text-lg font-semibold sm:text-xl">Karty / výhody</div>
                    <p className="mt-1 text-xs text-zinc-400/90 sm:text-sm">
                      Prehľadné boxy napríklad pre služby, benefity alebo vlastnosti.
                    </p>
                  </div>
                </label>

                <label className="group flex flex-col cursor-pointer items-start gap-4 rounded-2xl border border-purple-300/40 bg-black/40 p-4 text-left text-sm text-zinc-100 transition hover:border-purple-200/80 hover:bg-black/70 sm:flex-row sm:items-center sm:gap-6">
                  <input
                    className="h-4 w-4 accent-purple-500"
                    type="checkbox"
                    checked={sectionOffer}
                    onChange={(e) => setSectionOffer(e.target.checked)}
                  />
                  <div className="h-40 w-full flex-none overflow-hidden rounded-xl bg-black/40 sm:h-44 sm:w-64">
                    <Image
                      src="/previews/services.png"
                      alt="Náhľad sekcie Ponuka"
                      width={256}
                      height={144}
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div className="flex-1">
                    <div className="text-lg font-semibold sm:text-xl">Ponuka / služby</div>
                    <p className="mt-1 text-xs text-zinc-400/90 sm:text-sm">
                      Cenník, balíčky služieb alebo produkty zoradené do prehľadnej sekcie.
                    </p>
                  </div>
                </label>

                <label className="group flex flex-col cursor-pointer items-start gap-4 rounded-2xl border border-purple-300/40 bg-black/40 p-4 text-left text-sm text-zinc-100 transition hover:border-purple-200/80 hover:bg-black/70 sm:flex-row sm:items-center sm:gap-6">
                  <input
                    className="h-4 w-4 accent-purple-500"
                    type="checkbox"
                    checked={sectionGallery}
                    onChange={(e) => setSectionGallery(e.target.checked)}
                  />
                  <div className="h-40 w-full flex-none overflow-hidden rounded-xl bg-black/40 sm:h-44 sm:w-64">
                    <Image
                      src="/previews/gallery.png"
                      alt="Náhľad sekcie Galéria"
                      width={256}
                      height={144}
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div className="flex-1">
                    <div className="text-lg font-semibold sm:text-xl">Galéria</div>
                    <p className="mt-1 text-xs text-zinc-400/90 sm:text-sm">
                      Obrázková galéria alebo ukážky vašich realizácií.
                    </p>
                  </div>
                </label>

                <label className="group flex flex-col cursor-pointer items-start gap-4 rounded-2xl border border-purple-300/40 bg-black/40 p-4 text-left text-sm text-zinc-100 transition hover:border-purple-200/80 hover:bg-black/70 sm:flex-row sm:items-center sm:gap-6">
                  <input
                    className="h-4 w-4 accent-purple-500"
                    type="checkbox"
                    checked={sectionFaq}
                    onChange={(e) => setSectionFaq(e.target.checked)}
                  />
                  <div className="h-40 w-full flex-none overflow-hidden rounded-xl bg-black/40 sm:h-44 sm:w-64">
                    <Image
                      src="/previews/faq.png"
                      alt="Náhľad sekcie Často kladené otázky"
                      width={256}
                      height={144}
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div className="flex-1">
                    <div className="text-lg font-semibold sm:text-xl">Často kladené otázky</div>
                    <p className="mt-1 text-xs text-zinc-400/90 sm:text-sm">
                      FAQ blok s najčastejšími otázkami a odpoveďami.
                    </p>
                  </div>
                </label>

                <label className="group flex flex-col cursor-pointer items-start gap-4 rounded-2xl border border-purple-300/40 bg-black/40 p-4 text-left text-sm text-zinc-100 transition hover:border-purple-200/80 hover:bg-black/70 sm:flex-row sm:items-center sm:gap-6">
                  <input
                    className="h-4 w-4 accent-purple-500"
                    type="checkbox"
                    checked={sectionContactForm}
                    onChange={(e) => setSectionContactForm(e.target.checked)}
                  />
                  <div className="h-40 w-full flex-none overflow-hidden rounded-xl bg-black/40 sm:h-44 sm:w-64">
                    <Image
                      src="/previews/mailer.png"
                      alt="Náhľad sekcie Kontaktný formulár"
                      width={256}
                      height={144}
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div className="flex-1">
                    <div className="text-lg font-semibold sm:text-xl">Kontaktný formulár</div>
                    <p className="mt-1 text-xs text-zinc-400/90 sm:text-sm">
                      Jednoduchý formulár, cez ktorý vám zákazníci môžu poslať dopyt.
                    </p>
                  </div>
                </label>
              </div>
            </div>

            {missingFieldsError && (
              <p className="mt-2 rounded-md border border-red-500/50 bg-red-500/10 px-3 py-2 text-xs text-red-200">
                {missingFieldsError}
              </p>
            )}

            <div className="pt-2">
              <button
                type="button"
                onClick={handleContinueClick}
                className="w-full rounded-full bg-purple-500/90 px-4 py-2 text-sm font-semibold tracking-wide text-white shadow-[0_0_20px_rgba(168,85,247,0.6)] transition hover:bg-purple-400 sm:text-base"
              >
                Pokračovať
              </button>
            </div>
          </div>
          )}

          {/* Blok 2 – doména, mail, dodanie */}
          {step === 2 && (
          <div
            ref={secondBlockRef}
            className="space-y-4 rounded-2xl border border-purple-300/30 bg-black/50 p-5"
          >
            <div className="flex items-center justify-between gap-2">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-purple-200/80">
                Krok 2 – Doména, e‑mail a dodanie
              </p>
            </div>

            <div className="space-y-3">
              <p className="text-sm font-medium uppercase tracking-[0.2em] text-zinc-200">
                Doména
                {prices.domain && (
                  <span className="ml-2 text-[0.7rem] font-normal tracking-normal text-zinc-400/90">
                    + {prices.domain.toFixed(2)} € – pri kombinácii s mailom možná zľava.
                  </span>
                )}
              </p>
              <div className="space-y-2 text-sm">
                <div className="inline-flex rounded-full bg-black/60 p-1.5 text-xs sm:text-sm">
                  <button
                    type="button"
                    onClick={() => {
                      setDomainOption("request");
                      setDomainAvailable(null);
                      setDomainCheckMessage(null);
                    }}
                    className={`rounded-full px-5 py-2 font-semibold transition ${
                      domainOption === "request"
                        ? "bg-purple-500/90 text-white"
                        : "text-zinc-200"
                    }`}
                  >
                    Chcem novú
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setDomainOption("own");
                      setDomainAvailable(null);
                      setDomainCheckMessage(null);
                    }}
                    className={`rounded-full px-5 py-2 font-semibold transition ${
                      domainOption === "own"
                        ? "bg-purple-500/90 text-white"
                        : "text-zinc-200"
                    }`}
                  >
                    Mám vlastnú
                  </button>
                </div>
                {/* text with imagined numeric pricing removed; prices are shown dynamically above */}

                {domainOption === "request" && (
                  <div className="space-y-2">
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                      <div className="flex flex-1 items-center gap-2">
                        <span className="rounded-lg border border-white/15 bg-black/60 px-3 py-2 text-xs text-zinc-400">
                          www.
                        </span>
                        <input
                          type="text"
                          placeholder="napr. vasweb.sk"
                          className="flex-1 rounded-lg border border-white/15 bg-black/50 px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-500 focus:border-purple-400 focus:outline-none"
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
                        className="w-full whitespace-nowrap rounded-full bg-purple-500/90 px-3 py-1.5 text-xs font-semibold text-white shadow-sm transition hover:bg-purple-400 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
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
                )}

                {domainOption === "own" && (
                  <div className="space-y-2">
                    <p className="text-xs text-zinc-400">Zadaj doménu, ktorú už vlastníš:</p>
                    <input
                      type="text"
                      placeholder="napr. www.mojafirma.sk"
                      className="w-full rounded-lg border border-white/15 bg-black/50 px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-500 focus:border-purple-400 focus:outline-none"
                      value={domainOwn}
                      onChange={(e) => setDomainOwn(e.target.value)}
                    />
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-3">
              <p className="text-sm font-medium uppercase tracking-[0.2em] text-zinc-200">
                E‑mail
                {prices.mail && (
                  <span className="ml-2 text-[0.7rem] font-normal tracking-normal text-zinc-400/90">
                    + {prices.mail.toFixed(2)} € – pri kombinácii s doménou možná zľava.
                  </span>
                )}
              </p>
              <div className="inline-flex rounded-full bg-black/60 p-1.5 text-xs sm:text-sm">
                <button
                  type="button"
                  onClick={() => setMail("potrebujem")}
                  className={`rounded-full px-5 py-2 font-semibold transition ${
                    mail === "potrebujem"
                      ? "bg-purple-500/90 text-white"
                      : "text-zinc-200"
                  }`}
                >
                  Potrebujem nový
                </button>
                <button
                  type="button"
                  onClick={() => setMail("mam")}
                  className={`rounded-full px-5 py-2 font-semibold transition ${
                    mail === "mam" ? "bg-purple-500/90 text-white" : "text-zinc-200"
                  }`}
                >
                  Mám vlastný
                </button>
              </div>
              {/* text with imagined numeric pricing removed; prices are shown dynamically above */}
            </div>

            <div className="space-y-3 pt-2">
              <p className="text-sm font-medium uppercase tracking-[0.2em] text-zinc-200">
                Rýchle dodanie
              </p>
              <div className="inline-flex rounded-full bg-black/60 p-1.5 text-xs sm:text-sm">
                <button
                  type="button"
                  onClick={() => setFastDelivery("no")}
                  className={`rounded-full px-5 py-2 font-semibold transition ${
                    fastDelivery === "no"
                      ? "bg-purple-500/90 text-white"
                      : "text-zinc-200"
                  }`}
                >
                  48 h
                </button>
                <button
                  type="button"
                  onClick={() => setFastDelivery("yes")}
                  className={`rounded-full px-5 py-2 font-semibold transition ${
                    fastDelivery === "yes"
                      ? "bg-purple-500/90 text-white"
                      : "text-zinc-200"
                  }`}
                >
                  24 h
                </button>
              </div>
              <p className="text-[0.75rem] text-zinc-400 sm:text-xs">
                Štandardné dodanie 48 h v cene, expresné dodanie do 24 h navyše.
              </p>

              {missingFieldsError && (
                <p className="mt-2 rounded-md border border-red-500/50 bg-red-500/10 px-3 py-2 text-xs text-red-200">
                  {missingFieldsError}
                </p>
              )}
              <div className="pt-2 space-y-3">
                <button
                  type="button"
                  onClick={handleSummarizeClick}
                  disabled={submitting}
                  className="w-full rounded-full bg-purple-500/90 px-4 py-2 text-sm font-semibold tracking-wide text-white shadow-[0_0_25px_rgba(168,85,247,0.6)] transition hover:bg-purple-400 disabled:cursor-not-allowed disabled:bg-purple-500/60"
                >
                  Zosumarizovať konfiguráciu
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setStep(1);
                    if (containerRef.current) {
                      containerRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
                    }
                  }}
                  className="inline-flex items-center gap-1 text-xs font-medium text-zinc-400 underline-offset-2 hover:text-zinc-200 hover:underline"
                >
                  <span className="text-lg">←</span>
                  <span>Späť na krok 1</span>
                </button>
              </div>
            </div>

            {inlineSummaryVisible && (
              <div className="mt-6">
                <SummaryPage
                  liveConfigSummary={{
                    theme,
                    accentColor: accent,
                    accentCustom: accentCustom || null,
                    mailOption: mail,
                    sectionAbout,
                    sectionCards,
                    sectionFaq,
                    sectionGallery,
                    sectionOffer,
                    sectionContactForm,
                    customFont: null,
                    domainOption: domainOption === "" ? "request" : domainOption,
                    domainOwn,
                    domainRequest,
                    totalPrice: estimatedPrice,
                    deliverySpeed: fastDelivery === "yes" ? "24h" : "48h",
                  }}
                  priceBreakdown={priceBreakdown}
                  onEditConfig={() => {
                    setStep(1);
                    if (containerRef.current) {
                      containerRef.current.scrollIntoView({
                        behavior: "smooth",
                        block: "start",
                      });
                    }
                  }}
                />
              </div>
            )}
          </div>
          )}
        </div>

        {existingDialogOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4">
            <div className="w-full max-w-sm rounded-2xl border border-purple-300/40 bg-black/90 px-6 py-7 text-sm text-zinc-100 shadow-[0_20px_60px_rgba(0,0,0,0.95)]">
              <h2 className="text-lg font-semibold">Mám už konfiguráciu</h2>
              <p className="mt-2 text-xs text-zinc-300">
                Zadaj e‑mail, ktorý si použil pri konfigurácii, aby sme ťa vedeli prepojiť na ďalší krok.
              </p>
              <input
                type="email"
                className="mt-4 w-full rounded-lg border border-white/20 bg-black/60 px-4 py-2.5 text-sm text-zinc-100 placeholder:text-zinc-500 focus:border-purple-400 focus:outline-none"
                placeholder="napr. studio@vasweb.sk"
                value={existingConfigEmail}
                onChange={(e) => setExistingConfigEmail(e.target.value)}
              />
              {existingConfigEmailError && (
                <p className="mt-2 rounded-lg border border-red-500/50 bg-red-500/15 px-3 py-2 text-xs text-red-200">
                  {existingConfigEmailError}
                </p>
              )}
              <div className="mt-4 flex justify-end gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => {
                    setExistingDialogOpen(false);
                    setExistingConfigEmailError(null);
                  }}
                  className="rounded-full border border-zinc-600/70 px-4 py-2 text-xs font-semibold text-zinc-200 transition hover:border-zinc-400/90 hover:text-zinc-50"
                >
                  Zrušiť
                </button>
                <button
                  type="button"
                  onClick={handleExistingConfirm}
                  disabled={existingConfigChecking}
                  className="rounded-full bg-purple-500/90 px-5 py-2 text-xs font-semibold text-white shadow-[0_0_20px_rgba(168,85,247,0.5)] transition hover:bg-purple-400 disabled:cursor-not-allowed disabled:bg-purple-500/60"
                >
                  {existingConfigChecking ? "Kontrolujem..." : "Pokračovať"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
