import { NextResponse } from "next/server";
import { headers } from "next/headers";
import type Stripe from "stripe";
import type { ResultSetHeader, RowDataPacket } from "mysql2";

import pool from "@/lib/db";
import { stripe } from "@/lib/stripe";
import { sendPaymentReceivedEmail, type OrderForEmail } from "@/lib/mail";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    return NextResponse.json(
      { message: "Missing STRIPE_WEBHOOK_SECRET" },
      { status: 500 }
    );
  }

  let event: Stripe.Event;

  try {
    const rawBody = await request.text();
    const headersList = await headers();
    const signature = new Headers(headersList).get("stripe-signature");

    if (!signature) {
      return NextResponse.json(
        { message: "Missing stripe-signature header" },
        { status: 400 }
      );
    }

    event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
  } catch (err: unknown) {
    const e = err as { message?: unknown };
    const message = typeof e?.message === "string" ? e.message : "Unknown error";
    console.error("Stripe webhook signature verification failed", err);

    return NextResponse.json(
      { message: `Webhook Error: ${message}` },
      { status: 400 }
    );
  }

  const permittedEvents = [
    "checkout.session.completed",
    "checkout.session.async_payment_succeeded",
    "checkout.session.async_payment_failed",
    "checkout.session.expired",
  ];

  if (!permittedEvents.includes(event.type)) {
    return NextResponse.json({ message: "Ignored" }, { status: 200 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed":
      case "checkout.session.async_payment_succeeded": {
        const session = event.data.object as Stripe.Checkout.Session;

        const paymentStatus = session.payment_status;
        const orderIdFromMetadata = session.metadata?.orderId;
        const orderIdFromClientRef = session.client_reference_id;
        const rawOrderId = orderIdFromMetadata ?? orderIdFromClientRef ?? null;

        const orderId = rawOrderId ? Number(rawOrderId) : null;

        if (paymentStatus === "paid" && orderId && Number.isFinite(orderId)) {
          // Load current order to keep status updates idempotent
          const [rows] = await pool.query<RowDataPacket[]>(
            "SELECT id, status, user_email, total_price, delivery_speed, domain_option, domain_own, domain_request, created_at FROM orders WHERE id = ? LIMIT 1",
            [orderId]
          );

          if (!rows || rows.length === 0) {
            console.warn("Stripe webhook: order not found", { orderId, sessionId: session.id });
            break;
          }

          const current = rows[0] as {
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

          // If already marked as paid, do nothing (Stripe retries webhooks).
          if (current.status !== 1) {
            await pool.query("UPDATE orders SET status = ? WHERE id = ?", [1, orderId]);

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
              await sendPaymentReceivedEmail(orderForEmail);
            } catch (emailError) {
              console.error("Stripe webhook: failed to send payment received email", emailError);
            }
          }
        } else if (paymentStatus === "paid") {
          // No pre-created orderId (new Stripe flow): create the order now and then send emails.
          const sessionKey = `stripe:${session.id}`;

          // Idempotency: Stripe retries webhooks. Avoid creating duplicate orders.
          const [existingRows] = await pool.query<RowDataPacket[]>(
            "SELECT id, status, user_email, total_price, delivery_speed, domain_option, domain_own, domain_request, created_at FROM orders WHERE mail_local_part = ? LIMIT 1",
            [sessionKey]
          );

          if (Array.isArray(existingRows) && existingRows.length > 0) {
            const current = existingRows[0] as {
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
                await sendPaymentReceivedEmail(orderForEmail);
              } catch (emailError) {
                console.error("Stripe webhook: failed to send payment received email", emailError);
              }
            }

            break;
          }

          const md = session.metadata ?? {};

          const draftUserEmail = typeof md.draft_user_email === "string" ? md.draft_user_email.trim() : "";
          const stripeEmail = session.customer_details?.email ?? session.customer_email ?? "";
          const userEmail = (stripeEmail || draftUserEmail || "").trim() || null;

          const deliverySpeedRaw = typeof md.draft_delivery_speed === "string" ? md.draft_delivery_speed.trim() : "";
          const deliverySpeed: "24h" | "48h" = deliverySpeedRaw === "24h" ? "24h" : "48h";

          const domainOptionRaw = typeof md.draft_domain_option === "string" ? md.draft_domain_option.trim() : "request";
          const domainOption: "own" | "request" = domainOptionRaw === "own" ? "own" : "request";

          const domainOwn =
            domainOption === "own" && typeof md.draft_domain_own === "string" && md.draft_domain_own.trim().length > 0
              ? md.draft_domain_own.trim()
              : null;
          const domainRequest =
            domainOption === "request" && typeof md.draft_domain_request === "string" && md.draft_domain_request.trim().length > 0
              ? md.draft_domain_request.trim()
              : null;

          const theme = typeof md.draft_theme === "string" && md.draft_theme.trim() ? md.draft_theme.trim() : "tmava";
          const accentColor =
            typeof md.draft_accent_color === "string" && md.draft_accent_color.trim().length > 0
              ? md.draft_accent_color.trim()
              : "purple";
          const customFont =
            typeof md.draft_custom_font === "string" && md.draft_custom_font.trim().length > 0
              ? md.draft_custom_font.trim()
              : null;

          const hostingOption =
            typeof md.draft_hosting_option === "string" && md.draft_hosting_option.trim().length > 0
              ? md.draft_hosting_option.trim()
              : "potrebujem";
          const mailOption =
            typeof md.draft_mail_option === "string" && md.draft_mail_option.trim().length > 0
              ? md.draft_mail_option.trim()
              : "potrebujem";

          const section_about = md.draft_section_about === "1" ? 1 : 0;
          const section_cards = md.draft_section_cards === "1" ? 1 : 0;
          const section_faq = md.draft_section_faq === "1" ? 1 : 0;
          const section_gallery = md.draft_section_gallery === "1" ? 1 : 0;
          const section_offer = md.draft_section_offer === "1" ? 1 : 0;
          const section_contact_form = md.draft_section_contact_form === "1" ? 1 : 0;

          const isCompany = md.draft_is_company === "1" ? 1 : 0;
          const companyName =
            typeof md.draft_company_name === "string" && md.draft_company_name.trim().length > 0
              ? md.draft_company_name.trim()
              : null;
          const companyAddress =
            typeof md.draft_company_address === "string" && md.draft_company_address.trim().length > 0
              ? md.draft_company_address.trim()
              : null;
          const ico = typeof md.draft_ico === "string" && md.draft_ico.trim().length > 0 ? md.draft_ico.trim() : null;
          const dic = typeof md.draft_dic === "string" && md.draft_dic.trim().length > 0 ? md.draft_dic.trim() : null;

          const totalPrice =
            typeof session.amount_total === "number" && Number.isFinite(session.amount_total)
              ? session.amount_total / 100
              : null;

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
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
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
            ]
          );

          const newOrderId = Number(insertResult.insertId);

          const orderForEmail: OrderForEmail = {
            id: newOrderId,
            user_email: userEmail,
            total_price: totalPrice,
            delivery_speed: deliverySpeed,
            domain_option: domainOption,
            domain_own: domainOwn,
            domain_request: domainRequest,
            created_at: null,
          };

          try {
            await sendPaymentReceivedEmail(orderForEmail);
          } catch (emailError) {
            console.error("Stripe webhook: failed to send payment received email", emailError);
          }
        } else {
          console.log("Stripe webhook: checkout session not paid", {
            type: event.type,
            sessionId: session.id,
            payment_status: paymentStatus,
          });
        }

        break;
      }

      case "checkout.session.async_payment_failed": {
        // Payment failed asynchronously (e.g., certain payment methods).
        // We currently do not update order status here.
        const session = event.data.object as Stripe.Checkout.Session;
        console.log("Stripe webhook: async payment failed", {
          sessionId: session.id,
          client_reference_id: session.client_reference_id,
          orderId: session.metadata?.orderId,
        });
        break;
      }

      case "checkout.session.expired": {
        const session = event.data.object as Stripe.Checkout.Session;
        console.log("Stripe webhook: session expired", {
          sessionId: session.id,
          client_reference_id: session.client_reference_id,
          orderId: session.metadata?.orderId,
        });
        break;
      }

      default:
        break;
    }
  } catch (err) {
    console.error("Webhook handler failed", err);
    return NextResponse.json(
      { message: "Webhook handler failed" },
      { status: 500 }
    );
  }

  return NextResponse.json({ message: "Received" }, { status: 200 });
}
