import { NextResponse } from "next/server";
import pool from "@/lib/db";

// Helper endpoint you can call from a cron job every day at 01:00
// to ensure there's an explicit analytics row for the current day
// with all counters set to zero.
export async function POST() {
  try {
    await pool.query(
      "INSERT IGNORE INTO analytics (id, config, upload, purchase) VALUES (DATE_FORMAT(CURDATE(), '%Y%m%d'), 0, 0, 0)",
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to init today's analytics row", error);
    return NextResponse.json(
      { success: false, error: "Failed to init today's analytics row" },
      { status: 500 },
    );
  }
}
