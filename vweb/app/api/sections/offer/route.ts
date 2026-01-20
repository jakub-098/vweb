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
      "SELECT * FROM section_offer WHERE order_id = ? ORDER BY id DESC LIMIT 1",
      [orderId]
    );

    if (!Array.isArray(rows) || rows.length === 0) {
      return NextResponse.json({ success: true, found: false });
    }

    return NextResponse.json({ success: true, found: true, section: rows[0] });
  } catch (error) {
    console.error("Error loading section_offer", error);
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

    const rawItems = formData.get("items");
    const items = rawItems ? JSON.parse(String(rawItems)) : [];

    if (!smallTitle || !title || !text || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { success: false, error: "Missing required content" },
        { status: 400 }
      );
    }

    // load previous items so we can decide per-item whether to keep or replace images
    let previousItems: any[] = [];
    let previousEmail = userEmailRaw;
    try {
      const [rows] = await pool.query<any[]>(
        "SELECT items_json, user_email FROM section_offer WHERE order_id = ? ORDER BY id DESC LIMIT 1",
        [orderId]
      );
      if (Array.isArray(rows) && rows.length > 0) {
        const row = rows[0] as any;
        const json = row.items_json as any;
        previousEmail = (row.user_email as string | undefined) ?? userEmailRaw;
        if (typeof json === "string") {
          try {
            previousItems = JSON.parse(json) ?? [];
          } catch {
            previousItems = [];
          }
        } else if (Array.isArray(json)) {
          previousItems = json;
        }
      }
    } catch (lookupError) {
      console.error("Failed to load previous section_offer items", lookupError);
    }

    const itemsSanitized = await Promise.all(
      items.map(async (item: any, index: number) => {
        const titleValue = typeof item.title === "string" ? item.title.trim() : "";
        const textValue = typeof item.text === "string" ? item.text.trim() : "";

        const previous = previousItems[index] ?? {};
        const previousImageName: string = (previous.image_name as string | undefined) ?? "";

        const file = formData.get(`itemImage_${index}`) as File | null;
        let imageName = previousImageName;

        if (file) {
          // replacing image for this item – delete the old one if it exists
          if (previousImageName && previousImageName.trim().length > 0) {
            try {
              await deleteFileFromSpace({
                email: previousEmail,
                sectionKey: "section_offer",
                fileName: previousImageName,
              });
            } catch (cleanupError) {
              console.error("Failed to delete previous section_offer image", cleanupError);
            }
          }

          await uploadFileToSpace({
            file,
            email: userEmailRaw,
            sectionKey: "section_offer",
          });
          imageName = file.name;
        }

        return {
          title: titleValue,
          text: textValue,
          image_name: imageName,
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

export async function DELETE(request: Request) {
  try {
    const url = new URL(request.url);
    const orderId = Number(url.searchParams.get("orderId"));
    const rawIndex = url.searchParams.get("itemIndex");
    const itemIndex = rawIndex != null ? Number(rawIndex) : NaN;

    if (!orderId || Number.isNaN(itemIndex)) {
      return NextResponse.json(
        { success: false, error: "orderId and valid itemIndex are required" },
        { status: 400 },
      );
    }

    const [rows] = await pool.query<any[]>(
      "SELECT id, items_json, user_email FROM section_offer WHERE order_id = ? ORDER BY id DESC LIMIT 1",
      [orderId],
    );

    if (!Array.isArray(rows) || rows.length === 0) {
      return NextResponse.json({ success: true, found: false });
    }

    const row = rows[0] as any;
    const id = row.id as number;
    const email: string = (row.user_email as string | undefined) ?? "";
    let items: any[] = [];
    const raw = row.items_json as any;
    if (typeof raw === "string") {
      try {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) items = parsed;
      } catch {
        items = [];
      }
    } else if (Array.isArray(raw)) {
      items = raw;
    }

    if (!items[itemIndex]) {
      return NextResponse.json({ success: true, found: false });
    }

    const current = items[itemIndex] ?? {};
    const currentName: string = (current.image_name as string | undefined) ?? "";

    if (email && currentName && currentName.trim().length > 0) {
      try {
        await deleteFileFromSpace({
          email,
          sectionKey: "section_offer",
          fileName: currentName,
        });
      } catch (err) {
        console.error("Failed to delete section_offer image from storage", err);
      }
    }

    items[itemIndex] = {
      ...current,
      image_name: "",
    };

    await pool.execute<ResultSetHeader>(
      "UPDATE section_offer SET items_json = CAST(? AS JSON) WHERE id = ?",
      [JSON.stringify(items), id],
    );

    return NextResponse.json({ success: true, found: true });
  } catch (error) {
    console.error("Error deleting section_offer image", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete image" },
      { status: 500 },
    );
  }
}
