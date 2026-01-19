import { NextResponse } from "next/server";
import type { ResultSetHeader } from "mysql2";
import pool from "@/lib/db";
import { uploadFileToSpace } from "@/lib/storage";

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
      "SELECT * FROM section_about WHERE order_id = ? ORDER BY id DESC LIMIT 1",
      [orderId]
    );

    if (!Array.isArray(rows) || rows.length === 0) {
      return NextResponse.json({ success: true, found: false });
    }

    return NextResponse.json({ success: true, found: true, section: rows[0] });
  } catch (error) {
    console.error("Error loading section_about", error);
    return NextResponse.json(
      { success: false, error: "Failed to load section" },
      { status: 500 }
    );
  }
}

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

    const imageFile = formData.get("image") as File | null;

    if (!smallTitle || !title || !text) {
      return NextResponse.json(
        { success: false, error: "Missing required content" },
        { status: 400 }
      );
    }

    let imageName = "";
    if (imageFile) {
      await uploadFileToSpace({
        file: imageFile,
        email: userEmailRaw,
        sectionKey: "section_about",
      });
      imageName = imageFile.name;
    }

    const [result] = await pool.execute<ResultSetHeader>(
      `INSERT INTO section_about (
        order_id,
        user_email,
        small_title,
        title,
        text,
        image_name
      ) VALUES (?, ?, ?, ?, ?, ?)`,
      [orderId, userEmailRaw, smallTitle, title, text, imageName]
    );

    return NextResponse.json({ success: true, id: result.insertId });
  } catch (error) {
    console.error("Error saving section_about", error);
    return NextResponse.json(
      { success: false, error: "Failed to save section" },
      { status: 500 }
    );
  }
}
