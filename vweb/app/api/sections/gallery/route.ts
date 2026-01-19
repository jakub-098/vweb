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

    if (!smallTitle || !title) {
      return NextResponse.json(
        { success: false, error: "Missing required content" },
        { status: 400 }
      );
    }

    const imageFiles: File[] = [];
    formData.forEach((value, key) => {
      if (key === "images" && value instanceof File) {
        imageFiles.push(value);
      }
    });

    const uploadedNames: string[] = [];

    for (const file of imageFiles) {
      await uploadFileToSpace({
        file,
        email: userEmailRaw,
        sectionKey: "section_gallery",
      });
      uploadedNames.push(file.name);
    }

    const imagesJson = JSON.stringify(uploadedNames);

    const [result] = await pool.execute<ResultSetHeader>(
      `INSERT INTO section_gallery (
        order_id,
        user_email,
        small_title,
        title,
        images_json
      ) VALUES (?, ?, ?, ?, CAST(? AS JSON))`,
      [orderId, userEmailRaw, smallTitle, title, imagesJson]
    );

    return NextResponse.json({ success: true, id: result.insertId });
  } catch (error) {
    console.error("Error saving section_gallery", error);
    return NextResponse.json(
      { success: false, error: "Failed to save section" },
      { status: 500 }
    );
  }
}
