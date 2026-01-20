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
        { status: 400 }
      );
    }

    const [rows] = await pool.query<any[]>(
      "SELECT * FROM section_gallery WHERE order_id = ? ORDER BY id DESC LIMIT 1",
      [orderId]
    );

    if (!Array.isArray(rows) || rows.length === 0) {
      return NextResponse.json({ success: true, found: false });
    }

    return NextResponse.json({ success: true, found: true, section: rows[0] });
  } catch (error) {
    console.error("Error loading section_gallery", error);
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

    // load previous image names (if any) so we can either reuse or replace them
    let previousNames: string[] = [];
    let previousEmail = userEmailRaw;
    try {
      const [rows] = await pool.query<any[]>(
        "SELECT images_json, user_email FROM section_gallery WHERE order_id = ? ORDER BY id DESC LIMIT 1",
        [orderId]
      );
      if (Array.isArray(rows) && rows.length > 0) {
        const row = rows[0] as any;
        const json = row.images_json as any;
        previousEmail = (row.user_email as string | undefined) ?? userEmailRaw;
        if (typeof json === "string") {
          try {
            previousNames = JSON.parse(json) ?? [];
          } catch {
            previousNames = [];
          }
        } else if (Array.isArray(json)) {
          previousNames = json;
        }
      }
    } catch (lookupError) {
      console.error("Failed to load previous section_gallery images", lookupError);
    }

    const uploadedNames: string[] = [];

    if (imageFiles.length > 0) {
      // user uploaded new gallery images – replace the old set
      for (const name of previousNames) {
        if (typeof name === "string" && name.trim().length > 0) {
          try {
            await deleteFileFromSpace({
              email: previousEmail,
              sectionKey: "section_gallery",
              fileName: name,
            });
          } catch (cleanupError) {
            console.error("Failed to delete previous section_gallery image", cleanupError);
          }
        }
      }

      for (const file of imageFiles) {
        await uploadFileToSpace({
          file,
          email: userEmailRaw,
          sectionKey: "section_gallery",
        });
        uploadedNames.push(file.name);
      }
    } else {
      // no new files – keep the previous set of images
      uploadedNames.push(...previousNames);
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

export async function DELETE(request: Request) {
  try {
    const url = new URL(request.url);
    const orderId = Number(url.searchParams.get("orderId"));
    const imageNameToDelete = url.searchParams.get("imageName") ?? "";

    if (!orderId || !imageNameToDelete) {
      return NextResponse.json(
        { success: false, error: "orderId and imageName are required" },
        { status: 400 },
      );
    }

    const [rows] = await pool.query<any[]>(
      "SELECT id, images_json, user_email FROM section_gallery WHERE order_id = ? ORDER BY id DESC LIMIT 1",
      [orderId],
    );

    if (!Array.isArray(rows) || rows.length === 0) {
      return NextResponse.json({ success: true, found: false });
    }

    const row = rows[0] as any;
    const id = row.id as number;
    const email: string = (row.user_email as string | undefined) ?? "";
    let names: string[] = [];
    const raw = row.images_json as any;
    if (typeof raw === "string") {
      try {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) names = parsed.filter((n: any) => typeof n === "string");
      } catch {
        names = [];
      }
    } else if (Array.isArray(raw)) {
      names = raw.filter((n: any) => typeof n === "string");
    }

    const filtered = names.filter((n) => n !== imageNameToDelete);

    if (email && imageNameToDelete && names.includes(imageNameToDelete)) {
      try {
        await deleteFileFromSpace({
          email,
          sectionKey: "section_gallery",
          fileName: imageNameToDelete,
        });
      } catch (err) {
        console.error("Failed to delete section_gallery image from storage", err);
      }
    }

    await pool.execute<ResultSetHeader>(
      "UPDATE section_gallery SET images_json = CAST(? AS JSON) WHERE id = ?",
      [JSON.stringify(filtered), id],
    );

    return NextResponse.json({ success: true, found: true });
  } catch (error) {
    console.error("Error deleting section_gallery image", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete image" },
      { status: 500 },
    );
  }
}
