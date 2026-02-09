"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type AdminOrder = {
  id: number;
  user_email: string | null;
  total_price?: number | string | null;
  status?: number | null;
  delivery_speed?: string | null;
};

function formatPrice(value: AdminOrder["total_price"]): string {
  if (value == null) return "-";
  const num = Number(value);
  if (Number.isNaN(num)) return "-";
  return num.toFixed(2) + " €";
}

function formatStatus(status: AdminOrder["status"]): string {
  if (status === 0) return "Odoslaná";
  if (status === 1) return "Zaplatená";
  if (status === 2) return "Hotová";
  return "Neznáma";
}

export default function AdminPage() {
  const [password, setPassword] = useState("");
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sendingEmails, setSendingEmails] = useState(false);
  const [emailJobResult, setEmailJobResult] = useState<string | null>(null);

  async function loadOrders(pw: string, remember: boolean) {
    try {
      setLoading(true);
      setError(null);

      const res = await fetch("/api/admin/orders", {
        headers: {
          "x-admin-password": pw,
        },
      });

      if (res.status === 401) {
        setError("Nesprávne admin heslo.");
        setOrders([]);
        setLoading(false);
        if (remember && typeof window !== "undefined") {
          try {
            window.localStorage.removeItem("vwebAdminPassword");
          } catch {}
        }
        return;
      }

      if (!res.ok) {
        setError("Nepodarilo sa načítať objednávky.");
        setOrders([]);
        setLoading(false);
        return;
      }

      const data = await res.json();
      if (!data.success) {
        setError("Nepodarilo sa načítať objednávky.");
        setOrders([]);
        setLoading(false);
        return;
      }

      setOrders(data.orders ?? []);
      setLoading(false);

      if (remember && typeof window !== "undefined") {
        try {
          window.localStorage.setItem("vwebAdminPassword", pw);
        } catch {}
      }
    } catch (err) {
      console.error("Failed to load admin orders", err);
      setError("Pri načítaní objednávok nastala chyba.");
      setOrders([]);
      setLoading(false);
    }
  }

  useEffect(() => {
    if (typeof window === "undefined") return;
    let stored: string | null = null;
    try {
      stored = window.localStorage.getItem("vwebAdminPassword");
    } catch {
      stored = null;
    }
    if (stored) {
      setPassword(stored);
      loadOrders(stored, false);
    } else {
      setLoading(false);
    }
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password) return;
    await loadOrders(password, true);
  };

  const handleSendEmails = async () => {
    // Deprecated inline sending - keep state for backward compatibility if needed
    console.warn("handleSendEmails is deprecated. Use the dedicated /admin/emails page.");
    setEmailJobResult("Pre hromadné e-maily použi novú stránku 'Admin – e-maily'.");
  };

  const sortedOrders = [...orders].sort((a, b) => {
    const orderPriority = (status: AdminOrder["status"]): number => {
      if (status === 1) return 0; // Zaplatená
      if (status === 0 || status == null) return 1; // Odoslaná / in progress
      if (status === 2) return 2; // Hotová
      return 3;
    };

    const pa = orderPriority(a.status ?? null);
    const pb = orderPriority(b.status ?? null);
    if (pa !== pb) return pa - pb;

    // Within the same status, show newer orders first
    return (b.id ?? 0) - (a.id ?? 0);
  });

  return (
    <section className="min-h-screen w-full bg-gradient-to-b from-black via-zinc-950 to-black px-4 py-16 text-zinc-50 sm:px-8">
      <div className="mx-auto w-full max-w-5xl">
        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl md:text-4xl">
          Admin – objednávky
        </h1>
        <p className="mt-3 max-w-2xl text-sm text-zinc-300 sm:text-base">
          Prehľad všetkých odoslaných objednávok so stavom (0 = odoslaná, 1 = zaplatená, 2 = hotová).
        </p>

        <div className="mt-8 rounded-2xl border border-purple-300/25 bg-black/60 px-6 py-6 text-sm text-zinc-200 shadow-[0_24px_80px_rgba(0,0,0,0.95)]">
          <form onSubmit={handleLogin} className="flex flex-col gap-3 sm:flex-row sm:items-end">
            <div className="flex-1">
              <label className="block text-xs font-semibold uppercase tracking-[0.2em] text-zinc-400">
                Admin heslo
              </label>
              <input
                type="password"
                className="mt-1 w-full rounded-lg border border-white/15 bg-black/60 px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-500 focus:border-purple-400 focus:outline-none"
                placeholder="Zadaj heslo z .env"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <button
              type="submit"
              className="inline-flex items-center rounded-full bg-purple-500/90 px-5 py-2 text-xs font-semibold text-white shadow-[0_0_20px_rgba(168,85,247,0.6)] transition hover:bg-purple-400 disabled:cursor-not-allowed disabled:bg-purple-500/50"
              disabled={!password}
            >
              Prihlásiť a načítať objednávky
            </button>
          </form>

          <div className="mt-4 flex flex-wrap items-center gap-3 text-xs">
            <Link
                href="/admin/emails"
                className="inline-flex items-center rounded-full border border-purple-400/60 bg-purple-500/20 px-4 py-1.5 text-[0.7rem] font-semibold text-purple-100 hover:bg-purple-500/30"
            >
              Spravovať e-maily
            </Link>
            {emailJobResult && (
              <p className="text-[0.7rem] text-zinc-300">{emailJobResult}</p>
            )}
          </div>

          {loading && <p className="mt-4 text-xs text-zinc-300">Načítavam objednávky...</p>}
          {error && !loading && (
            <p className="mt-4 text-xs text-red-300">{error}</p>
          )}

          {!loading && !error && orders.length === 0 && (
            <p className="mt-6 text-xs text-zinc-400">
              Zatiaľ tu nie sú žiadne objednávky so stavom.
            </p>
          )}

          {!loading && !error && orders.length > 0 && (
            <div className="mt-6 space-y-3">
              {sortedOrders.map((order) => {
    const isPaid = order.status === 1;
    const isCompleted = order.status === 2;
    const statusClasses = isCompleted
	  ? "border-zinc-200/80 bg-zinc-50/10"
      : isPaid
        ? "border-emerald-400/70 bg-emerald-950/40"
        : "border-purple-300/30 bg-black/60";

    return (
      <Link
        key={order.id}
        href={`/admin/${order.id}`}
        className={`flex items-center justify-between rounded-lg border px-4 py-3 text-xs text-zinc-100 transition hover:border-purple-100 hover:bg-black/80 ${statusClasses}`}
      >
                  <div className="flex flex-col gap-0.5">
                    <span className="font-semibold text-sm">Objednávka #{order.id}</span>
                    <span className="text-zinc-400">{order.user_email ?? "(bez e-mailu)"}</span>
                  </div>
                  <div className="flex flex-col items-end gap-0.5 text-right">
                    <span className="font-semibold">{formatPrice(order.total_price)}</span>
                    <span className="text-[0.7rem] text-zinc-400">Stav: {formatStatus(order.status ?? null)}</span>
                    {order.delivery_speed && (
                      <span className="text-[0.7rem] text-zinc-500">Dodanie: {order.delivery_speed}</span>
                    )}
                  </div>
                </Link>
	      );
	    })}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
