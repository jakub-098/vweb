"use client";

export default function ValueProps() {
  const props = [
    {
      title: " Kompletný online štart bez starostí",
      description:
        "Doména, hosting, SSL certifikát aj firemné emaily v cene. Nemusíte riešiť žiadne technické veci – všetko nastavíme za vás.",
      icon: "⚡",
    },
    {
      title: " Firemná stránka, ktorá predáva",
      description:
        "Moderný responzívny dizajn, ktorý pôsobí profesionálne a buduje dôveru u zákazníkov. Pripravený získavať nové dopyty.",
      icon: "🎯",
    },
    {
      title: " Spustenie do 24 / 48 hodín",
      description:
        "Po dodaní podkladov začíname okamžite. Vaša stránka môže byť online už do 24 alebo 48 hodín.",
      icon: "🚀",
    },
    {
      title: " Pripravené texty a štruktúra webu",
      description:
        "Pomôžeme vám s obsahom, aby stránka pôsobila profesionálne a jasne komunikovala vaše služby. Nemusíte vymýšľať všetko od nuly.",
      icon: "🧩",
    },
    {
      title: " Viac dôvery = viac klientov",
      description:
        "Až 70 % zákazníkov si firmu preverí online pred kontaktovaním. Web vám pomôže pôsobiť dôveryhodne a získať viac dopytov.",
      icon: "💼",
    },
    {
      title: " Získavanie zákazníkov (Outreach)",
      description:
        "Pomôžeme Vám osloviť firmy vo vašom odvetví a získať prvé dopyty. Ideálne pre služby zamerané na firmy (B2B).",
      icon: "📈",
    },
  ];

  return (
    <section className="w-full bg-gradient-to-b from-transparent via-purple-950/20 to-transparent py-16 sm:py-24">
      <div className="mx-auto w-full max-w-6xl px-4 sm:w-4/5 sm:px-6 lg:w-2/3">
        <div className="mb-16 text-center">
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.35em] text-purple-300">
            Čo všetko získate
          </p>
          <h2 className="mb-4 text-3xl font-bold text-white sm:text-4xl">
            Všetko, čo potrebujete, v jednom balíku
          </h2>
          {/* <p className="mx-auto max-w-2xl text-lg text-zinc-300">
            Žiadne balíčky navyše, žiadne komplikované tabuľky. Jednoducho riešenie, ktoré dáva zmysel pre tvoj biznis.
          </p> */}
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {props.map((prop) => (
            <div
              key={prop.title}
              className="group relative overflow-hidden rounded-2xl bg-white/5 p-8 shadow-[0_10px_40px_rgba(0,0,0,0.4)] backdrop-blur-xl transition duration-300 hover:bg-white/10"
            >
              <div className="relative z-10">
                <div className="mb-4 text-4xl">{prop.icon}</div>
                <h3 className="mb-3 text-lg font-bold text-white">{prop.title}</h3>
                <p className="text-sm leading-relaxed text-zinc-300">{prop.description}</p>
              </div>

              <div className="pointer-events-none absolute inset-0 rounded-xl bg-gradient-to-br from-purple-500/10 to-transparent opacity-0 transition duration-300 group-hover:opacity-100" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
