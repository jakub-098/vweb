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
const EMAILS_JSON_PATH = path.join(ROOT_DIR, "data", "emails.json");

async function readEmailsFromDisk(): Promise<string[]> {
  try {
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

    return emails;
  } catch (err: any) {
    if (err?.code === "ENOENT") {
      // File does not exist yet
      return [];
    }
    throw err;
  }
}

export async function GET(request: Request) {
  try {
    if (!checkAdminPassword(request)) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const emails = await readEmailsFromDisk();
    return NextResponse.json({ success: true, count: emails.length });
  } catch (error) {
    console.error("Failed to read emails.json", error);
    return NextResponse.json(
      { success: false, error: (error as Error).message ?? "Nepodarilo sa načítať emails.json" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    if (!checkAdminPassword(request)) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get("file");

    if (!file || !(file instanceof Blob)) {
      return NextResponse.json(
        { success: false, error: "Chýba súbor s e-mailami (JSON)." },
        { status: 400 }
      );
    }

    const text = await file.text();

    let parsed: unknown;
    try {
      parsed = JSON.parse(text);
    } catch (err) {
      return NextResponse.json(
        { success: false, error: "Nahraný súbor nie je platný JSON." },
        { status: 400 }
      );
    }

    if (!Array.isArray(parsed)) {
      return NextResponse.json(
        { success: false, error: "JSON musí byť pole reťazcov (e-mailov)." },
        { status: 400 }
      );
    }

    const emails = (parsed as unknown[])
      .map((v) => (typeof v === "string" ? v.trim() : ""))
      .filter((v) => v && v.includes("@"));

    if (!emails.length) {
      return NextResponse.json(
        { success: false, error: "V nahranom súbore nie sú žiadne platné e-maily." },
        { status: 400 }
      );
    }

    await fs.mkdir(path.dirname(EMAILS_JSON_PATH), { recursive: true });
    await fs.writeFile(EMAILS_JSON_PATH, JSON.stringify(emails, null, 2), "utf8");

    return NextResponse.json({ success: true, count: emails.length });
  } catch (error) {
    console.error("Failed to save emails.json", error);
    return NextResponse.json(
      { success: false, error: (error as Error).message ?? "Nepodarilo sa uložiť emails.json" },
      { status: 500 }
    );
  }
}
