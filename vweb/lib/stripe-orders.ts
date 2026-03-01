import type Stripe from "stripe";
import type { ResultSetHeader, RowDataPacket } from "mysql2";

import pool from "@/lib/db";
import { sendPaymentReceivedEmail, type OrderForEmail } from "@/lib/mail";

type OrderRow = {
  id: number;
  status: number | null;
  user_email: string | null;
  total_price: number | null;
  delivery_speed: "24h" | "48h" | null;
  domain_option: "own" | "request" | null;
  domain_own: string | null;
  domain_request: string | null;
  created_at?: string | null;
};

const ALLOWED_ACCENTS = new Set([
  "purple",
  "blue",
  "green",
  "orange",
  "pink",
  "red",
  "yellow",
  "teal",
  "gray",
]);

function normalizeCustomAccentForDb(value: string): string | null {
  const trimmed = value.trim();
  if (!trimmed) return null;

  // Most common custom accent: #RRGGBB. Some DBs store only the 6 hex chars.
  const hex = trimmed.startsWith("#") ? trimmed.slice(1) : trimmed;
  if (/^[0-9a-fA-F]{6}$/.test(hex)) {
    return hex.toUpperCase();
  }

  return null;
}

function pickString(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

export async function finalizePaidCheckoutSession(
  session: Stripe.Checkout.Session
): Promise<{ orderId: number | null }> {
  if (session.payment_status !== "paid") {
    return { orderId: null };
  }

  const sessionKey = `stripe:${session.id}`;

  // Idempotency (webhooks retry; success page might also run): if we already have an order for
  // this sessionKey, only ensure status=1 and send emails once.
  const [existingRows] = await pool.query<RowDataPacket[]>(
    "SELECT id, status, user_email, total_price, delivery_speed, domain_option, domain_own, domain_request, created_at FROM orders WHERE mail_local_part = ? LIMIT 1",
    [sessionKey]
  );

  if (Array.isArray(existingRows) && existingRows.length > 0) {
    const current = existingRows[0] as OrderRow;

    if (current.status !== 1) {
      await pool.query("UPDATE orders SET status = ? WHERE id = ?", [1, current.id]);

      const orderForEmail: OrderForEmail = {
        id: current.id,
        user_email: current.user_email,
        total_price: current.total_price,
        delivery_speed: current.delivery_speed,
        domain_option: current.domain_option,
        domain_own: current.domain_own,
        domain_request: current.domain_request,
        created_at: current.created_at ?? null,
      };

      try {
        await sendPaymentReceivedEmail(orderForEmail, { notifyAdmin: true });
      } catch (emailError) {
        console.error("Stripe finalize: failed to send payment received email", emailError);
      }
    }

    return { orderId: current.id };
  }

  const md = session.metadata ?? {};

  const draftUserEmail = pickString(md.draft_user_email);
  const stripeEmail = (session.customer_details?.email ?? session.customer_email ?? "").trim();
  const userEmail = (stripeEmail || draftUserEmail || "").trim() || null;

  const deliverySpeedRaw = pickString(md.draft_delivery_speed);
  const deliverySpeed: "24h" | "48h" = deliverySpeedRaw === "24h" ? "24h" : "48h";

  const domainOptionRaw = pickString(md.draft_domain_option) || "request";
  const domainOption: "own" | "request" = domainOptionRaw === "own" ? "own" : "request";

  const domainOwn =
    domainOption === "own" && pickString(md.draft_domain_own).length > 0
      ? pickString(md.draft_domain_own)
      : null;
  const domainRequest =
    domainOption === "request" && pickString(md.draft_domain_request).length > 0
      ? pickString(md.draft_domain_request)
      : null;

  const theme = pickString(md.draft_theme) || "tmava";
  const accentTokenRaw = pickString(md.draft_accent_color);
  const accentCustomRaw = pickString(md.draft_accent_custom);

  const accentToken = ALLOWED_ACCENTS.has(accentTokenRaw) ? accentTokenRaw : "purple";

  // Original behavior: accentCustom ?? accentColor
  // - If custom is a hex code, normalize to 6 hex chars to avoid DB truncation.
  // - If older sessions stored the custom into draft_accent_color, support that too.
  const accentCustom =
    normalizeCustomAccentForDb(accentCustomRaw) ?? normalizeCustomAccentForDb(accentTokenRaw);

  const accentColor = accentCustom ?? accentToken;
  const customFont = pickString(md.draft_custom_font) || null;

  const hostingOption = pickString(md.draft_hosting_option) || "potrebujem";
  const mailOption = pickString(md.draft_mail_option) || "potrebujem";

  const section_about = md.draft_section_about === "1" ? 1 : 0;
  const section_cards = md.draft_section_cards === "1" ? 1 : 0;
  const section_faq = md.draft_section_faq === "1" ? 1 : 0;
  const section_gallery = md.draft_section_gallery === "1" ? 1 : 0;
  const section_offer = md.draft_section_offer === "1" ? 1 : 0;
  const section_contact_form = md.draft_section_contact_form === "1" ? 1 : 0;

  const isCompany = md.draft_is_company === "1" ? 1 : 0;
  const companyName = pickString(md.draft_company_name) || null;
  const companyAddress = pickString(md.draft_company_address) || null;
  const ico = pickString(md.draft_ico) || null;
  const dic = pickString(md.draft_dic) || null;

  const totalPrice =
    typeof session.amount_total === "number" && Number.isFinite(session.amount_total)
      ? session.amount_total / 100
      : null;

  // Atomic insert (prevents duplicates even if webhook + success page race).
  const [insertResult] = await pool.execute<ResultSetHeader>(
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
      delivery_speed,
      status,
      is_company,
      company_name,
      company_address,
      ico,
      dic
    )
    SELECT ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?
    FROM DUAL
    WHERE NOT EXISTS (
      SELECT 1 FROM orders WHERE mail_local_part = ? LIMIT 1
    )`,
    [
      section_about,
      section_cards,
      section_faq,
      section_gallery,
      section_offer,
      section_contact_form,
      theme,
      accentColor,
      customFont,
      domainOption,
      domainOwn,
      domainRequest,
      hostingOption,
      mailOption,
      sessionKey,
      userEmail,
      totalPrice,
      deliverySpeed,
      1,
      isCompany,
      companyName,
      companyAddress,
      ico,
      dic,
      sessionKey,
    ]
  );

  let orderId: number | null = null;
  const inserted = insertResult.affectedRows > 0;

  if (inserted) {
    orderId = Number(insertResult.insertId);
  } else {
    const [rows] = await pool.query<RowDataPacket[]>(
      "SELECT id, status, user_email, total_price, delivery_speed, domain_option, domain_own, domain_request, created_at FROM orders WHERE mail_local_part = ? LIMIT 1",
      [sessionKey]
    );

    const current = Array.isArray(rows) && rows.length > 0 ? (rows[0] as OrderRow) : null;
    orderId = current?.id != null ? Number(current.id) : null;

    if (current && current.status !== 1) {
      await pool.query("UPDATE orders SET status = ? WHERE id = ?", [1, current.id]);

      const orderForEmail: OrderForEmail = {
        id: current.id,
        user_email: current.user_email,
        total_price: current.total_price,
        delivery_speed: current.delivery_speed,
        domain_option: current.domain_option,
        domain_own: current.domain_own,
        domain_request: current.domain_request,
        created_at: current.created_at ?? null,
      };

      try {
        await sendPaymentReceivedEmail(orderForEmail, { notifyAdmin: true });
      } catch (emailError) {
        console.error("Stripe finalize: failed to send payment received email", emailError);
      }
    }
  }

  if (inserted && orderId != null) {
    const orderForEmail: OrderForEmail = {
      id: orderId,
      user_email: userEmail,
      total_price: totalPrice,
      delivery_speed: deliverySpeed,
      domain_option: domainOption,
      domain_own: domainOwn,
      domain_request: domainRequest,
      created_at: null,
    };

    try {
      await sendPaymentReceivedEmail(orderForEmail, { notifyAdmin: true });
    } catch (emailError) {
      console.error("Stripe finalize: failed to send payment received email", emailError);
    }
  }

  return { orderId };
}
