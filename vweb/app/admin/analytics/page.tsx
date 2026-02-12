"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Filler,
} from "chart.js";

type AnalyticsRow = {
  id: number;
  config: number | string | null;
  upload: number | string | null;
  purchase: number | string | null;
};

type DailyPoint = {
	id: number | string;
	config: number | string | null;
};

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Filler);

export default function AdminAnalyticsPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [todayAnalytics, setTodayAnalytics] = useState<AnalyticsRow | null>(null);
  const [weekAnalytics, setWeekAnalytics] = useState<AnalyticsRow | null>(null);
  const [dailyAnalytics, setDailyAnalytics] = useState<DailyPoint[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function fetchAnalytics(pw: string) {
    try {
      setLoading(true);
      setError(null);

      const res = await fetch("/api/admin/analytics", {
        headers: {
          "x-admin-password": pw,
        },
      });

      if (res.status === 401) {
        setError("Nesprávne admin heslo.");
			setTodayAnalytics(null);
			setWeekAnalytics(null);
        setLoading(false);
			// remove invalid stored password and redirect back to admin login
			try {
				if (typeof window !== "undefined") {
					window.localStorage.removeItem("vwebAdminPassword");
				}
			} catch {}
			router.replace("/admin");
        return;
      }

      if (!res.ok) {
        setError("Nepodarilo sa načítať analytiku.");
      setTodayAnalytics(null);
      setWeekAnalytics(null);
        setLoading(false);
        return;
      }

      const data = await res.json();
			if (!data.success || !data.analyticsToday || !data.analyticsWeek) {
        setError("Nepodarilo sa načítať analytiku.");
        setTodayAnalytics(null);
        setWeekAnalytics(null);
        setDailyAnalytics([]);
        setLoading(false);
        return;
      }

      setTodayAnalytics(data.analyticsToday as AnalyticsRow);
      setWeekAnalytics(data.analyticsWeek as AnalyticsRow);
      setDailyAnalytics(Array.isArray(data.analyticsDaily) ? data.analyticsDaily as DailyPoint[] : []);
      setLoading(false);
    } catch (err) {
      console.error("Failed to load analytics", err);
      setError("Pri načítaní analytiky nastala chyba.");
			setTodayAnalytics(null);
			setWeekAnalytics(null);
      setDailyAnalytics([]);
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
      fetchAnalytics(stored);
		} else {
			// no stored password, send user back to admin login
			router.replace("/admin");
    }
  }, []);

  const metrics = [
    { key: "config" as const, label: "Config", description: "Počet spustených konfigurácií" },
    { key: "upload" as const, label: "Upload", description: "Počet nahratí konfigurácie" },
    { key: "purchase" as const, label: "Purchase", description: "Počet dokončených nákupov" },
  ];

  const last7Labels = dailyAnalytics.map((d) => {
    const idStr = String(d.id);
    if (idStr.length === 8) {
      const day = idStr.slice(6, 8);
      const month = idStr.slice(4, 6);
      return `${day}.${month}`;
    }
    return idStr;
  });

  const last7Values = dailyAnalytics.map((d) => Number(d.config ?? 0) || 0);

  const lineData = {
    labels: last7Labels,
    datasets: [
      {
        label: "Config",
        data: last7Values,
        borderColor: "rgba(168, 85, 247, 0.9)",
        backgroundColor: "rgba(168, 85, 247, 0.3)",
        tension: 0.3,
        pointRadius: 3,
        pointHoverRadius: 4,
        fill: false,
      },
    ],
  };

  const lineOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        mode: "index" as const,
        intersect: false,
      },
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { color: "#e5e5e5", font: { size: 10 } },
      },
      y: {
        display: false,
        beginAtZero: true,
      },
    },
  } as const;

  return (
    <section className="min-h-screen w-full bg-gradient-to-b from-black via-zinc-950 to-black px-4 py-16 text-zinc-50 sm:px-8">
      <div className="mx-auto w-full max-w-5xl">
        <div className="mb-6 flex items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl md:text-4xl">
              Admin – analýzy
            </h1>
            <p className="mt-2 text-sm text-zinc-300 sm:text-base">
              Rýchly prehľad hlavných krokov funnelu: konfigurácia, nahratie a nákup.
            </p>
          </div>
          <Link
            href="/admin"
            className="inline-flex items-center rounded-full border border-zinc-700/70 bg-black/60 px-4 py-1.5 text-xs font-semibold text-zinc-200 transition hover:border-zinc-400 hover:text-white"
          >
            04 Späť na objednávky
          </Link>
        </div>

        <div className="rounded-2xl border border-purple-300/25 bg-black/60 px-6 py-6 text-sm text-zinc-200 shadow-[0_24px_80px_rgba(0,0,0,0.95)]">
          <div className="text-xs text-zinc-400">
            <p>Prístup k analytike je viazaný na prihlásenie v admin sekcii.</p>
          </div>

          <div className="mt-6 text-xs sm:text-sm">
            {loading && (
              <p className="text-zinc-300">Načítavam analytiku...</p>
            )}
            {error && !loading && (
              <p className="text-red-300">{error}</p>
            )}
          </div>

      {/* Today row */}
      <div className="mt-8">
        <div className="mb-3 flex items-baseline justify-between">
          <h2 className="text-sm font-semibold uppercase tracking-[0.25em] text-zinc-300">
            Dnes
          </h2>
          <p className="text-[0.7rem] text-zinc-400">
            Aktuálne čísla len za dnešný deň.
          </p>
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          {metrics.map((metric) => {
            const rawValue = todayAnalytics?.[metric.key] ?? 0;
            const value = Number.isNaN(Number(rawValue)) ? 0 : Number(rawValue);
            return (
              <div
                key={`today-${metric.key}`}
                className="relative overflow-hidden rounded-2xl bg-black/70 px-4 py-4 shadow-[0_18px_50px_rgba(0,0,0,0.9)]"
              >
                <div className="text-[0.7rem] font-semibold uppercase tracking-[0.18em] text-purple-200/80">
                  {metric.label}
                </div>
                <div className="mt-2 flex items-end justify-between gap-2">
                  <div className="text-4xl font-semibold leading-none text-white sm:text-5xl">
                    {value}
                  </div>
                </div>
                <p className="mt-2 text-[0.7rem] text-zinc-300">
                  {metric.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* This week row */}
      <div className="mt-10">
        <div className="mb-3 flex items-baseline justify-between">
          <h2 className="text-sm font-semibold uppercase tracking-[0.25em] text-zinc-300">
            Tento týždeň
          </h2>
          <p className="text-[0.7rem] text-zinc-400">
            Súčet udalostí od pondelka do nedele.
          </p>
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          {metrics.map((metric) => {
            const rawValue = weekAnalytics?.[metric.key] ?? 0;
            const value = Number.isNaN(Number(rawValue)) ? 0 : Number(rawValue);
            return (
              <div
                key={`week-${metric.key}`}
                className="relative overflow-hidden rounded-2xl bg-black/70 px-4 py-4 shadow-[0_18px_50px_rgba(0,0,0,0.9)]"
              >
                <div className="text-[0.7rem] font-semibold uppercase tracking-[0.18em] text-purple-200/80">
                  {metric.label}
                </div>
                <div className="mt-2 flex items-end justify-between gap-2">
                  <div className="text-4xl font-semibold leading-none text-white sm:text-5xl">
                    {value}
                  </div>
                </div>
                <p className="mt-2 text-[0.7rem] text-zinc-300">
                  {metric.description}
                </p>
              </div>
            );
          })}
        </div>

      {/* Last 7 days line chart (config only) */}
      <div className="mt-10">
        <h3 className="mb-3 text-xs font-semibold uppercase tracking-[0.25em] text-zinc-400">
          Config – posledných 7 dní
        </h3>
        <div className="rounded-2xl bg-black/70 px-4 py-5 shadow-[0_18px_50px_rgba(0,0,0,0.9)]">
          <div className="h-40">
            <Line data={lineData} options={lineOptions} />
          </div>
        </div>
      </div>
      </div>
        </div>
      </div>
    </section>
  );
}
