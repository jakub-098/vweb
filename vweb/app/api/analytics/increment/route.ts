import { NextResponse } from "next/server";
import pool from "@/lib/db";

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => null as any);
    const id = Number(body?.id);

    if (!id || ![1, 2, 3, 4].includes(id)) {
      return NextResponse.json({ success: false, error: "Invalid id" }, { status: 400 });
    }

    // Map ids 1,2,3,4 to the respective columns.
    // 1 = config page visits, 2 = upload, 3 = purchase, 4 = main page visits.
    const column = id === 1 ? "config" : id === 2 ? "upload" : id === 3 ? "purchase" : "main";

    // Increment the appropriate column for today's analytics row.
    // id is assumed to be a daily key (e.g. YYYYMMDD) with a UNIQUE or PRIMARY KEY.
    // If today's row doesn't exist yet, it is created with zeros and then incremented.
    await pool.query(
      `INSERT INTO analytics (id, config, upload, purchase, main)
       VALUES (DATE_FORMAT(CURDATE(), '%Y%m%d'), 0, 0, 0, 0)
       ON DUPLICATE KEY UPDATE ${column} = ${column} + 1`,
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to increment analytics", error);
    return NextResponse.json(
      { success: false, error: "Failed to increment analytics" },
      { status: 500 }
    );
  }
}
