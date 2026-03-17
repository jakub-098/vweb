import { NextResponse } from "next/server";
import path from "path";
import fs from "fs/promises";

function checkAdminPassword(request: Request): boolean {
  const configured = process.env.PASSWORD;
  if (!configured) return false;
  const header = request.headers.get("x-admin-password") ?? "";
  return header === configured;
}

const ROOT_DIR = process.cwd();
const CONFIG_PATH = path.join(ROOT_DIR, "data", "email-config.json");
const MAX_DAILY_LIMIT = 300;
const FALLBACK_DEFAULT_LIMIT = 100;

async function readConfig() {
  try {
    const raw = await fs.readFile(CONFIG_PATH, "utf8");
    const data = JSON.parse(raw);
    const value = Number(data?.defaultDailyLimit);
    if (!Number.isFinite(value) || value <= 0) {
      return FALLBACK_DEFAULT_LIMIT;
    }
    return Math.min(MAX_DAILY_LIMIT, Math.floor(value));
  } catch {
    return FALLBACK_DEFAULT_LIMIT;
  }
}

async function writeConfig(limit: number) {
  const safeLimit = Math.min(MAX_DAILY_LIMIT, Math.max(1, Math.floor(limit)));
  const payload = { defaultDailyLimit: safeLimit };
  await fs.mkdir(path.dirname(CONFIG_PATH), { recursive: true });
  await fs.writeFile(CONFIG_PATH, JSON.stringify(payload, null, 2), "utf8");
  return safeLimit;
}

export async function GET(request: Request) {
  if (!checkAdminPassword(request)) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  const limit = await readConfig();
  return NextResponse.json({ success: true, defaultDailyLimit: limit });
}

export async function POST(request: Request) {
  if (!checkAdminPassword(request)) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const rawLimit = Number(body?.defaultDailyLimit ?? body?.limit);
    if (!Number.isFinite(rawLimit) || rawLimit <= 0) {
      return NextResponse.json(
        { success: false, error: "Neplatný počet e-mailov." },
        { status: 400 }
      );
    }

    const savedLimit = await writeConfig(rawLimit);
    return NextResponse.json({ success: true, defaultDailyLimit: savedLimit });
  } catch (error) {
    console.error("Failed to update email-config", error);
    return NextResponse.json(
      { success: false, error: "Nepodarilo sa uložiť konfiguráciu e-mailov." },
      { status: 500 }
    );
  }
}
