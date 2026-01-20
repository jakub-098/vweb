import { NextResponse } from "next/server";
import pool from "@/lib/db";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const rawId = body.orderId;
    const rawStatus = body.status;

    const orderId = Number(rawId);
    const status = Number(rawStatus);

    if (!orderId || Number.isNaN(orderId)) {
      return NextResponse.json(
        { success: false, error: "Missing or invalid orderId" },
        { status: 400 }
      );
    }

    if (![0, 1, 2].includes(status)) {
      return NextResponse.json(
        { success: false, error: "Invalid status" },
        { status: 400 }
      );
    }

    await pool.query("UPDATE orders SET status = ? WHERE id = ?", [status, orderId]);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to update order status", error);
    return NextResponse.json(
      { success: false, error: "Failed to update status" },
      { status: 500 }
    );
  }
}
