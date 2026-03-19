"use client";

export default function ValueProps() {
  const props = [
    {
      title: "Hotový Web Za 24h",
      description: "Nevie čakať. Živý, pracujúci web v priebehu 24 hodín od úhrady. Bez meškania.",
      icon: "🚀",
    },
    {
      title: "Kompletný Balík",
      description: "Doména, hosting, email, SSL, SEO, performance — všetko je zaradené bez extra poplatkov.",
      icon: "📦",
    },
    {
      title: "Zero Technických Starostí",
      description: "My spravujeme web. Vy predávate. Bezplatná podpora a aktualizácie bez nečinnosti.",
      icon: "🛡️",
    },
    {
      title: "Email Stratégia Zadarmo",
      description: "Nie je len web — dostaneš aj overený email marketing formát, ktorý predáva.",
      icon: "💌",
    },
    {
      title: "Garantovaný Rast",
      description: "Naši klienti videli priemerne 250% zvýšenie kontaktov v prvých 3 mesiacoch.",
      icon: "📈",
    },
    {
      title: "30 Dní Záruka",
      description: "Ak nie si spokojný, vrátiť ti výskyt bez otázok. Nula rizika.",
      icon: "✓",
    },
  ];

  return (
    <section className="w-full py-16 sm:py-24 bg-gradient-to-b from-transparent via-purple-950/20 to-transparent">
      <div className="mx-auto max-w-6xl px-6 sm:w-4/5 lg:w-2/3">
        
        {/* Section Header */}
        <div className="mb-16 text-center">
          <p className="text-xs font-bold uppercase tracking-widest text-purple-400 mb-3">Prečo Práve My</p>
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">Všetko, čo potrebuješ v jednom balíku</h2>
          <p className="max-w-2xl mx-auto text-lg text-zinc-300">Bez skrytých poplatkov. Bez zbytočných služieb. Len to, čo ti opravdu pomôže rásť.</p>
        </div>

        {/* Props Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {props.map((prop, idx) => (
            <div
              key={idx}
              className="group relative overflow-hidden rounded-xl bg-white/5 p-8 border border-purple-500/20 transition duration-300 hover:border-purple-400 hover:shadow-lg hover:shadow-purple-500/20"
            >
              <div className="relative z-10">
                <div className="text-4xl mb-4">{prop.icon}</div>
                <h3 className="text-lg font-bold text-white mb-3">{prop.title}</h3>
                <p className="text-zinc-300 text-sm leading-relaxed">{prop.description}</p>
              </div>
              
              {/* Subtle hover effect */}
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-purple-500/10 to-transparent group-hover:opacity-100 transition duration-300 rounded-xl" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
