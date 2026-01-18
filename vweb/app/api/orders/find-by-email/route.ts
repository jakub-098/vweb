import { NextResponse } from "next/server";
import pool from "@/lib/db";

export async function POST(request: Request) {
	try {
		const body = await request.json();
		const emailRaw = typeof body.email === "string" ? body.email.trim() : "";

		if (!emailRaw) {
			return NextResponse.json(
				{ success: false, error: "Email is required" },
				{ status: 400 }
			);
		}

		const [rows] = await pool.query<any[]>(
			"SELECT * FROM orders WHERE user_email = ? ORDER BY id DESC LIMIT 1",
			[emailRaw]
		);

		if (!Array.isArray(rows) || rows.length === 0) {
			return NextResponse.json({ success: false, found: false });
		}

		const order = rows[0];
		return NextResponse.json({
			success: true,
			found: true,
			orderId: order.id,
			order,
		});
	} catch (error) {
		console.error("Error looking up order by email", error);
		return NextResponse.json(
			{ success: false, error: "Failed to look up order" },
			{ status: 500 }
		);
	}
}
