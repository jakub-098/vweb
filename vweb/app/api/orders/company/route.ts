import { NextResponse } from "next/server";
import pool from "@/lib/db";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const orderId = Number(body.orderId);
    if (!orderId) {
      return NextResponse.json({ success: false, error: "orderId is required" }, { status: 400 });
    }

    const isCompany: boolean = !!body.is_company;
    const companyName: string | null = typeof body.company_name === "string" && body.company_name.trim().length > 0 ? body.company_name.trim() : null;
    const companyAddress: string | null = typeof body.company_address === "string" && body.company_address.trim().length > 0 ? body.company_address.trim() : null;
    const ico: string | null = typeof body.ico === "string" && body.ico.trim().length > 0 ? body.ico.trim() : null;
    const dic: string | null = typeof body.dic === "string" && body.dic.trim().length > 0 ? body.dic.trim() : null;

    await pool.query(
      `UPDATE orders SET is_company = ?, company_name = ?, company_address = ?, ico = ?, dic = ? WHERE id = ?`,
      [isCompany ? 1 : 0, companyName, companyAddress, ico, dic, orderId]
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to update company fields", error);
    return NextResponse.json({ success: false, error: "Failed to update company fields" }, { status: 500 });
  }
}
