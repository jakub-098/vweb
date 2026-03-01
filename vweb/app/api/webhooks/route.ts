import { NextResponse } from "next/server";
import { headers } from "next/headers";
import type Stripe from "stripe";
import type { RowDataPacket } from "mysql2";

import pool from "@/lib/db";
import { stripe } from "@/lib/stripe";
import { sendPaymentReceivedEmail, type OrderForEmail } from "@/lib/mail";
import { finalizePaidCheckoutSession } from "@/lib/stripe-orders";

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

  console.log("Stripe webhook received", {
    type: event.type,
    id: event.id,
  });

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
              await sendPaymentReceivedEmail(orderForEmail, { notifyAdmin: true });
            } catch (emailError) {
              console.error("Stripe webhook: failed to send payment received email", emailError);
            }
          }
        } else if (paymentStatus === "paid") {
          const result = await finalizePaidCheckoutSession(session);
          console.log("Stripe webhook finalized paid checkout session", {
            sessionId: session.id,
            orderId: result.orderId,
          });
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
