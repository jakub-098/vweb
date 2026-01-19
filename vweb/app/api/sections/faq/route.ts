import { NextResponse } from "next/server";
import type { ResultSetHeader } from "mysql2";
import pool from "@/lib/db";

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

    const items = Array.isArray(body.items) ? body.items : [];

    if (!smallTitle || !title || items.length === 0) {
      return NextResponse.json(
        { success: false, error: "Missing required content" },
        { status: 400 }
      );
    }

    const itemsSanitized = items.map((item: any) => ({
      question: typeof item.question === "string" ? item.question.trim() : "",
      answer: typeof item.answer === "string" ? item.answer.trim() : "",
    }));

    const itemsJson = JSON.stringify(itemsSanitized);

    const [result] = await pool.execute<ResultSetHeader>(
      `INSERT INTO section_faq (
        order_id,
        user_email,
        small_title,
        title,
        items_json
      ) VALUES (?, ?, ?, ?, CAST(? AS JSON))`,
      [orderId, userEmailRaw, smallTitle, title, itemsJson]
    );

    return NextResponse.json({ success: true, id: result.insertId });
  } catch (error) {
    console.error("Error saving section_faq", error);
    return NextResponse.json(
      { success: false, error: "Failed to save section" },
      { status: 500 }
    );
  }
}
