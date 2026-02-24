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
const DAILY_LIMIT = 99;
const MIN_DELAY_MS = 3 * 60 * 1000; // 3 min
const MAX_DELAY_MS = 7 * 60 * 1000; // 7 min

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

    // Load up to DAILY_LIMIT pending emails from the mails table
    const [rows] = await pool.query<any[]>(
      "SELECT id, mail FROM mails WHERE status = 'pending' ORDER BY id ASC LIMIT ?",
      [DAILY_LIMIT]
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
        await mgClient.messages.create(mailgunDomain, {
          from: "Vweb <team@vweb.tech>",
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
        const delay = randomDelayMs(MIN_DELAY_MS, MAX_DELAY_MS);
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