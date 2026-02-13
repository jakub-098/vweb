import { NextResponse } from "next/server";
import pool from "@/lib/db";
import {
  sendNewOrderNotification,
  sendPaymentReceivedEmail,
  sendOrderCompletedEmail,
  sendUploadCompletedEmails,
  type OrderForEmail,
} from "@/lib/mail";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const rawId = body.orderId;
    const rawStatus = body.status;

    const orderId = Number(rawId);
    const status = Number(rawStatus);

    if (!orderId || Number.isNaN(orderId)) {
      return NextResponse.json(
        { success: false, error: "Missing or invalid orderId" },
        { status: 400 }
      );
    }

    if (![0, 1, 2, 3].includes(status)) {
      return NextResponse.json(
        { success: false, error: "Invalid status" },
        { status: 400 }
      );
    }

    // Fetch current status and order data before updating
    const [rows] = await pool.query<any[]>(
      "SELECT id, status, user_email, total_price, delivery_speed, domain_option, domain_own, domain_request, created_at FROM orders WHERE id = ?",
      [orderId]
    );

    if (!rows || rows.length === 0) {
      return NextResponse.json(
        { success: false, error: "Order not found" },
        { status: 404 }
      );
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

    const previousStatus = current.status;

    // Do not reapply the same status
    if (previousStatus !== null && typeof previousStatus !== "undefined" && status === previousStatus) {
      return NextResponse.json({ success: true });
    }

    await pool.query("UPDATE orders SET status = ? WHERE id = ?", [status, orderId]);

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

    // Send notification when order is submitted: status NULL -> 0
    if ((previousStatus === null || typeof previousStatus === "undefined") && status === 0) {
      try {
        await sendNewOrderNotification(orderForEmail);
      } catch (emailError) {
        console.error("Failed to send new order notification", emailError);
      }
    }

    // Send payment received email when status changes to 1
    if (previousStatus !== 1 && status === 1) {
      try {
        await sendPaymentReceivedEmail(orderForEmail);
      } catch (emailError) {
        console.error("Failed to send payment received email", emailError);
      }
    }

    // Send order completed email when status changes to 2
    if (previousStatus !== 2 && status === 2) {
      try {
        await sendOrderCompletedEmail(orderForEmail);
      } catch (emailError) {
        console.error("Failed to send order completed email", emailError);
      }
    }

	// Send upload completed emails (admin + client) when status changes to 3
	if (previousStatus !== 3 && status === 3) {
		try {
			await sendUploadCompletedEmails(orderForEmail);
		} catch (emailError) {
			console.error("Failed to send upload completed emails", emailError);
		}
	}

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to update order status", error);
    return NextResponse.json(
      { success: false, error: "Failed to update status" },
      { status: 500 }
    );
  }
}
