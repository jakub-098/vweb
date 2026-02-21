"use client";

import { useState } from "react";

export default function Contact() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (submitting) return;

    setSubmitting(true);
    setSuccess(null);
    setError(null);

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, message }),
      });

      const data = await res.json().catch(() => null);

      if (!res.ok || !data?.success) {
        const apiError = data?.error || "Nepodarilo sa odoslať správu. Skús to neskôr.";
        setError(apiError);
        return;
      }

      setSuccess("Správa bola odoslaná. Skontroluj prosím svoj e-mail.");
      setEmail("");
      setMessage("");
    } catch (err) {
      console.error("Failed to send contact form", err);
      setError("Pri odosielaní nastala chyba. Skús to prosím znova.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    // <section
    //   id="kontakt"
    //   className="w-full max-w-6xl px-4 pb-28 sm:w-4/5 lg:w-2/3 sm:px-0"
    // >
    //   <div className="relative overflow-hidden rounded-2xl border border-purple-300/20 bg-black/60 px-8 py-10 shadow-[0_24px_80px_rgba(0,0,0,0.95)] backdrop-blur-3xl sm:px-12 sm:py-14">
    //     <div className="mb-8 text-left">
    //       <p className="text-[0.7rem] font-semibold uppercase tracking-[0.3em] text-purple-200/80">
    //         Kontakt
    //       </p>
    //       <h2 className="mt-3 text-2xl font-semibold text-zinc-50 sm:text-3xl">
    //         Kontaktujte nás
    //       </h2>
    //       <p className="mt-3 max-w-xl text-sm leading-relaxed text-zinc-300/90 sm:text-base">
    //         Napíšte nám svoj e-mail a stručnú správu. Ozveme sa späť s návrhom
    //         riešenia a ďalším postupom.
    //       </p>
    //     </div>

    //     <form className="space-y-6" onSubmit={handleSubmit}>
    //       <div className="space-y-2">
    //         <label
    //           htmlFor="email"
    //           className="text-xs font-medium uppercase tracking-[0.2em] text-zinc-300/90"
    //         >
    //           Váš e-mail
    //         </label>
    //         <input
    //           id="email"
    //           type="email"
    //           required
    //           className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-zinc-50 outline-none ring-0 transition placeholder:text-zinc-500 focus:border-purple-400 focus:bg-black/60"
    //           placeholder="vas@email.sk"
    //           value={email}
    //           onChange={(e) => setEmail(e.target.value)}
    //         />
    //       </div>

    //       <div className="space-y-2">
    //         <label
    //           htmlFor="message"
    //           className="text-xs font-medium uppercase tracking-[0.2em] text-zinc-300/90"
    //         >
    //           Správa
    //         </label>
    //         <textarea
    //           id="message"
    //           required
    //           rows={4}
    //           className="w-full resize-none rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-zinc-50 outline-none ring-0 transition placeholder:text-zinc-500 focus:border-purple-400 focus:bg-black/60"
    //           placeholder="Sem nám napíšte, čo potrebujete..."
    //           value={message}
    //           onChange={(e) => setMessage(e.target.value)}
    //         />
    //       </div>

    //       {error && (
    //         <p className="text-xs text-red-300">{error}</p>
    //       )}
    //       {success && (
    //         <p className="text-xs text-emerald-300">{success}</p>
    //       )}

    //       <div className="pt-2">
    //         <button
    //           type="submit"
    //           className="inline-flex items-center justify-center rounded-2xl bg-purple-500 px-10 py-3.5 text-sm font-semibold text-white transition duration-200 hover:scale-[1.02] hover:bg-purple-400 disabled:cursor-not-allowed disabled:opacity-60"
    //           disabled={submitting}
    //         >
    //           {submitting ? "Odosielam..." : "Odoslať"}
    //         </button>
    //       </div>
    //     </form>
    //   </div>
    // </section>
    <section
  id="kontakt"
  className="w-full max-w-6xl px-6 pb-32"
>
  
  <div className="relative overflow-hidden rounded-3xl bg-white/5 p-12 backdrop-blur-xl shadow-[0_10px_40px_rgba(0,0,0,0.4)]">

    {/* Header */}
    <div className="mb-12 text-center">
      <p className="text-xs font-semibold uppercase tracking-[0.3em] text-purple-400/80">
        Kontakt
      </p>

      <h2 className="mt-4 text-3xl font-semibold text-white sm:text-4xl">
        Napíšte nám
      </h2>

      <p className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-zinc-400">
         Nie ste si istý, ktorý balík je pre vás najvhodnejší?
        Napíšte nám. Radi vám pomôžeme s výberom a navrhneme najlepšie riešenie
        pre váš projekt.
      </p>
    </div>

    {/* Form */}
    <form className="mx-auto max-w-2xl space-y-8" onSubmit={handleSubmit}>

      {/* Email */}
      <div className="space-y-3">
        <label
          htmlFor="email"
          className="text-xs font-medium uppercase tracking-[0.2em] text-zinc-400"
        >
          Váš e-mail
        </label>

        <input
          id="email"
          type="email"
          required
          className="w-full rounded-2xl bg-white/5 px-5 py-4 text-sm text-white outline-none transition placeholder:text-zinc-500 focus:bg-white/10 focus:shadow-[0_0_0_1px_rgba(168,85,247,0.6)]"
          placeholder="napr. jan@firma.sk"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>

      {/* Message */}
      <div className="space-y-3">
        <label
          htmlFor="message"
          className="text-xs font-medium uppercase tracking-[0.2em] text-zinc-400"
        >
          Správa
        </label>

        <textarea
          id="message"
          required
          rows={5}
          className="w-full resize-none rounded-2xl bg-white/5 px-5 py-4 text-sm text-white outline-none transition placeholder:text-zinc-500 focus:bg-white/10 focus:shadow-[0_0_0_1px_rgba(168,85,247,0.6)]"
          placeholder="Napíšte nám, čo potrebujete – napr. o aký typ webu máte záujem alebo či si želáte pomôcť s výberom balíka."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />
      </div>

      {/* Feedback messages */}
      {error && (
        <p className="text-sm text-red-400">{error}</p>
      )}

      {success && (
        <p className="text-sm text-emerald-400">{success}</p>
      )}

      {/* Button */}
      <div className="pt-4 text-center">
        <button
          type="submit"
          className="rounded-2xl bg-purple-600 px-12 py-4 text-sm font-semibold uppercase tracking-[0.15em] text-white transition duration-300 hover:bg-purple-500 hover:shadow-[0_0_30px_rgba(168,85,247,0.6)] disabled:opacity-60"
          disabled={submitting}
        >
          {submitting ? "Odosielam..." : "Odoslať správu"}
        </button>
      </div>

    </form>

  </div>
</section>
  );
}
