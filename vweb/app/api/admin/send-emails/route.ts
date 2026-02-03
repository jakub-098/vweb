import { NextResponse } from "next/server";
import path from "path";
import fs from "fs/promises";
import nodemailer from "nodemailer";

function checkAdminPassword(request: Request): boolean {
  const configured = process.env.PASSWORD;
  if (!configured) return false;
  const header = request.headers.get("x-admin-password") ?? "";
  return header === configured;
}

const smtpHost = process.env.SMTP_HOST;
const smtpPort = Number(process.env.SMTP_PORT ?? 465);
const smtpSecure = String(process.env.SMTP_SECURE ?? "true").toLowerCase() === "true";
const smtpUser = process.env.SMTP_USER;
const smtpPass = process.env.SMTP_PASS;

const transporter = smtpHost && smtpUser && smtpPass
  ? nodemailer.createTransport({
      host: smtpHost,
      port: smtpPort,
      secure: smtpSecure,
      auth: { user: smtpUser, pass: smtpPass },
    })
  : null;

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

    if (!transporter) {
      return NextResponse.json(
        { success: false, error: "SMTP nie je správne nastavené" },
        { status: 500 }
      );
    }

    const emails = await readEmails();
    const html = await readHtml();
    const subject = process.env.AUTO_MAIL_SUBJECT || "web bez zbytočných starostí";

    let sent = 0;
    let failed = 0;

    const minDelay = 10000; // 10s
    const maxDelay = 20000; // 20s

    for (let i = 0; i < emails.length; i++) {
      const to = emails[i];
      try {
        await transporter.sendMail({
          from: `Vweb <${smtpUser}>`,
          to,
          subject,
          html,
        });
        sent += 1;
      } catch (err) {
        console.error("Failed to send bulk email to", to, err);
        failed += 1;
      }

      // Add 5–10s delay between sends, except after the last one
      if (i < emails.length - 1) {
        const delay = randomDelayMs(minDelay, maxDelay);
        await sleep(delay);
      }
    }

    return NextResponse.json({ success: true, sent, failed });
  } catch (error) {
    console.error("Failed to send bulk emails", error);
    return NextResponse.json(
      { success: false, error: (error as Error).message ?? "Nepodarilo sa odoslať e-maily" },
      { status: 500 }
    );
  }
}
