export default function CancelPage() {
  return (
    <section className="min-h-screen w-full bg-gradient-to-b from-black via-zinc-950 to-black px-4 py-16 text-zinc-50 sm:px-8">
      <div className="mx-auto w-full max-w-3xl px-2 sm:px-4">
        <div className="text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.35em] text-purple-400">
            Platba
          </p>
          <h1 className="mt-4 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
            Platba bola zrušená
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-sm text-zinc-300 sm:text-base">
            Ak chceš pokračovať, skús prosím spustiť platbu znova.
          </p>
        </div>

        <div className="mt-10 flex justify-center gap-3">
          <a
            href="/summary"
            className="inline-flex items-center justify-center rounded-full bg-purple-500 px-5 py-2 text-sm font-semibold text-white transition hover:bg-purple-400"
          >
            Späť na zhrnutie
          </a>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-full bg-white px-5 py-2 text-sm font-semibold text-black transition hover:bg-zinc-200"
          >
            Domov
          </a>
        </div>
      </div>
    </section>
  );
}
