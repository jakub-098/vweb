import { NextResponse } from "next/server";
import type { ResultSetHeader } from "mysql2";
import pool from "@/lib/db";

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const orderId = Number(url.searchParams.get("orderId"));

    if (!orderId) {
      return NextResponse.json(
        { success: false, error: "orderId is required" },
        { status: 400 }
      );
    }

    const [rows] = await pool.query<any[]>(
      "SELECT * FROM section_contact_form WHERE order_id = ? ORDER BY id DESC LIMIT 1",
      [orderId]
    );

    if (!Array.isArray(rows) || rows.length === 0) {
      return NextResponse.json({ success: true, found: false });
    }

    return NextResponse.json({ success: true, found: true, section: rows[0] });
  } catch (error) {
    console.error("Error loading section_contact_form", error);
    return NextResponse.json(
      { success: false, error: "Failed to load section" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const orderId = Number(body.orderId);
    const userEmailRaw = typeof body.userEmail === "string" ? body.userEmail.trim() : "";

    if (!orderId || !userEmailRaw) {
      return NextResponse.json(
        { success: false, error: "orderId and userEmail are required" },
        { status: 400 }
      );
    }

    const smallTitle = typeof body.smallTitle === "string" ? body.smallTitle.trim() : "";
    const title = typeof body.title === "string" ? body.title.trim() : "";
    const text = typeof body.text === "string" ? body.text.trim() : "";

    if (!smallTitle || !title || !text) {
      return NextResponse.json(
        { success: false, error: "Missing required content" },
        { status: 400 }
      );
    }

    const [result] = await pool.execute<ResultSetHeader>(
      `INSERT INTO section_contact_form (
        order_id,
        user_email,
        small_title,
        title,
        text
      ) VALUES (?, ?, ?, ?, ?)`,
      [orderId, userEmailRaw, smallTitle, title, text]
    );

    return NextResponse.json({ success: true, id: result.insertId });
  } catch (error) {
    console.error("Error saving section_contact_form", error);
    return NextResponse.json(
      { success: false, error: "Failed to save section" },
      { status: 500 }
    );
  }
}
