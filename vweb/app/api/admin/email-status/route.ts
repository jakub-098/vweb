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
const STATUS_JSON_PATH = path.join(ROOT_DIR, "data", "emails-status.json");

async function readStatusFromDisk() {
  try {
    const raw = await fs.readFile(STATUS_JSON_PATH, "utf8");
    const parsed = JSON.parse(raw);
    if (typeof parsed.stopRequested !== "boolean") {
      parsed.stopRequested = false;
    }
    return parsed;
  } catch (err: any) {
    if (err?.code === "ENOENT") {
      return {
        status: "idle",
        total: 0,
        sent: 0,
        failed: 0,
        startedAt: null,
        lastUpdatedAt: null,
        errorMessage: null,
        stopRequested: false,
      };
    }
    throw err;
  }
}

export async function GET(request: Request) {
  try {
    if (!checkAdminPassword(request)) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const status = await readStatusFromDisk();
    return NextResponse.json({ success: true, status });
  } catch (error) {
    console.error("Failed to read emails-status.json", error);
    return NextResponse.json(
      { success: false, error: (error as Error).message ?? "Nepodarilo sa načítať stav" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    if (!checkAdminPassword(request)) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    let body: any = null;
    try {
      body = await request.json();
    } catch {
      body = null;
    }

    if (!body || body.action !== "stop") {
      return NextResponse.json(
        { success: false, error: "Neplatná akcia." },
        { status: 400 }
      );
    }

    const current = await readStatusFromDisk();

    if (current.status !== "running") {
      return NextResponse.json(
        { success: false, error: "Momentálne neprebieha žiadne odosielanie." },
        { status: 400 }
      );
    }

    const now = new Date().toISOString();
    const next = {
      ...current,
      stopRequested: true,
      lastUpdatedAt: now,
    };

    await fs.mkdir(path.dirname(STATUS_JSON_PATH), { recursive: true });
    await fs.writeFile(STATUS_JSON_PATH, JSON.stringify(next, null, 2), "utf8");

    return NextResponse.json({ success: true, status: next });
  } catch (error) {
    console.error("Failed to update emails-status.json (stop)", error);
    return NextResponse.json(
      { success: false, error: (error as Error).message ?? "Nepodarilo sa spracovať požiadavku" },
      { status: 500 }
    );
  }
}
