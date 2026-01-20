import { NextResponse } from "next/server";
import type { ResultSetHeader } from "mysql2";
import pool from "@/lib/db";

export async function POST(request: Request) {
	try {
		const body = await request.json();

		const theme: "tmava" | "svetla" = body.theme ?? "tmava";
		const accentColorBase:
			| "purple"
			| "blue"
			| "green"
			| "orange"
			| "pink"
			| "red"
			| "yellow"
			| "teal"
			| "gray" = body.accentColor ?? "purple";
		const accentCustom: string | null =
			typeof body.accentCustom === "string" && body.accentCustom.trim().length > 0
				? body.accentCustom.trim()
				: null;
		const accentToStore = accentCustom ?? accentColorBase;

		const hostingOption: "potrebujem" | "mam" =
			body.hostingOption ?? "potrebujem";
		const mailOption: "potrebujem" | "mam" =
			body.mailOption ?? "potrebujem";

		const mailLocalPart: string | null =
			mailOption === "potrebujem" && typeof body.mailLocalPart === "string" && body.mailLocalPart.trim().length > 0
				? body.mailLocalPart.trim()
				: null;

		const sectionAbout: boolean = !!body.sectionAbout;
		const sectionCards: boolean = !!body.sectionCards;
		const sectionFaq: boolean = !!body.sectionFaq;
		const sectionGallery: boolean = !!body.sectionGallery;
		const sectionOffer: boolean = !!body.sectionOffer;
		const sectionContactForm: boolean = !!body.sectionContactForm;

		const customFont: string | null =
			typeof body.customFont === "string" && body.customFont.trim().length > 0
				? body.customFont.trim()
				: null;

		const userEmail: string | null =
			typeof body.userEmail === "string" && body.userEmail.trim().length > 0
				? body.userEmail.trim()
				: null;

		const totalPrice: number | null =
			typeof body.totalPrice === "number" && !Number.isNaN(body.totalPrice)
				? body.totalPrice
				: null;

		const deliverySpeed: "24h" | "48h" = body.deliverySpeed === "24h" ? "24h" : "48h";

		let domainOption: "own" | "request" = "own";
		if (body.domainOption === "request") {
			domainOption = "request";
		}
		const domainOwn: string | null =
			domainOption === "own" && typeof body.domainOwn === "string" && body.domainOwn.trim().length > 0
				? body.domainOwn.trim()
				: null;
		const domainRequest: string | null =
			domainOption === "request" &&
			typeof body.domainRequest === "string" &&
			body.domainRequest.trim().length > 0
				? body.domainRequest.trim()
				: null;

		const [result] = await pool.execute<ResultSetHeader>(
			`INSERT INTO orders (
				section_about,
				section_cards,
				section_faq,
				section_gallery,
				section_offer,
				section_contact_form,
				theme,
				accent_color,
				custom_font,
				domain_option,
				domain_own,
				domain_request,
				hosting_option,
				mail_option,
				mail_local_part,
				user_email,
				total_price,
				delivery_speed
			) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
			[
				sectionAbout ? 1 : 0,
				sectionCards ? 1 : 0,
				sectionFaq ? 1 : 0,
				sectionGallery ? 1 : 0,
				sectionOffer ? 1 : 0,
				sectionContactForm ? 1 : 0,
				theme,
				accentToStore,
				customFont,
				domainOption,
				domainOwn,
				domainRequest,
				hostingOption,
				mailOption,
				mailLocalPart,
				userEmail,
				totalPrice,
				deliverySpeed,
			]
		);

		return NextResponse.json({
			success: true,
			orderId: result.insertId,
		});
	} catch (error) {
		console.error("Error creating order", error);
		return NextResponse.json(
			{
				success: false,
				error: "Failed to create order",
			},
			{ status: 500 }
		);
	}
}
