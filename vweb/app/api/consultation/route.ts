import { NextResponse } from "next/server";
import { sendConsultationEmail } from "@/lib/mail";

export async function POST(request: Request) {
  try {
    const contentType = request.headers.get("content-type") || "";

    let name = "";
    let phone = "";
    let email = "";
    let note = "";

    if (contentType.includes("application/json")) {
      const body = await request.json();
      name = typeof body.name === "string" ? body.name.trim() : "";
      phone = typeof body.phone === "string" ? body.phone.trim() : "";
      email = typeof body.email === "string" ? body.email.trim() : "";
      note = typeof body.note === "string" ? body.note.trim() : "";
    } else {
      const formData = await request.formData();
      name = String(formData.get("name") ?? "").trim();
      phone = String(formData.get("phone") ?? "").trim();
      email = String(formData.get("email") ?? "").trim();
      note = String(formData.get("note") ?? "").trim();
    }

    if (!name || !phone || !email) {
      return NextResponse.json(
        { success: false, error: "Meno, telefón a e-mail sú povinné." },
        { status: 400 },
      );
    }

    await sendConsultationEmail({ name, phone, email, note });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error handling consultation request", error);
    return NextResponse.json(
      { success: false, error: "Žiadosť sa nepodarilo odoslať. Skúste to neskôr." },
      { status: 500 },
    );
  }
}
