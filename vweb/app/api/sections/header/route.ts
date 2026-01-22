import { NextResponse } from "next/server";
import type { ResultSetHeader } from "mysql2";
import pool from "@/lib/db";
import { uploadFileToSpace, deleteFileFromSpace } from "@/lib/storage";

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const orderId = Number(url.searchParams.get("orderId"));

    if (!orderId) {
      return NextResponse.json(
        { success: false, error: "orderId is required" },
        { status: 400 },
      );
    }

    const [rows] = await pool.query<any[]>(
      "SELECT * FROM section_header WHERE order_id = ? ORDER BY id DESC LIMIT 1",
      [orderId],
    );

    if (!Array.isArray(rows) || rows.length === 0) {
      return NextResponse.json({ success: true, found: false });
    }

    return NextResponse.json({ success: true, found: true, section: rows[0] });
  } catch (error) {
    console.error("Error loading section_header", error);
    return NextResponse.json(
      { success: false, error: "Failed to load section" },
      { status: 500 },
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
        { status: 400 },
      );
    }

    const smallTitle = String(formData.get("smallTitle") ?? "").trim();
    const title = String(formData.get("title") ?? "").trim();
    const text = String(formData.get("text") ?? "").trim();

    const imageFile = formData.get("image") as File | null;

    if (!smallTitle || !title || !text) {
      return NextResponse.json(
        { success: false, error: "Missing required content" },
        { status: 400 },
      );
    }

    // load previous image (if any) so we can reuse it when no new file is uploaded
    let previousImageName = "";
    let previousEmail = userEmailRaw;
    try {
      const [rows] = await pool.query<any[]>(
        "SELECT image_name, user_email FROM section_header WHERE order_id = ? ORDER BY id DESC LIMIT 1",
        [orderId],
      );
      if (Array.isArray(rows) && rows.length > 0) {
        const row = rows[0] as any;
        previousImageName = (row.image_name as string | undefined) ?? "";
        previousEmail = (row.user_email as string | undefined) ?? userEmailRaw;
      }
    } catch (lookupError) {
      console.error("Failed to load previous section_header image", lookupError);
    }

    let imageName = previousImageName;
    if (imageFile) {
      // we are replacing the previous file – delete it first if it exists
      if (previousImageName && previousImageName.trim().length > 0) {
        try {
          await deleteFileFromSpace({
            email: previousEmail,
            sectionKey: "section_header",
            fileName: previousImageName,
          });
        } catch (cleanupError) {
          console.error("Failed to delete previous section_header image", cleanupError);
        }
      }

      await uploadFileToSpace({
        file: imageFile,
        email: userEmailRaw,
        sectionKey: "section_header",
      });
      imageName = imageFile.name;
    }

    const [result] = await pool.execute<ResultSetHeader>(
      `INSERT INTO section_header (
        order_id,
        user_email,
        small_title,
        title,
        text,
        image_name
      ) VALUES (?, ?, ?, ?, ?, ?)`,
      [orderId, userEmailRaw, smallTitle, title, text, imageName],
    );

    return NextResponse.json({ success: true, id: result.insertId });
  } catch (error) {
    console.error("Error saving section_header", error);
    return NextResponse.json(
      { success: false, error: "Failed to save section" },
      { status: 500 },
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const url = new URL(request.url);
    const orderId = Number(url.searchParams.get("orderId"));

    if (!orderId) {
      return NextResponse.json(
        { success: false, error: "orderId is required" },
        { status: 400 },
      );
    }

    const [rows] = await pool.query<any[]>(
      "SELECT id, image_name, user_email FROM section_header WHERE order_id = ? ORDER BY id DESC LIMIT 1",
      [orderId],
    );

    if (!Array.isArray(rows) || rows.length === 0) {
      return NextResponse.json({ success: true, found: false });
    }

    const row = rows[0] as any;
    const id = row.id as number;
    const imageName: string = (row.image_name as string | undefined) ?? "";
    const email: string = (row.user_email as string | undefined) ?? "";

    if (imageName && imageName.trim().length > 0 && email) {
      try {
        await deleteFileFromSpace({
          email,
          sectionKey: "section_header",
          fileName: imageName,
        });
      } catch (err) {
        console.error("Failed to delete section_header image from storage", err);
      }
    }

    await pool.execute<ResultSetHeader>(
      "UPDATE section_header SET image_name = '' WHERE id = ?",
      [id],
    );

    return NextResponse.json({ success: true, found: true });
  } catch (error) {
    console.error("Error deleting section_header image", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete image" },
      { status: 500 },
    );
  }
}
