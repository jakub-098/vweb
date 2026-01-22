import { NextResponse } from "next/server";
import { sendContactEmails } from "@/lib/mail";

export async function POST(request: Request) {
  try {
    const contentType = request.headers.get("content-type") || "";

    let email = "";
    let message = "";

    if (contentType.includes("application/json")) {
      const body = await request.json();
      email = typeof body.email === "string" ? body.email.trim() : "";
      message = typeof body.message === "string" ? body.message.trim() : "";
    } else {
      const formData = await request.formData();
      email = String(formData.get("email") ?? "").trim();
      message = String(formData.get("message") ?? "").trim();
    }

    if (!email || !message) {
      return NextResponse.json(
        { success: false, error: "Email a správa sú povinné." },
        { status: 400 },
      );
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(email)) {
      return NextResponse.json(
        { success: false, error: "Zadaj prosím platnú e-mailovú adresu." },
        { status: 400 },
      );
    }

    await sendContactEmails({ fromEmail: email, message });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error handling contact form submission", error);
    return NextResponse.json(
      { success: false, error: "Nepodarilo sa odoslať správu. Skús to neskôr." },
      { status: 500 },
    );
  }
}
