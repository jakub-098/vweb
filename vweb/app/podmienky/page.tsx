export default function PodmienkyPage() {
  return (
    <section className="min-h-screen w-full bg-gradient-to-b from-black via-zinc-950 to-black px-4 py-16 text-zinc-50 sm:px-8">
      <div className="mx-auto w-full max-w-4xl">
        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl md:text-4xl">
          Všeobecné obchodné podmienky vweb.sk
        </h1>
        <div className="mt-6 space-y-6 text-sm text-zinc-300 sm:text-base">
          <h2 className="text-lg font-semibold text-zinc-50">
            
          </h2>

          <div className="space-y-3">
            <h3 className="font-semibold text-zinc-50">1. Základné ustanovenia</h3>
            <p>
              Tieto všeobecné obchodné podmienky (ďalej len „Podmienky“) upravujú práva a
              povinnosti medzi poskytovateľom služieb a klientom pri vytváraní webových
              stránok prostredníctvom online objednávkového formulára.
            </p>
            {/* <p className="font-semibold text-zinc-50">Poskytovateľ:</p>
            <p>Obchodné meno / názov: [DOPLŇ]</p>
            <p>Sídlo: [DOPLŇ]</p>
            <p>IČO / DIČ: [DOPLŇ, ak existuje]</p>
            <p>E-mail: [DOPLŇ]</p> */}
            <p className="font-semibold text-zinc-50">Klient:</p>
            <p>
              Fyzická alebo právnická osoba, ktorá si objedná služby poskytovateľa
              prostredníctvom webovej stránky.
            </p>
            <p>
              Odoslaním objednávky klient potvrdzuje, že sa oboznámil s týmito Podmienkami a
              súhlasí s nimi.
            </p>
          </div>

          <div className="space-y-3">
            <h3 className="font-semibold text-zinc-50">2. Predmet služby</h3>
            <p>
              Predmetom služby je vytvorenie webovej stránky na základe podkladov dodaných
              klientom prostredníctvom online formulára, najmä:
            </p>
            <ul className="list-disc space-y-1 pl-5">
              <li>textový obsah,</li>
              <li>obrázky, videá, logá,</li>
              <li>kontaktné a iné osobné údaje,</li>
              <li>ďalšie údaje zadané klientom.</li>
            </ul>
            <p>
              Poskytovateľ nezodpovedá za obsahovú správnosť, pravdivosť ani zákonnosť
              dodaných podkladov.
            </p>
          </div>

          <div className="space-y-3">
            <h3 className="font-semibold text-zinc-50">3. Povinnosti klienta</h3>
            <p>Klient sa zaväzuje, že:</p>
            <ul className="list-disc space-y-1 pl-5">
              <li>
                je oprávnený používať všetky dodané materiály (texty, obrázky, logá,
                značky),
              </li>
              <li>
                dodané podklady neporušujú autorské práva, ochranné známky ani iné práva
                tretích osôb,
              </li>
              <li>dodané údaje sú pravdivé a aktuálne,</li>
              <li>
                má súhlas dotknutých osôb so spracovaním osobných údajov, ak ich poskytuje.
              </li>
            </ul>
            <p>Klient nesie plnú zodpovednosť za obsah webovej stránky.</p>
          </div>

          <div className="space-y-3">
            <h3 className="font-semibold text-zinc-50">4. Osobné údaje</h3>
            <p>
              Poskytovateľ spracúva osobné údaje klienta výlučne za účelom:
            </p>
            <ul className="list-disc space-y-1 pl-5">
              <li>realizácie objednávky,</li>
              <li>komunikácie s klientom,</li>
              <li>splnenia zákonných povinností.</li>
            </ul>
            <p>
              Osobné údaje sú spracúvané v súlade s platnými právnymi predpismi, najmä GDPR.
            </p>
            <p>
              Podrobné informácie sú uvedené v dokumente Zásady ochrany osobných údajov.
            </p>
          </div>

          <div className="space-y-3">
            <h3 className="font-semibold text-zinc-50">5. Cena a platobné podmienky</h3>
            <p>
              Cena služby je uvedená v objednávkovom procese pred odoslaním objednávky.
            </p>
            <p>Platba prebieha vopred, prostredníctvom zvoleného platobného spôsobu.</p>
            <p>Po prijatí platby začne poskytovateľ s realizáciou služby.</p>
          </div>

          <div className="space-y-3">
            <h3 className="font-semibold text-zinc-50">6. Dodanie služby</h3>
            <p>
              Webová stránka je dodaná v primeranej lehote v závislosti od rozsahu služby a
              úplnosti dodaných podkladov.
            </p>
            <p>
              Poskytovateľ nezodpovedá za oneskorenie, ak klient dodá neúplné, chybné alebo
              dodatočne menené podklady.
            </p>
          </div>

          <div className="space-y-3">
            <h3 className="font-semibold text-zinc-50">7. Reklamácie a zodpovednosť</h3>
            <p>
              Klient má právo reklamovať technické chyby webovej stránky, ktoré vznikli
              zavinením poskytovateľa.
            </p>
            <p>Reklamácia sa nevzťahuje na:</p>
            <ul className="list-disc space-y-1 pl-5">
              <li>obsah dodaný klientom,</li>
              <li>chyby spôsobené zásahom tretej strany,</li>
              <li>zmeny vykonané klientom po odovzdaní webu.</li>
            </ul>
            <p>
              Maximálna zodpovednosť poskytovateľa je obmedzená do výšky ceny zaplatenej za
              službu.
            </p>
          </div>

          <div className="space-y-3">
            <h3 className="font-semibold text-zinc-50">8. Autorské práva</h3>
            <p>
              Po úplnom zaplatení ceny získava klient právo používať webovú stránku na
              dohodnutý účel.
            </p>
            <p>
              Poskytovateľ si vyhradzuje právo:
            </p>
            <ul className="list-disc space-y-1 pl-5">
              <li>používať webovú stránku alebo jej časť ako referenciu,</li>
              <li>uviesť klienta v portfóliu, pokiaľ sa nedohodne inak.</li>
            </ul>
          </div>

          <div className="space-y-3">
            <h3 className="font-semibold text-zinc-50">9. Odstúpenie od zmluvy</h3>
            <p>
              Keďže ide o digitálnu službu vytváranú na mieru, klient nemá právo na odstúpenie
              od zmluvy po začatí realizácie služby, v súlade s § 19 zákona o ochrane
              spotrebiteľa.
            </p>
          </div>

          <div className="space-y-3">
            <h3 className="font-semibold text-zinc-50">10. Záverečné ustanovenia</h3>
            <p>
              Poskytovateľ si vyhradzuje právo tieto Podmienky kedykoľvek upraviť.
            </p>
            <p>Pre klienta sú záväzné Podmienky platné v čase odoslania objednávky.</p>
            <p>Tieto Podmienky nadobúdajú platnosť a účinnosť dňa 1.1.2024.</p>
          </div>
        </div>
      </div>
    </section>
  );
}
