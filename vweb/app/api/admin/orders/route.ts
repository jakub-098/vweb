import { NextResponse } from "next/server";
import pool from "@/lib/db";

function checkAdminPassword(request: Request): boolean {
  const configured = process.env.PASSWORD;
  if (!configured) return false;
  const header = request.headers.get("x-admin-password") ?? "";
  return header === configured;
}

export async function GET(request: Request) {
  try {
    if (!checkAdminPassword(request)) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const [rows] = await pool.query<any[]>(
    "SELECT id, user_email, total_price, status, delivery_speed FROM orders WHERE status IS NOT NULL ORDER BY CASE WHEN status = 0 THEN 0 WHEN status = 1 THEN 1 WHEN status = 3 THEN 2 WHEN status = 2 THEN 3 ELSE 4 END, created_at DESC, id DESC"
  );

    return NextResponse.json({ success: true, orders: rows });
  } catch (error) {
    console.error("Failed to list admin orders", error);
    return NextResponse.json(
      { success: false, error: "Failed to load orders" },
      { status: 500 }
    );
  }
}
