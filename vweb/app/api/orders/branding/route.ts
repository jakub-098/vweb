import { NextResponse } from "next/server";
import type { ResultSetHeader } from "mysql2";
import pool from "@/lib/db";
import { deleteFileFromSpace, uploadFileToSpace } from "@/lib/storage";

async function ensureBrandingTable() {
	await pool.execute(
		`CREATE TABLE IF NOT EXISTS order_branding (
			order_id INT NOT NULL,
			user_email VARCHAR(255) NULL,
			logo_name VARCHAR(255) NULL,
			note TEXT NULL,
			updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
			PRIMARY KEY (order_id)
		)`,
	);
}

export async function GET(request: Request) {
	try {
		const url = new URL(request.url);
		const orderId = Number(url.searchParams.get("orderId"));
		if (!orderId) {
			return NextResponse.json(
				{ success: false, error: "orderId is required" },
				{ status: 400 },
			);
		}

		await ensureBrandingTable();
		const [rows] = await pool.query<any[]>(
			"SELECT logo_name, note FROM order_branding WHERE order_id = ? LIMIT 1",
			[orderId],
		);
		if (!Array.isArray(rows) || rows.length === 0) {
			return NextResponse.json({ success: true, found: false, logoName: null, note: "" });
		}
		const row = rows[0] as any;
		return NextResponse.json({
			success: true,
			found: true,
			logoName: typeof row.logo_name === "string" ? row.logo_name : null,
			note: typeof row.note === "string" ? row.note : "",
		});
	} catch (error) {
		console.error("Error loading order branding", error);
		return NextResponse.json(
			{ success: false, error: "Failed to load branding" },
			{ status: 500 },
		);
	}
}

export async function POST(request: Request) {
	try {
		const formData = await request.formData();
		const orderId = Number(formData.get("orderId"));
		const userEmailRaw = String(formData.get("userEmail") ?? "").trim();
		const noteRaw = String(formData.get("note") ?? "");
		const note = noteRaw.trim().length > 0 ? noteRaw.trim() : null;
		const logoFile = formData.get("logo") as File | null;

		if (!orderId || !userEmailRaw) {
			return NextResponse.json(
				{ success: false, error: "orderId and userEmail are required" },
				{ status: 400 },
			);
		}

		await ensureBrandingTable();

		// load previous logo so we can clean it up when replacing
		let previousLogoName = "";
		let previousEmail = userEmailRaw;
		try {
			const [rows] = await pool.query<any[]>(
				"SELECT logo_name, user_email FROM order_branding WHERE order_id = ? LIMIT 1",
				[orderId],
			);
			if (Array.isArray(rows) && rows.length > 0) {
				const row = rows[0] as any;
				previousLogoName = (row.logo_name as string | undefined) ?? "";
				previousEmail = (row.user_email as string | undefined) ?? userEmailRaw;
			}
		} catch (lookupErr) {
			console.error("Failed to load existing order branding", lookupErr);
		}

		let nextLogoName: string | null = previousLogoName || null;
		if (logoFile) {
			if (previousLogoName && previousLogoName.trim().length > 0) {
				try {
					await deleteFileFromSpace({
						email: previousEmail,
						sectionKey: "order_branding",
						fileName: previousLogoName,
					});
				} catch (cleanupErr) {
					console.error("Failed to delete previous branding logo", cleanupErr);
				}
			}

			await uploadFileToSpace({
				file: logoFile,
				email: userEmailRaw,
				sectionKey: "order_branding",
			});
			nextLogoName = logoFile.name;
		}

		await pool.execute<ResultSetHeader>(
			`INSERT INTO order_branding (order_id, user_email, logo_name, note)
			 VALUES (?, ?, ?, ?)
			 ON DUPLICATE KEY UPDATE user_email = VALUES(user_email), logo_name = VALUES(logo_name), note = VALUES(note)`,
			[orderId, userEmailRaw, nextLogoName, note],
		);

		return NextResponse.json({ success: true, logoName: nextLogoName, note: note ?? "" });
	} catch (error) {
		console.error("Error saving order branding", error);
		return NextResponse.json(
			{ success: false, error: "Failed to save branding" },
			{ status: 500 },
		);
	}
}
