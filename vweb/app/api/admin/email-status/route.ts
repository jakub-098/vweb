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
    return JSON.parse(raw);
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
