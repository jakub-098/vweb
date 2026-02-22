import { NextResponse } from "next/server";
import type { ResultSetHeader } from "mysql2";
import pool from "@/lib/db";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const orderId = Number(body.orderId);
    if (!orderId) {
      return NextResponse.json(
        { success: false, error: "orderId is required" },
        { status: 400 }
      );
    }

		// Load current order so we can support partial updates safely
		const [existingRows] = await pool.query<any[]>(
			"SELECT * FROM orders WHERE id = ? LIMIT 1",
			[orderId]
		);
		if (!Array.isArray(existingRows) || existingRows.length === 0) {
			return NextResponse.json(
				{ success: false, error: "Order not found" },
				{ status: 404 },
			);
		}
		const existing = existingRows[0] as any;

    const theme: "tmava" | "svetla" =
			body.theme === "svetla" || body.theme === "tmava"
				? body.theme
				: (existing.theme === "svetla" ? "svetla" : "tmava");
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
    const accentToStore =
			accentCustom != null
				? accentCustom
				: (typeof body.accentColor === "string" && body.accentColor.trim().length > 0)
					? accentColorBase
					: (typeof existing.accent_color === "string" && existing.accent_color.trim().length > 0)
						? existing.accent_color
						: "purple";

    const hostingOption: "potrebujem" | "mam" =
      body.hostingOption === "mam" || body.hostingOption === "potrebujem"
				? body.hostingOption
				: (existing.hosting_option === "mam" ? "mam" : "potrebujem");
    const mailOption: "potrebujem" | "mam" =
      body.mailOption === "mam" || body.mailOption === "potrebujem"
				? body.mailOption
				: (existing.mail_option === "mam" ? "mam" : "potrebujem");

    const mailLocalPart: string | null = null;

    const sectionAbout: boolean =
			typeof body.sectionAbout === "boolean"
				? body.sectionAbout
				: Boolean(existing.section_about);
    const sectionCards: boolean =
			typeof body.sectionCards === "boolean"
				? body.sectionCards
				: Boolean(existing.section_cards);
    const sectionFaq: boolean =
			typeof body.sectionFaq === "boolean"
				? body.sectionFaq
				: Boolean(existing.section_faq);
    const sectionGallery: boolean =
			typeof body.sectionGallery === "boolean"
				? body.sectionGallery
				: Boolean(existing.section_gallery);
    const sectionOffer: boolean =
			typeof body.sectionOffer === "boolean"
				? body.sectionOffer
				: Boolean(existing.section_offer);
    const sectionContactForm: boolean =
			typeof body.sectionContactForm === "boolean"
				? body.sectionContactForm
				: Boolean(existing.section_contact_form);

    const customFont: string | null =
      typeof body.customFont === "string" && body.customFont.trim().length > 0
        ? body.customFont.trim()
        : (typeof existing.custom_font === "string" && existing.custom_font.trim().length > 0)
				? existing.custom_font
				: null;

    let domainOption: "own" | "request" = "own";
    if (body.domainOption === "request" || body.domainOption === "own") {
			domainOption = body.domainOption;
		} else {
			domainOption = existing.domain_option === "request" ? "request" : "own";
		}
    const domainOwn: string | null =
      domainOption === "own" && typeof body.domainOwn === "string" && body.domainOwn.trim().length > 0
        ? body.domainOwn.trim()
        : (domainOption === "own" && typeof existing.domain_own === "string" && existing.domain_own.trim().length > 0)
				? existing.domain_own
				: null;
    const domainRequest: string | null =
      domainOption === "request" &&
      typeof body.domainRequest === "string" &&
      body.domainRequest.trim().length > 0
        ? body.domainRequest.trim()
        : (domainOption === "request" && typeof existing.domain_request === "string" && existing.domain_request.trim().length > 0)
				? existing.domain_request
				: null;

    const userEmail: string | null =
      typeof body.userEmail === "string" && body.userEmail.trim().length > 0
        ? body.userEmail.trim()
        : (typeof existing.user_email === "string" && existing.user_email.trim().length > 0)
				? existing.user_email
				: null;

    const totalPrice: number | null =
      typeof body.totalPrice === "number" && !Number.isNaN(body.totalPrice)
        ? body.totalPrice
        : (existing.total_price != null && !Number.isNaN(Number(existing.total_price)))
				? Number(existing.total_price)
				: null;

    const deliverySpeed: "24h" | "48h" =
			body.deliverySpeed === "24h" || body.deliverySpeed === "48h"
				? body.deliverySpeed
				: (existing.delivery_speed === "24h" ? "24h" : "48h");

    const [result] = await pool.execute<ResultSetHeader>(
      `UPDATE orders SET
        section_about = ?,
        section_cards = ?,
        section_faq = ?,
        section_gallery = ?,
        section_offer = ?,
        section_contact_form = ?,
        theme = ?,
        accent_color = ?,
        custom_font = ?,
        domain_option = ?,
        domain_own = ?,
        domain_request = ?,
        hosting_option = ?,
        mail_option = ?,
        mail_local_part = ?,
        user_email = ?,
        total_price = ?,
        delivery_speed = ?
      WHERE id = ?`,
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
        orderId,
      ]
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating order", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to update order",
      },
      { status: 500 }
    );
  }
}
