import { NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function POST(req: Request) {
  try {
    const { code } = (await req.json()) as { code?: string };

    if (!code || typeof code !== "string") {
      return NextResponse.json({ success: false, error: "Missing code" }, { status: 400 });
    }

    const trimmed = code.trim();
    if (!trimmed) {
      return NextResponse.json({ success: false, error: "Empty code" }, { status: 400 });
    }

    const rows = await query<{ code: string; number: number }>(
      "SELECT `code`, `number` FROM `codes` WHERE `code` = ? LIMIT 1",
      [trimmed]
    );

    if (!rows || rows.length === 0) {
      return NextResponse.json({ success: false, found: false }, { status: 200 });
    }

    const row = rows[0];
    const percentage = Number(row.number);

    if (!Number.isFinite(percentage) || percentage <= 0) {
      return NextResponse.json({ success: false, found: false }, { status: 200 });
    }

    return NextResponse.json({ success: true, found: true, percentage });
  } catch (err) {
    console.error("Failed to validate promo code", err);
    return NextResponse.json(
      { success: false, error: "Server error" },
      { status: 500 }
    );
  }
}
