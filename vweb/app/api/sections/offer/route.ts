import { NextResponse } from "next/server";
import type { ResultSetHeader } from "mysql2";
import pool from "@/lib/db";
import { uploadFileToSpace } from "@/lib/storage";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();

    const orderId = Number(formData.get("orderId"));
    const userEmailRaw = String(formData.get("userEmail") ?? "").trim();

    if (!orderId || !userEmailRaw) {
      return NextResponse.json(
        { success: false, error: "orderId and userEmail are required" },
        { status: 400 }
      );
    }

    const smallTitle = String(formData.get("smallTitle") ?? "").trim();
    const title = String(formData.get("title") ?? "").trim();
    const text = String(formData.get("text") ?? "").trim();

    const rawItems = formData.get("items");
    const items = rawItems ? JSON.parse(String(rawItems)) : [];

    if (!smallTitle || !title || !text || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { success: false, error: "Missing required content" },
        { status: 400 }
      );
    }

    const itemsSanitized = await Promise.all(
      items.map(async (item: any, index: number) => {
        const titleValue = typeof item.title === "string" ? item.title.trim() : "";
        const textValue = typeof item.text === "string" ? item.text.trim() : "";

        const file = formData.get(`itemImage_${index}`) as File | null;

        if (!file) {
          throw new Error("Missing image for offer item");
        }

        await uploadFileToSpace({
          file,
          email: userEmailRaw,
          sectionKey: "section_offer",
        });

        return {
          title: titleValue,
          text: textValue,
          image_name: file.name,
        };
      })
    );

    const itemsJson = JSON.stringify(itemsSanitized);

    const [result] = await pool.execute<ResultSetHeader>(
      `INSERT INTO section_offer (
        order_id,
        user_email,
        small_title,
        title,
        text,
        items_json
      ) VALUES (?, ?, ?, ?, ?, CAST(? AS JSON))`,
      [orderId, userEmailRaw, smallTitle, title, text, itemsJson]
    );

    return NextResponse.json({ success: true, id: result.insertId });
  } catch (error) {
    console.error("Error saving section_offer", error);
    return NextResponse.json(
      { success: false, error: "Failed to save section" },
      { status: 500 }
    );
  }
}
