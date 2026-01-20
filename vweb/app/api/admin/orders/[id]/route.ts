import { NextResponse } from "next/server";
import pool from "@/lib/db";

function checkAdminPassword(request: Request): boolean {
  const configured = process.env.PASSWORD;
  if (!configured) return false;
  const header = request.headers.get("x-admin-password") ?? "";
  return header === configured;
}
export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    if (!checkAdminPassword(request)) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await context.params;
    const idNum = Number(id);
    if (!idNum || Number.isNaN(idNum)) {
      return NextResponse.json(
        { success: false, error: "Invalid id" },
        { status: 400 }
      );
    }

    const [rows] = await pool.query<any[]>(
      "SELECT * FROM orders WHERE id = ? AND status IS NOT NULL LIMIT 1",
      [idNum]
    );

    if (!Array.isArray(rows) || rows.length === 0) {
      return NextResponse.json({ success: false, error: "Not found" }, { status: 404 });
    }

    const order = rows[0];
    return NextResponse.json({ success: true, order });
  } catch (error) {
    console.error("Failed to load admin order detail", error);
    return NextResponse.json(
      { success: false, error: "Failed to load order" },
      { status: 500 }
    );
  }
}
