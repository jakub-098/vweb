import { NextResponse } from "next/server";
import { headers } from "next/headers";
import type Stripe from "stripe";

import { stripe } from "@/lib/stripe";

export const runtime = "nodejs";

function getRequestOrigin(headersList: Headers): string {
  const origin = headersList.get("origin");
  if (origin) return origin;

  const host = headersList.get("host");
  if (!host) return "";

  const proto = headersList.get("x-forwarded-proto") ?? "https";
  return `${proto}://${host}`;
}

type CreateCheckoutSessionBody = {
  priceId?: unknown;
  quantity?: unknown;
  orderId?: unknown;
  customerEmail?: unknown;
  promoPercent?: unknown;
  packageName?: unknown;
  orderDraft?: unknown;
};

function asTrimmedString(value: unknown, maxLen = 500): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  if (!trimmed) return null;
  return trimmed.length > maxLen ? trimmed.slice(0, maxLen) : trimmed;
}

function as01Flag(value: unknown): "0" | "1" | null {
  if (typeof value === "boolean") return value ? "1" : "0";
  if (typeof value === "number") return value !== 0 ? "1" : "0";
  if (typeof value === "string") {
    const v = value.trim().toLowerCase();
    if (v === "1" || v === "true") return "1";
    if (v === "0" || v === "false") return "0";
  }
  return null;
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as CreateCheckoutSessionBody;

    const priceId = typeof body.priceId === "string" ? body.priceId.trim() : "";
    if (!priceId || !priceId.startsWith("price_")) {
      return NextResponse.json(
        { error: "Missing or invalid priceId" },
        { status: 400 }
      );
    }

    const quantityRaw = typeof body.quantity === "number" ? body.quantity : 1;
    const quantity = Number.isFinite(quantityRaw) && quantityRaw > 0 ? Math.floor(quantityRaw) : 1;

    const orderIdRaw =
      typeof body.orderId === "number"
        ? body.orderId
        : typeof body.orderId === "string"
          ? Number(body.orderId)
          : null;
    const orderId = orderIdRaw && Number.isFinite(orderIdRaw) ? Math.trunc(orderIdRaw) : null;

    const customerEmail =
      typeof body.customerEmail === "string" && body.customerEmail.trim().length > 0
        ? body.customerEmail.trim()
        : undefined;

    const promoPercentRaw =
      typeof body.promoPercent === "number"
        ? body.promoPercent
        : typeof body.promoPercent === "string"
          ? Number(body.promoPercent)
          : null;
    const promoPercent =
      promoPercentRaw != null && Number.isFinite(promoPercentRaw) && promoPercentRaw > 0 && promoPercentRaw < 100
        ? Number(promoPercentRaw)
        : null;

    const packageName =
      typeof body.packageName === "string" && body.packageName.trim().length > 0
        ? body.packageName.trim()
        : undefined;

    const headersList = await headers();
    const origin = getRequestOrigin(new Headers(headersList));

    if (!origin) {
      return NextResponse.json(
        { error: "Failed to determine request origin" },
        { status: 400 }
      );
    }

    const metadata: Record<string, string> = {};
    if (orderId != null) metadata.orderId = String(orderId);
    if (packageName) metadata.packageName = packageName;
    if (promoPercent != null) metadata.promoPercent = String(promoPercent);

    // Optional order draft data: used to create the DB order only after successful payment.
    if (body.orderDraft && typeof body.orderDraft === "object") {
      const draft = body.orderDraft as Record<string, unknown>;

      const theme = asTrimmedString(draft.theme, 16);
      if (theme) metadata.draft_theme = theme;

      const accentColor = asTrimmedString(draft.accentColor, 64);
      if (accentColor) metadata.draft_accent_color = accentColor;

      const customFont = asTrimmedString(draft.customFont, 128);
      if (customFont) metadata.draft_custom_font = customFont;

      const userEmail = asTrimmedString(draft.userEmail, 320);
      if (userEmail) metadata.draft_user_email = userEmail;

      const deliverySpeed = asTrimmedString(draft.deliverySpeed, 8);
      if (deliverySpeed) metadata.draft_delivery_speed = deliverySpeed;

      const domainOption = asTrimmedString(draft.domainOption, 16);
      if (domainOption) metadata.draft_domain_option = domainOption;

      const domainOwn = asTrimmedString(draft.domainOwn, 255);
      if (domainOwn) metadata.draft_domain_own = domainOwn;

      const domainRequest = asTrimmedString(draft.domainRequest, 255);
      if (domainRequest) metadata.draft_domain_request = domainRequest;

      const hostingOption = asTrimmedString(draft.hostingOption, 32);
      if (hostingOption) metadata.draft_hosting_option = hostingOption;

      const mailOption = asTrimmedString(draft.mailOption, 32);
      if (mailOption) metadata.draft_mail_option = mailOption;

      const sectionAbout = as01Flag(draft.sectionAbout);
      if (sectionAbout) metadata.draft_section_about = sectionAbout;
      const sectionCards = as01Flag(draft.sectionCards);
      if (sectionCards) metadata.draft_section_cards = sectionCards;
      const sectionFaq = as01Flag(draft.sectionFaq);
      if (sectionFaq) metadata.draft_section_faq = sectionFaq;
      const sectionGallery = as01Flag(draft.sectionGallery);
      if (sectionGallery) metadata.draft_section_gallery = sectionGallery;
      const sectionOffer = as01Flag(draft.sectionOffer);
      if (sectionOffer) metadata.draft_section_offer = sectionOffer;
      const sectionContactForm = as01Flag(draft.sectionContactForm);
      if (sectionContactForm) metadata.draft_section_contact_form = sectionContactForm;

      const isCompany = as01Flag(draft.is_company);
      if (isCompany) metadata.draft_is_company = isCompany;
      const companyName = asTrimmedString(draft.company_name, 255);
      if (companyName) metadata.draft_company_name = companyName;
      const companyAddress = asTrimmedString(draft.company_address, 255);
      if (companyAddress) metadata.draft_company_address = companyAddress;
      const ico = asTrimmedString(draft.ico, 32);
      if (ico) metadata.draft_ico = ico;
      const dic = asTrimmedString(draft.dic, 32);
      if (dic) metadata.draft_dic = dic;
    }

    let discounts: Stripe.Checkout.SessionCreateParams.Discount[] | undefined;

    if (promoPercent != null) {
      const coupon = await stripe.coupons.create({
        percent_off: promoPercent,
        duration: "once",
        max_redemptions: 1,
        name: "Promo zľava",
        metadata,
      });

      discounts = [{ coupon: coupon.id }];
    }

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: [{ price: priceId, quantity }],
      success_url: `${origin}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/cancel`,
      customer_email: customerEmail,
      client_reference_id: orderId != null ? String(orderId) : undefined,
      metadata,
      discounts,
      // Ensures we can display purchased items on the Success page
      // without additional Stripe calls.
      // (We still retrieve with expand, but having metadata helps.)
    });

    return NextResponse.json({ id: session.id, url: session.url });
  } catch (err: unknown) {
    const e = err as { message?: unknown; statusCode?: unknown };
    const message = typeof e?.message === "string" ? e.message : "Unknown error";
    const status = typeof e?.statusCode === "number" ? e.statusCode : 500;

    return NextResponse.json({ error: message }, { status });
  }
}

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const sessionId = url.searchParams.get("session_id")?.trim();

    if (!sessionId || !sessionId.startsWith("cs_")) {
      return NextResponse.json(
        { error: "Missing or invalid session_id" },
        { status: 400 }
      );
    }

    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ["line_items", "payment_intent"],
    });

    return NextResponse.json({
      id: session.id,
      status: session.status,
      payment_status: session.payment_status,
      currency: session.currency,
      amount_total: session.amount_total,
      customer_details: session.customer_details,
      customer_email: session.customer_email,
      line_items: session.line_items,
      metadata: session.metadata,
    });
  } catch (err: unknown) {
    const e = err as { message?: unknown; statusCode?: unknown };
    const message = typeof e?.message === "string" ? e.message : "Unknown error";
    const status = typeof e?.statusCode === "number" ? e.statusCode : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
