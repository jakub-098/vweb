"use client";

import { FormEvent, useState } from "react";

export default function KonzultaciaPage() {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [note, setNote] = useState("");
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setErrorMessage(null);

    const trimmedName = name.trim();
    const trimmedPhone = phone.trim();
    const trimmedNote = note.trim();

    if (!trimmedName || !trimmedPhone) {
      setErrorMessage("Meno a telefón sú povinné.");
      return;
    }

    setStatus("submitting");

    try {
      const res = await fetch("/api/consultation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: trimmedName, phone: trimmedPhone, note: trimmedNote }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        setErrorMessage(data?.error || "Žiadosť sa nepodarilo odoslať. Skúste to neskôr.");
        setStatus("error");
        return;
      }

      setStatus("success");
      setName("");
      setPhone("");
      setNote("");
    } catch (err) {
      console.error("Failed to submit consultation request", err);
      setErrorMessage("Žiadosť sa nepodarilo odoslať. Skúste to neskôr.");
      setStatus("error");
    }
  }

  return (
    <main className="flex min-h-screen w-full items-center justify-center bg-[radial-gradient(circle_at_top,_#4c1d95_0,_#02010a_25%,_#02010a_55%,_transparent_70%),radial-gradient(circle_at_bottom,_#4c1d95_0,_#02010a_35%,_#000_80%)] px-4 text-zinc-50 sm:px-8">
      <div className="relative w-full max-w-2xl">
        <div
          className="pointer-events-none absolute -inset-[3px] rounded-2xl bg-gradient-to-b from-purple-500/45 via-transparent to-transparent opacity-70 blur-xl"
          aria-hidden
        />

        <section className="relative overflow-hidden rounded-2xl border border-purple-300/20 bg-black/60 px-6 py-8 shadow-[0_24px_80px_rgba(0,0,0,0.95)] backdrop-blur-3xl sm:px-10 sm:py-10">
          <div className="pointer-events-none absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-white/40 to-transparent opacity-70" />

          <div className="relative">
            <p className="mb-3 text-[0.7rem] font-semibold uppercase tracking-[0.35em] text-purple-200/80">
              Bezplatná konzultácia
            </p>
            <h1 className="mb-3 text-2xl font-semibold sm:text-3xl">
              Vyplňte formulár a my sa Vám ozveme
            </h1>
            <p className="mb-6 text-sm leading-relaxed text-zinc-200/90">
              Na email Vám pošleme návrh termínov telefonátu, kde preberieme vaše potreby a poradíme s výberom balíka. Konzultácia je nezáväzná a zdarma.
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="mb-1 block text-xs font-semibold tracking-wide text-zinc-300">
                  Meno 
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-xl border border-purple-500/30 bg-black/40 px-3 py-2 text-sm text-zinc-50 outline-none transition focus:border-purple-400 focus:ring-1 focus:ring-purple-400"
                  placeholder="Napíšte svoje meno"
                  required
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-semibold tracking-wide text-zinc-300">
                  Telefónne číslo
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full rounded-xl border border-purple-500/30 bg-black/40 px-3 py-2 text-sm text-zinc-50 outline-none transition focus:border-purple-400 focus:ring-1 focus:ring-purple-400"
                  placeholder="+421 900 000 000"
                  required
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-semibold tracking-wide text-zinc-300">
                  Preferovaný čas a poznámka
                </label>
                <textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  className="min-h-[96px] w-full rounded-xl border border-purple-500/30 bg-black/40 px-3 py-2 text-sm text-zinc-50 outline-none transition focus:border-purple-400 focus:ring-1 focus:ring-purple-400"
                  placeholder="Kedy vám vyhovuje telefonát a čo by ste chceli prebrať."
                />
              </div>

              {errorMessage && (
                <p className="text-xs font-medium text-red-400">{errorMessage}</p>
              )}

              {status === "success" && (
                <p className="text-xs font-medium text-emerald-400">
                  Žiadosť bola odoslaná. Čoskoro sa vám ozveme.
                </p>
              )}

              <div className="mt-4 flex justify-end">
                <button
                  type="submit"
                  disabled={status === "submitting"}
                  className="inline-flex items-center justify-center rounded-2xl bg-purple-500 px-8 py-2.5 text-sm font-semibold text-white transition duration-200 hover:bg-purple-400 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {status === "submitting" ? "Odosielanie..." : "Požiadať o konzultáciu"}
                </button>
              </div>
            </form>
          </div>
        </section>
      </div>
    </main>
  );
}
