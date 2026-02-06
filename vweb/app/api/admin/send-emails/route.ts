import { NextResponse } from "next/server";
import path from "path";
import fs from "fs/promises";
import FormData from "form-data";
import Mailgun from "mailgun.js";

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
const EMAILS_JSON_PATH = path.join(ROOT_DIR, "data", "emails.json");
const HTML_PATH = path.join(ROOT_DIR, "public", "reachout.html");

async function readEmails(): Promise<string[]> {
  const raw = await fs.readFile(EMAILS_JSON_PATH, "utf8");
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch (err) {
    console.error("Failed to parse emails.json", err);
    throw new Error("Neplatný formát emails.json");
  }

  if (!Array.isArray(parsed)) {
    throw new Error("emails.json musí byť pole reťazcov");
  }

  const emails = (parsed as unknown[])
    .map((v) => (typeof v === "string" ? v.trim() : ""))
    .filter((v) => v && v.includes("@"));

  if (!emails.length) {
    throw new Error("V emails.json nie sú žiadne platné e-maily");
  }

  return emails;
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

    const emails = await readEmails();
    const html = await readHtml();
    const subject = process.env.AUTO_MAIL_SUBJECT || "web bez zbytočných starostí";

    let sent = 0;
    let failed = 0;

    // 10–15 minutes between individual sends to avoid rate limits
    const minDelay = 10 * 60 * 1000; // 10 min
    const maxDelay = 15 * 60 * 1000; // 15 min

    for (let i = 0; i < emails.length; i++) {
      const to = emails[i];
      try {
        await mgClient.messages.create(mailgunDomain, {
          from: "Vweb <team@vweb.tech>",
          to: [to],
          subject,
          html,
        });
        sent += 1;
      } catch (err) {
        console.error("Failed to send email to", to, err);
        failed += 1;
      }

      // Add 10–15min delay between sends, except after the last one
      if (i < emails.length - 1) {
        const delay = randomDelayMs(minDelay, maxDelay);
        await sleep(delay);
      }
    }

    return NextResponse.json({ success: true, sent, failed });
  } catch (error) {
    console.error("Failed to send emails", error);
    return NextResponse.json(
      { success: false, error: (error as Error).message ?? "Nepodarilo sa odoslať e-maily" },
      { status: 500 }
    );
  }
}