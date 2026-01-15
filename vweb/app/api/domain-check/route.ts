import { NextResponse } from "next/server";
import { Resolver } from "dns/promises";

export const runtime = "nodejs";

export async function POST(request: Request) {
	try {
		const body = await request.json();
		const domainRaw = typeof body.domain === "string" ? body.domain : "";
		const domain = domainRaw.trim();

		if (!domain) {
			return NextResponse.json({ error: "Domain required" }, { status: 400 });
		}

		const resolver = new Resolver();

		try {
			// Skúsí vyriešiť DNS záznam
			await resolver.resolve(domain, "A");

			// Ak DNS nájde záznam, doména je zaregistrovaná
			return NextResponse.json({
				available: false,
				domain,
				message: "Domain is already registered",
			});
		} catch (error) {
			// Ak DNS nenájde záznam, doména je voľná
			return NextResponse.json({
				available: true,
				domain,
				message: "Domain is available for registration",
			});
		}
	} catch (error) {
		console.error("Domain check error", error);
		return NextResponse.json({ error: "Server error" }, { status: 500 });
	}
}
