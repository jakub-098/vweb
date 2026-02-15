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

    // Today stats (single day)
      const [todayRows] = await pool.query<any[]>(
        `SELECT
          SUM(config) AS config,
          SUM(upload) AS upload,
          SUM(purchase) AS purchase,
          SUM(main) AS main
         FROM analytics
         WHERE id = DATE_FORMAT(CURDATE(), '%Y%m%d')`
      );

    // Week-to-date stats (Monday-Sunday) based on daily rows.
    // id is stored as a daily key in format YYYYMMDD to make range queries easy.
      const [weekRows] = await pool.query<any[]>(
        `SELECT
          SUM(config) AS config,
          SUM(upload) AS upload,
          SUM(purchase) AS purchase,
          SUM(main) AS main
         FROM analytics
         WHERE id BETWEEN DATE_FORMAT(DATE_SUB(CURDATE(), INTERVAL WEEKDAY(CURDATE()) DAY), '%Y%m%d')
                     AND DATE_FORMAT(DATE_ADD(DATE_SUB(CURDATE(), INTERVAL WEEKDAY(CURDATE()) DAY), INTERVAL 6 DAY), '%Y%m%d')`
      );

    const today = Array.isArray(todayRows) && todayRows.length > 0
        ? todayRows[0]
        : { config: 0, upload: 0, purchase: 0, main: 0 };
    const week = Array.isArray(weekRows) && weekRows.length > 0
        ? weekRows[0]
        : { config: 0, upload: 0, purchase: 0, main: 0 };

    // Last 7 days (including today) for config only
      const [dailyRows] = await pool.query<any[]>(
        `SELECT id, config, main
         FROM analytics
         WHERE id BETWEEN DATE_FORMAT(DATE_SUB(CURDATE(), INTERVAL 6 DAY), '%Y%m%d')
                     AND DATE_FORMAT(CURDATE(), '%Y%m%d')
         ORDER BY id ASC`
      );

    return NextResponse.json({
      success: true,
      analyticsToday: today,
      analyticsWeek: week,
      analyticsDaily: dailyRows ?? [],
    });
  } catch (error) {
    console.error("Failed to load analytics", error);
    return NextResponse.json(
      { success: false, error: "Failed to load analytics" },
      { status: 500 }
    );
  }
}
