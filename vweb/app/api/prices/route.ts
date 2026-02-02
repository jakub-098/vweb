import { NextResponse } from "next/server";
import pool from "@/lib/db";

interface PriceRow {
  code: string;
  amount: number;
}

export async function GET() {
  try {
  const [rows] = await pool.query(
    "SELECT code, amount FROM prices"
  );

  return NextResponse.json({ prices: rows as PriceRow[] });
  } catch (error) {
    console.error("Error fetching prices", error);
    return NextResponse.json(
      { error: "Failed to fetch prices" },
      { status: 500 }
    );
  }
}
