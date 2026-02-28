import { redirect } from "next/navigation";

import { stripe } from "@/lib/stripe";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type SuccessProps = {
  searchParams:
    | Promise<Record<string, string | string[] | undefined>>
    | Record<string, string | string[] | undefined>;
};

function formatAmount(amountMinor: number | null, currency: string | null): string {
  if (amountMinor == null || !currency) return "-";
  try {
    return new Intl.NumberFormat("sk-SK", {
      style: "currency",
      currency: currency.toUpperCase(),
    }).format(amountMinor / 100);
  } catch {
    return `${(amountMinor / 100).toFixed(2)} ${currency.toUpperCase()}`;
  }
}

export default async function SuccessPage({ searchParams }: SuccessProps) {
  const resolvedSearchParams = await Promise.resolve(searchParams);
  const rawSessionId = resolvedSearchParams.session_id;
  const sessionId =
    typeof rawSessionId === "string"
      ? rawSessionId
      : Array.isArray(rawSessionId)
        ? rawSessionId[0]
        : undefined;

  if (!sessionId || !sessionId.startsWith("cs_")) {
    return redirect("/summary");
  }

  const session = await stripe.checkout.sessions.retrieve(sessionId, {
    expand: ["line_items", "payment_intent"],
  });

  if (session.status === "open") {
    return redirect("/summary");
  }

  const customerEmail = session.customer_details?.email ?? session.customer_email ?? "";
  const customerName = session.customer_details?.name ?? "";
  const customerPhone = session.customer_details?.phone ?? "";

  const address = session.customer_details?.address;
  const addressLine = address
    ? [address.line1, address.line2, address.postal_code, address.city, address.country]
        .filter(Boolean)
        .join(", ")
    : "";

  const items = session.line_items?.data ?? [];

  return (
    <section className="min-h-screen w-full bg-gradient-to-b from-black via-zinc-950 to-black px-4 py-16 text-zinc-50 sm:px-8">
      <div className="mx-auto w-full max-w-3xl px-2 sm:px-4">
        <div className="text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.35em] text-purple-400">
            Platba
          </p>
          <h1 className="mt-4 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
            {session.payment_status === "paid" ? "Platba prebehla úspešne" : "Platba bola dokončená"}
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-sm text-zinc-300 sm:text-base">
            Ďakujeme! Nižšie nájdeš potvrdenie a údaje zákazníka zo Stripe.
          </p>
        </div>

        <div className="mt-10 rounded-3xl bg-white/10 p-6 text-sm text-zinc-100 shadow-[0_0_60px_rgba(168,85,247,0.3)] backdrop-blur-2xl sm:p-8">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-purple-200">
            Zákazník
          </p>
          <div className="mt-4 space-y-2 text-sm text-zinc-200">
            {customerEmail && (
              <p>
                <span className="text-zinc-400">E-mail:</span> {customerEmail}
              </p>
            )}
            
          </div>

          <div className="mt-8 border-t border-white/10 pt-6">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-purple-200">
              Objednávka
            </p>
            <div className="mt-4 space-y-2 text-sm text-zinc-200">
              <p>
                <span className="text-zinc-400">Suma:</span>{" "}
                {formatAmount(session.amount_total, session.currency)}
              </p>
              {session.metadata?.orderId && (
                <p>
                  <span className="text-zinc-400">Order ID:</span> {session.metadata.orderId}
                </p>
              )}
              {items.length > 0 && (
                <div>
                  <p className="text-zinc-400">Položky:</p>
                  <ul className="mt-2 space-y-1">
                    {items.map((it) => (
                      <li key={it.id} className="text-zinc-200">
                        {(it.description || it.price?.product || "Položka") as any} × {it.quantity ?? 1}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>

          {session.status === "expired" && (
            <p className="mt-6 rounded-2xl border border-red-500/60 bg-red-500/10 px-4 py-3 text-sm text-red-200">
              Táto platba vypršala. Skús prosím spustiť platbu znova.
            </p>
          )}

          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-end">
            <a
              href="/"
              className="inline-flex items-center justify-center rounded-full bg-white px-5 py-2 text-sm font-semibold text-black transition hover:bg-zinc-200"
            >
              Späť na web
            </a>
            <a
              href="mailto:info@vweb.sk"
              className="inline-flex items-center justify-center rounded-full bg-purple-500 px-5 py-2 text-sm font-semibold text-white transition hover:bg-purple-400"
            >
              Kontaktovať podporu
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
