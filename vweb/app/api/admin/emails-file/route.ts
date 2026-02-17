import { NextResponse } from "next/server";
import pool from "@/lib/db";

function checkAdminPassword(request: Request): boolean {
  const configured = process.env.PASSWORD;
  if (!configured) return false;
  const header = request.headers.get("x-admin-password") ?? "";
  return header === configured;
}

export async function GET(request: Request) {
  try {
    if (!checkAdminPassword(request)) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }
    const [rows] = await pool.query<any[]>(
      "SELECT status, COUNT(*) AS count FROM mails GROUP BY status"
    );

    let total = 0;
    let sent = 0;

    for (const row of rows as any[]) {
      const c = Number(row.count ?? 0);
      total += c;
      if (row.status === "sent") {
        sent += c;
      }
    }

    const pending = Math.max(total - sent, 0);

    return NextResponse.json({ success: true, count: total, sent, pending });
  } catch (error) {
    console.error("Failed to read mails table", error);
    return NextResponse.json(
      { success: false, error: (error as Error).message ?? "Nepodarilo sa načítať informácie o e-mailoch" },
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

    // Helper: parse CSV content (supports commas and semicolons, multiple emails per line)
    const parseCsv = (raw: string): string[] => {
      const lines = raw.split(/\r?\n/).map((l) => l.trim());
      const result: string[] = [];
      for (const line of lines) {
        if (!line) continue;
        // Split on both comma and semicolon
        const parts = line.split(/[;,]/);
        for (let part of parts) {
          part = part.trim().toLowerCase();
          if (!part) continue;
          // Remove trailing punctuation like ; , .
          part = part.replace(/[;,.]+$/g, "");
          if (!part.includes("@")) continue;
          result.push(part);
        }
      }
      return result;
    };

    let emails: string[] = [];

    const fileName = (file as any)?.name ? String((file as any).name).toLowerCase() : "";

    if (fileName.endsWith(".csv")) {
      // CSV upload – parse as CSV directly
      emails = parseCsv(text);
    } else {
      // Try JSON first, fallback to CSV if JSON is invalid
      try {
        const parsed: unknown = JSON.parse(text);

        if (Array.isArray(parsed)) {
          emails = (parsed as unknown[])
            .map((v) => (typeof v === "string" ? v.trim().toLowerCase() : ""))
            .filter((v) => v && v.includes("@"));
        } else {
          // Not an array – try CSV fallback
          emails = parseCsv(text);
        }
      } catch {
        // Invalid JSON – treat content as CSV
        emails = parseCsv(text);
      }
    }

    if (!emails.length) {
      return NextResponse.json(
        { success: false, error: "V nahranom súbore nie sú žiadne platné e-maily." },
        { status: 400 }
      );
    }

    // Remove duplicates within the uploaded file
    const uniqueEmails = Array.from(new Set(emails));

    // Filter out emails that are already present in the mails table
    const [existingRows] = await pool.query<any[]>(
      "SELECT mail FROM mails WHERE mail IN (?)",
      [uniqueEmails]
    );

    const existingSet = new Set(
      (existingRows as any[]).map((row) => String(row.mail).toLowerCase())
    );

    const newEmails = uniqueEmails.filter((email) => !existingSet.has(email));

    if (!newEmails.length) {
      const [totalRows] = await pool.query<any[]>(
        "SELECT COUNT(*) AS total FROM mails"
      );
      const total = Number((totalRows as any[])[0]?.total ?? 0);

      return NextResponse.json({
        success: true,
        count: total,
        added: 0,
      });
    }

    const values = newEmails.map((email) => [email, "pending"]);
    await pool.query("INSERT INTO mails (mail, status) VALUES ?", [values]);

    const [totalRows] = await pool.query<any[]>(
      "SELECT COUNT(*) AS total FROM mails"
    );
    const total = Number((totalRows as any[])[0]?.total ?? 0);

    return NextResponse.json({ success: true, count: total, added: newEmails.length });
  } catch (error) {
    console.error("Failed to import emails into mails table", error);
    return NextResponse.json(
      { success: false, error: (error as Error).message ?? "Nepodarilo sa spracovať súbor s e-mailami" },
      { status: 500 }
    );
  }
}
