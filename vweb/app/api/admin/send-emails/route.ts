import { NextResponse } from "next/server";
import path from "path";
import fs from "fs/promises";
import FormData from "form-data";
import Mailgun from "mailgun.js";
import pool from "@/lib/db";

function checkAdminPassword(request: Request): boolean {
  const configured = process.env.PASSWORD;
  if (!configured) return false;
  const header = request.headers.get("x-admin-password") ?? "";
  return header === configured;
}

const mailgunApiKey = process.env.API_KEY || "API_KEY";
const mailgunDomain = "vweb.tech";

const mailgun = new Mailgun(FormData);
const mgClient = mailgun.client({
  username: "api",
  key: mailgunApiKey,
  url: "https://api.eu.mailgun.net",
});

const ROOT_DIR = process.cwd();
const STATUS_JSON_PATH = path.join(ROOT_DIR, "data", "emails-status.json");
const HTML_PATH = path.join(ROOT_DIR, "public", "reachout.html");
const MAX_DAILY_LIMIT = 300;
const CONFIG_PATH = path.join(ROOT_DIR, "data", "email-config.json");
const TWELVE_HOURS_MS = 12 * 60 * 60 * 1000;

const FROM_ADDRESSES = [
  "Vweb <team@vweb.tech>",
  "Jakub z Vweb.sk <jakub@vweb.tech>",
  "Martin z Vweb.sk <martin@vweb.tech>",
] as const;

async function writeStatus(partial: any) {
  const now = new Date().toISOString();
  let current: any = {
    status: "idle",
    total: 0,
    sent: 0,
    failed: 0,
    startedAt: null,
    lastUpdatedAt: null,
    errorMessage: null,
    stopRequested: false,
  };

  try {
    const raw = await fs.readFile(STATUS_JSON_PATH, "utf8");
    current = { ...current, ...JSON.parse(raw) };
  } catch (err: any) {
    if (err?.code !== "ENOENT") {
      console.error("Failed to read existing emails-status.json", err);
    }
  }

  const next = {
    ...current,
    lastUpdatedAt: now,
    ...partial,
  };

  if (partial.status === "running" && !current.startedAt) {
    next.startedAt = now;
  }

  await fs.mkdir(path.dirname(STATUS_JSON_PATH), { recursive: true });
  await fs.writeFile(STATUS_JSON_PATH, JSON.stringify(next, null, 2), "utf8");
}

async function isStopRequested(): Promise<boolean> {
  try {
    const raw = await fs.readFile(STATUS_JSON_PATH, "utf8");
    const data = JSON.parse(raw);
    return Boolean(data.stopRequested);
  } catch {
    return false;
  }
}

async function readHtml(): Promise<string> {
  return fs.readFile(HTML_PATH, "utf8");
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function randomDelayMs(minMs: number, maxMs: number) {
  return Math.floor(minMs + Math.random() * (maxMs - minMs));
}

async function readDefaultDailyLimit(): Promise<number> {
  try {
    const raw = await fs.readFile(CONFIG_PATH, "utf8");
    const data = JSON.parse(raw);
    const value = Number(data?.defaultDailyLimit);
    if (!Number.isFinite(value) || value <= 0) {
      return 100;
    }
    return Math.min(MAX_DAILY_LIMIT, Math.floor(value));
  } catch {
    return 100;
  }
}

export async function POST(request: Request) {
  try {
    if (!checkAdminPassword(request)) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    if (!process.env.API_KEY || mailgunApiKey === "API_KEY") {
      return NextResponse.json(
        { success: false, error: "Mailgun API kľúč nie je správne nastavený" },
        { status: 500 }
      );
    }

    const html = await readHtml();
    const subject = process.env.AUTO_MAIL_SUBJECT || "web bez zbytočných starostí";

    // Read optional limit from request body (number of emails to send in this session)
    let requestedLimit: number | null = null;
    try {
      const body = await request.json();
      if (body && typeof body.limit === "number" && Number.isFinite(body.limit)) {
        requestedLimit = Math.max(1, Math.floor(body.limit));
      }
    } catch {
      // Body might be empty or invalid JSON – ignore and use defaults
      requestedLimit = null;
    }

    const storedDefaultLimit = await readDefaultDailyLimit();
    const perSessionLimit = Math.min(
      MAX_DAILY_LIMIT,
      requestedLimit ?? storedDefaultLimit
    );

    // Load up to perSessionLimit pending emails from the mails table
    const [rows] = await pool.query<any[]>(
      "SELECT id, mail FROM mails WHERE status = 'pending' ORDER BY id ASC LIMIT ?",
      [perSessionLimit]
    );

    const emails = (rows as any[]).map((row) => ({
      id: Number(row.id),
      mail: String(row.mail),
    }));

    // Reset emails stuck in 'sending' status back to 'pending'
    await pool.query(
      "UPDATE mails SET status = 'pending' WHERE status = 'sending'"
    );

    if (emails.length === 0) {
      await writeStatus({
        status: "idle",
        total: 0,
        sent: 0,
        failed: 0,
        errorMessage: null,
      });

      return NextResponse.json({
        success: true,
        sent: 0,
        failed: 0,
        message: "Žiadne čakajúce e-maily na odoslanie.",
      });
    }

    const ids = emails.map((e) => e.id);
    await pool.query(
      "UPDATE mails SET status = 'sending' WHERE id IN (?) AND status = 'pending'",
      [ids]
    );

    let sent = 0;
    let failed = 0;

    // Compute variable delay so that all emails are sent within ~12 hours.
    const totalToSend = emails.length;
    const baseDelayMs = Math.max(
      Math.floor(TWELVE_HOURS_MS / Math.max(totalToSend, 1)),
      60 * 1000
    );
    const minDelayMs = Math.floor(baseDelayMs * 0.5);
    const maxDelayMs = Math.floor(baseDelayMs * 1.5);

    // Initialize sender rotation
    let fromIndex = Math.floor(Math.random() * FROM_ADDRESSES.length);

    await writeStatus({
      status: "running",
      total: emails.length,
      sent,
      failed,
      errorMessage: null,
      stopRequested: false,
    });

    for (let index = 0; index < emails.length; index++) {
      // Allow external stop request between individual emails
      if (await isStopRequested()) {
        await writeStatus({ status: "stopped" });
        break;
      }

      const email = emails[index];
      const to = email.mail;
      try {
        // Rotate between sender addresses with slight randomness
        if (Math.random() < 0.3) {
          fromIndex = Math.floor(Math.random() * FROM_ADDRESSES.length);
        } else {
          fromIndex = (fromIndex + 1) % FROM_ADDRESSES.length;
        }
        const fromAddress = FROM_ADDRESSES[fromIndex];

        await mgClient.messages.create(mailgunDomain, {
          from: fromAddress,
          to: [to],
          subject,
          html,
        });
        sent += 1;
        await pool.query("UPDATE mails SET status = 'sent' WHERE id = ?", [email.id]);
      } catch (err) {
        console.error("Failed to send email to", to, err);
        failed += 1;
        await pool.query("UPDATE mails SET status = 'failed' WHERE id = ?", [email.id]);
      }

      await writeStatus({ sent, failed });

      // Add 3–7 min delay between sends, except after the last one
      if (index < emails.length - 1) {
        const delay = randomDelayMs(minDelayMs, maxDelayMs);
        await sleep(delay);
      }
    }

    await writeStatus({ status: "finished" });

    return NextResponse.json({ success: true, sent, failed, total: emails.length });
  } catch (error) {
    console.error("Failed to send emails", error);
    try {
      await writeStatus({
        status: "error",
        errorMessage: (error as Error).message ?? "Nepodarilo sa odoslať e-maily",
      });
    } catch (e) {
      console.error("Failed to write error status for emails-status.json", e);
    }

    return NextResponse.json(
      { success: false, error: (error as Error).message ?? "Nepodarilo sa odoslať e-maily" },
      { status: 500 }
    );
  }
}