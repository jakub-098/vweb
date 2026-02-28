import "server-only";

import Stripe from "stripe";

const secretKey = process.env.STRIPE_SECRET_KEY;

if (!secretKey) {
  throw new Error("Missing STRIPE_SECRET_KEY env var");
}

export const stripe = new Stripe(secretKey, {
  // Pinning apiVersion is optional; leaving default follows the installed SDK.
  // apiVersion: "2024-06-20",
});
