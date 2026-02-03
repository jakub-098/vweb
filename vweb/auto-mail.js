#!/usr/bin/env node

// Simple bulk mailer for sending an HTML email to many recipients
// - Reads recipients from data/emails.json (array of strings) or fallback data/emails.csv
// - Reads HTML body from public/reachout.html by default (or from a path argument)
// - Sends emails using the same SMTP env vars as the app
// - Waits a random 5–10 seconds between sends to reduce provider throttling risk

import fs from "fs";
import path from "path";
import nodemailer from "nodemailer";

const smtpHost = process.env.SMTP_HOST;
const smtpPort = Number(process.env.SMTP_PORT ?? 465);
const smtpSecure = String(process.env.SMTP_SECURE ?? "true").toLowerCase() === "true";
const smtpUser = process.env.SMTP_USER;
const smtpPass = process.env.SMTP_PASS;

if (!smtpHost || !smtpUser || !smtpPass) {
  console.error("[auto-mail] SMTP configuration is incomplete. Set SMTP_HOST, SMTP_USER, SMTP_PASS.");
  process.exit(1);
}

const transporter = nodemailer.createTransport({
  host: smtpHost,
  port: smtpPort,
  secure: smtpSecure,
  auth: { user: smtpUser, pass: smtpPass },
});

const ROOT_DIR = __dirname;
const EMAILS_JSON_PATH = path.join(ROOT_DIR, "data", "emails.json");
const EMAILS_CSV_PATH = path.join(ROOT_DIR, "data", "emails.csv");
const DEFAULT_HTML_PATH = path.join(ROOT_DIR, "public", "reachout.html");

// Subject can be overridden via env; otherwise a generic fallback
const SUBJECT = process.env.AUTO_MAIL_SUBJECT || "Web bez starostí";

function readEmails() {
  // Prefer JSON array in data/emails.json
  if (fs.existsSync(EMAILS_JSON_PATH)) {
    const raw = fs.readFileSync(EMAILS_JSON_PATH, "utf8");
    let parsed;
    try {
      parsed = JSON.parse(raw);
    } catch (err) {
      console.error("[auto-mail] Failed to parse emails.json as JSON:", err);
      process.exit(1);
    }

    if (!Array.isArray(parsed)) {
      console.error("[auto-mail] emails.json must be a JSON array of strings.");
      process.exit(1);
    }

    const emailsFromJson = parsed
      .map((v) => (typeof v === "string" ? v.trim() : ""))
      .filter((v) => v && v.includes("@"));

    if (emailsFromJson.length === 0) {
      console.error("[auto-mail] No valid email addresses found in emails.json.");
      process.exit(1);
    }

    return emailsFromJson;
  }

  // Fallback: CSV in data/emails.csv (first column, one per line)
  if (!fs.existsSync(EMAILS_CSV_PATH)) {
    console.error("[auto-mail] Neither emails.json nor emails.csv found in data/.");
    process.exit(1);
  }

  const raw = fs.readFileSync(EMAILS_CSV_PATH, "utf8");
  const lines = raw.split(/\r?\n/).map((l) => l.trim());
  const emails = [];

  for (const line of lines) {
    if (!line) continue;
    const firstCell = line.split(",")[0].trim();
    if (!firstCell) continue;
    if (!firstCell.includes("@")) continue;
    emails.push(firstCell);
  }

  if (emails.length === 0) {
    console.error("[auto-mail] No valid email addresses found in emails.csv.");
    process.exit(1);
  }

  return emails;
}

function readHtmlBody(htmlPath) {
  const resolved = htmlPath ? path.resolve(htmlPath) : DEFAULT_HTML_PATH;
  if (!fs.existsSync(resolved)) {
    console.error(`[auto-mail] HTML file not found at: ${resolved}`);
    console.error("[auto-mail] Make sure public/reachout.html exists or pass a custom path as an argument.");
    process.exit(1);
  }
  return fs.readFileSync(resolved, "utf8");
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function randomDelayMs(minMs, maxMs) {
  return Math.floor(minMs + Math.random() * (maxMs - minMs));
}

async function sendOne(to, html) {
  const mailOptions = {
    from: `Vweb <${smtpUser}>`,
    to,
    subject: SUBJECT,
    html,
  };

  await transporter.sendMail(mailOptions);
}

async function main() {
  const htmlPathArg = process.argv[2];

  console.log("[auto-mail] Looking for recipients in data/emails.json (or fallback emails.csv)...");
  const emails = readEmails();
  console.log(`[auto-mail] Loaded ${emails.length} email(s).`);

  console.log("[auto-mail] Reading HTML body from:", htmlPathArg ? path.resolve(htmlPathArg) : DEFAULT_HTML_PATH);
  const htmlBody = readHtmlBody(htmlPathArg);

  console.log("[auto-mail] SMTP host:", smtpHost);
  console.log("[auto-mail] Subject:", SUBJECT);
  console.log("[auto-mail] Starting to send emails with 10–20s random delay between sends...\n");

  const minDelay = 10000; // 10s
  const maxDelay = 20000; // 20s

  let successCount = 0;
  let failCount = 0;

  for (let i = 0; i < emails.length; i++) {
    const email = emails[i];
    console.log(`[auto-mail] (${i + 1}/${emails.length}) Sending to: ${email}`);

    try {
      await sendOne(email, htmlBody);
      console.log(`[auto-mail]   ✓ Sent to ${email}`);
      successCount++;
    } catch (err) {
      console.error(`[auto-mail]   ✗ Failed to send to ${email}:`, err && err.message ? err.message : err);
      failCount++;
    }

    if (i < emails.length - 1) {
      const delay = randomDelayMs(minDelay, maxDelay);
      console.log(`[auto-mail]   Waiting ${Math.round(delay / 1000)}s before next email...`);
      await sleep(delay);
    }
  }

  console.log("\n[auto-mail] Done.");
  console.log(`[auto-mail] Successfully sent: ${successCount}`);
  console.log(`[auto-mail] Failed: ${failCount}`);

  if (failCount > 0) {
    process.exitCode = 1;
  }
}

main().catch((err) => {
  console.error("[auto-mail] Unexpected error:", err);
  process.exit(1);
});
