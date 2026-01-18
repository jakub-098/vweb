export default function Contact() {
  return (
    <section
      id="kontakt"
      className="w-full max-w-6xl px-4 pb-28 sm:w-4/5 lg:w-2/3 sm:px-0"
    >
      <div className="relative overflow-hidden rounded-2xl border border-purple-300/20 bg-black/60 px-8 py-10 shadow-[0_24px_80px_rgba(0,0,0,0.95)] backdrop-blur-3xl sm:px-12 sm:py-14">
        <div className="mb-8 text-left">
          <p className="text-[0.7rem] font-semibold uppercase tracking-[0.3em] text-purple-200/80">
            Kontakt
          </p>
          <h2 className="mt-3 text-2xl font-semibold text-zinc-50 sm:text-3xl">
            Kontaktujte nás
          </h2>
          <p className="mt-3 max-w-xl text-sm leading-relaxed text-zinc-300/90 sm:text-base">
            Napíšte nám svoj e-mail a stručnú správu. Ozveme sa späť s návrhom
            riešenia a ďalším postupom.
          </p>
        </div>

        <form className="space-y-6">
          <div className="space-y-2">
            <label
              htmlFor="email"
              className="text-xs font-medium uppercase tracking-[0.2em] text-zinc-300/90"
            >
              Váš e-mail
            </label>
            <input
              id="email"
              type="email"
              required
              className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-zinc-50 outline-none ring-0 transition placeholder:text-zinc-500 focus:border-purple-400 focus:bg-black/60"
              placeholder="vas@email.sk"
            />
          </div>

          <div className="space-y-2">
            <label
              htmlFor="message"
              className="text-xs font-medium uppercase tracking-[0.2em] text-zinc-300/90"
            >
              Správa
            </label>
            <textarea
              id="message"
              required
              rows={4}
              className="w-full resize-none rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-zinc-50 outline-none ring-0 transition placeholder:text-zinc-500 focus:border-purple-400 focus:bg-black/60"
              placeholder="Sem nám napíšte, čo potrebujete..."
            />
          </div>

          <div className="pt-2">
            <button
              type="submit"
              className="inline-flex items-center justify-center rounded-2xl bg-purple-500 px-10 py-3.5 text-sm font-semibold text-white transition duration-200 hover:scale-[1.02] hover:bg-purple-400"
            >
              Odoslať
            </button>
          </div>
        </form>
      </div>
    </section>
  );
}
