"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function AdminEmailsPage() {
  const [password, setPassword] = useState("");
  const [emailCount, setEmailCount] = useState<number | null>(null);
  const [sentCount, setSentCount] = useState<number | null>(null);
  const [loadingInfo, setLoadingInfo] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [uploadStatus, setUploadStatus] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const [sendResult, setSendResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<{
    status: string;
    total: number;
    sent: number;
    failed: number;
    startedAt: string | null;
    lastUpdatedAt: string | null;
    errorMessage: string | null;
  } | null>(null);
  const [now, setNow] = useState<Date>(new Date());

  async function fetchEmailInfo(pw: string) {
    try {
      setLoadingInfo(true);
      setError(null);
      const res = await fetch("/api/admin/emails-file", {
        headers: {
          "x-admin-password": pw,
        },
      });

      if (res.status === 401) {
        setError("Nesprávne admin heslo.");
        setEmailCount(null);
        setSentCount(null);
        setLoadingInfo(false);
        return;
      }

      if (!res.ok) {
        setError("Nepodarilo sa načítať informácie o e-mailoch.");
        setEmailCount(null);
        setSentCount(null);
        setLoadingInfo(false);
        return;
      }

      const data = await res.json();
      if (!data.success) {
        setError(data.error || "Nepodarilo sa načítať informácie o e-mailoch.");
        setEmailCount(null);
        setSentCount(null);
        setLoadingInfo(false);
        return;
      }

      const total = typeof data.count === "number" ? data.count : 0;
      const sent = typeof data.sent === "number" ? data.sent : 0;

      setEmailCount(total);
      setSentCount(sent);
      setLoadingInfo(false);
    } catch (err) {
      console.error("Failed to load email info", err);
      setError("Pri načítaní informácií o e-mailoch nastala chyba.");
      setEmailCount(null);
      setSentCount(null);
      setLoadingInfo(false);
    }
  }

  async function fetchStatus(pw: string) {
    try {
      const res = await fetch("/api/admin/email-status", {
        headers: {
          "x-admin-password": pw,
        },
      });

      if (!res.ok) return;

      const data = await res.json();
      if (!data.success) return;

      setStatus(data.status);
    } catch (err) {
      console.error("Failed to load email status", err);
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
      fetchEmailInfo(stored);
      fetchStatus(stored);
    }
  }, []);

  useEffect(() => {
    if (!password) return;
    const interval = setInterval(() => {
      setNow(new Date());
      fetchStatus(password);
    }, 10000);
    return () => clearInterval(interval);
  }, [password]);

  const handleUsePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password) return;
    if (typeof window !== "undefined") {
      try {
        window.localStorage.setItem("vwebAdminPassword", password);
      } catch {}
    }
    await fetchEmailInfo(password);
		await fetchStatus(password);
  };

  const handleUpload = async () => {
    if (!password || !file) return;
    try {
      setUploadStatus(null);
      setError(null);
      setSendResult(null);

      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/admin/emails-file", {
        method: "POST",
        headers: {
          "x-admin-password": password,
        },
        body: formData,
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setUploadStatus(data.error || "Nepodarilo sa nahrať súbor.");
        return;
      }

      const total = typeof data.count === "number" ? data.count : 0;
      const added = typeof data.added === "number" ? data.added : undefined;

      setEmailCount(total);
      // Po nahratí nového súboru znovu načítame info o odoslaných z API
      await fetchEmailInfo(password);

      if (added !== undefined) {
        setUploadStatus(`Súbor nahratý. Nové e-maily pridané: ${added}. Celkom v databáze: ${total}.`);
      } else {
        setUploadStatus(`Súbor nahratý. Celkom v databáze: ${total} e-mailov.`);
      }
    } catch (err) {
      console.error("Failed to upload emails file", err);
      setUploadStatus("Pri nahrávaní nastala chyba.");
    }
  };

  const handleSend = async () => {
    if (!password || sending) return;
    try {
      setSending(true);
      setSendResult(null);
			await fetchStatus(password);

      const res = await fetch("/api/admin/send-emails", {
        method: "POST",
        headers: {
          "x-admin-password": password,
        },
      });

      const data = await res.json();

      if (res.status === 401) {
        setSendResult("Nesprávne admin heslo pre odoslanie e-mailov.");
        return;
      }

      if (!res.ok || !data.success) {
        setSendResult(data.error || "Nepodarilo sa odoslať e-maily.");
        return;
      }

      setSendResult(
        "Spustené odosielanie. Stav priebehu nájdeš nižšie."
      );
      await fetchStatus(password);
    } catch (err) {
      console.error("Failed to trigger email send", err);
      setSendResult("Pri odosielaní e-mailov nastala chyba.");
    } finally {
      setSending(false);
    }
  };

  function formatDuration(startedAt: string | null): string {
    if (!startedAt) return "0:00";
    const start = new Date(startedAt).getTime();
    const diffMs = Math.max(0, now.getTime() - start);
    const totalSeconds = Math.floor(diffMs / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  }

  return (
    <section className="min-h-screen w-full bg-gradient-to-b from-black via-zinc-950 to-black px-4 py-16 text-zinc-50 sm:px-8">
      <div className="mx-auto w-full max-w-3xl">
        <div className="mb-6 flex items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl md:text-4xl">
              Admin – e-maily
            </h1>
            <p className="mt-2 text-sm text-zinc-300 sm:text-base">
              Nahraj nový JSON so zoznamom e-mailov. Každý deň sa odošle maximálne 99 adresátov.
            </p>
          </div>
          <Link
            href="/admin"
            className="inline-flex items-center rounded-full border border-zinc-700/70 bg-black/60 px-4 py-1.5 text-xs font-semibold text-zinc-200 transition hover:border-zinc-400 hover:text-white"
          >
            ← Späť na objednávky
          </Link>
        </div>

        <div className="rounded-2xl border border-purple-300/25 bg-black/60 px-6 py-6 text-sm text-zinc-200 shadow-[0_24px_80px_rgba(0,0,0,0.95)]">
          <form
            onSubmit={handleUsePassword}
            className="flex flex-col gap-3 sm:flex-row sm:items-end"
          >
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
              Použiť heslo
            </button>
          </form>

          <div className="mt-4 space-y-3 text-xs sm:text-sm">
            {loadingInfo && (
              <p className="text-zinc-300">Načítavam informácie o e-mailoch...</p>
            )}
            {error && <p className="text-red-300">{error}</p>}
            {emailCount !== null && !loadingInfo && !error && (
              <p className="text-zinc-200">
                V databáze je <strong>{emailCount}</strong> e-mailov.
                {sentCount !== null && (
                  <>
                    {" "}Odoslané: <strong>{sentCount}</strong>{" "}
                    • Zostáva: <strong>{Math.max(emailCount - sentCount, 0)}</strong>
                  </>
                )}
              </p>
            )}
        {status && (
          <div className="space-y-1 text-xs sm:text-sm">
            <p className={status.status === "running" ? "text-emerald-300" : ""}>
              Stav odosielania: <strong>{status.status}</strong>
            </p>
            {status.status === "running" && (
              <p className="text-emerald-300">
                Odoslané: <strong>{status.sent}</strong> z {" "}
                <strong>{status.total}</strong> • Čas od spustenia: {" "}
                <strong>{formatDuration(status.startedAt)}</strong>
              </p>
            )}
            {status.status === "finished" && (
              <p>
                Hotovo. Odoslané: <strong>{status.sent}</strong>, zlyhané: {" "}
                <strong>{status.failed}</strong>.
              </p>
            )}
            {status.status === "error" && status.errorMessage && (
              <p className="text-red-300">Chyba: {status.errorMessage}</p>
            )}
          </div>
        )}
          </div>

          <div className="mt-6 space-y-3">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-[0.2em] text-zinc-400">
                Nahrať nový súbor so zoznamom e-mailov (CSV alebo JSON)
              </label>
              <input
                type="file"
                accept=".csv,application/json,text/csv,application/vnd.ms-excel"
                className="mt-2 w-full text-xs text-zinc-300 file:mr-4 file:rounded-full file:border-0 file:bg-purple-500/80 file:px-4 file:py-1.5 file:text-xs file:font-semibold file:text-white hover:file:bg-purple-400"
                onChange={(e) => {
                  const selected = e.target.files?.[0] ?? null;
                  setFile(selected);
                  setUploadStatus(null);
                }}
              />
            </div>
            <button
              type="button"
              onClick={handleUpload}
              disabled={!password || !file}
              className="inline-flex items-center rounded-full border border-purple-400/60 bg-purple-500/20 px-4 py-1.5 text-[0.7rem] font-semibold text-purple-100 hover:bg-purple-500/30 disabled:cursor-not-allowed disabled:opacity-60"
            >
              Nahrať súbor s e-mailami
            </button>
            {uploadStatus && (
              <p className="text-xs text-zinc-300">{uploadStatus}</p>
            )}
          </div>

          <div className="mt-8 space-y-2">
            <button
              type="button"
              onClick={handleSend}
							disabled={!password || sending || status?.status === "running"}
              className="inline-flex items-center rounded-full border border-emerald-400/70 bg-emerald-500/20 px-5 py-2 text-[0.7rem] font-semibold text-emerald-100 hover:bg-emerald-500/30 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {sending
                ? "Odosielam e-maily..."
                : "Spustiť dnešné odosielanie (max 99 e-mailov)"}
            </button>
            {sendResult && (
              <p className="text-xs text-zinc-300">{sendResult}</p>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
