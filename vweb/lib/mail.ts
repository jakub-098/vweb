import nodemailer from "nodemailer";
import { query } from "./db";

const smtpHost = process.env.SMTP_HOST;
const smtpPort = Number(process.env.SMTP_PORT ?? 465);
const smtpSecure = String(process.env.SMTP_SECURE ?? "true").toLowerCase() === "true";
const smtpUser = process.env.SMTP_USER;
const smtpPass = process.env.SMTP_PASS;

if (!smtpHost || !smtpUser || !smtpPass) {
  console.warn("SMTP configuration is incomplete. Emails will not be sent.");
}

const transporter = nodemailer.createTransport({
  host: smtpHost,
  port: smtpPort,
  secure: smtpSecure,
  auth: smtpUser && smtpPass ? { user: smtpUser, pass: smtpPass } : undefined,
});

export type OrderForEmail = {
  id: number;
  user_email: string | null;
  total_price: number | null;
  delivery_speed: "24h" | "48h" | null;
  domain_option: "own" | "request" | null;
  domain_own: string | null;
  domain_request: string | null;
  created_at?: string | null;
};

export async function sendUploadCompletedEmails(order: OrderForEmail): Promise<void> {
  if (!smtpHost || !smtpUser || !smtpPass) {
    return;
  }

  const adminSubject = "Zákazník dokončil nahrávanie podkladov";
  const adminLines: string[] = [
    "Zákazník dokončil nahrávanie podkladov v konfigurátore.",
    "",
    `ID objednávky: ${order.id}`,
  ];
  if (order.user_email) adminLines.push(`Email zákazníka: ${order.user_email}`);
  if (order.delivery_speed) adminLines.push(`Rýchlosť dodania: ${order.delivery_speed}`);
  if (order.created_at) adminLines.push(`Vytvorené: ${order.created_at}`);

  const adminText = adminLines.join("\n");
  const adminHtml = `<!DOCTYPE html>
<html lang="sk">
<head><meta charset="UTF-8" /><title>Nahrávanie podkladov dokončené</title></head>
<body style="font-family:Arial,Helvetica,sans-serif;">
  <p>Zákazník dokončil nahrávanie podkladov v konfigurátore.</p>
  <ul>
    <li><strong>ID objednávky:</strong> ${order.id}</li>
    ${order.user_email ? `<li><strong>Email zákazníka:</strong> ${order.user_email}</li>` : ""}
    ${order.delivery_speed ? `<li><strong>Rýchlosť dodania:</strong> ${order.delivery_speed}</li>` : ""}
    ${order.created_at ? `<li><strong>Vytvorené:</strong> ${order.created_at}</li>` : ""}
  </ul>
</body>
</html>`;

  await transporter.sendMail({
    from: `Vweb <${smtpUser}>`,
    to: smtpUser,
    subject: adminSubject,
    text: adminText,
    html: adminHtml,
  });

  if (!order.user_email) {
    console.warn("Order is missing user_email, skipping upload completed client email", {
      orderId: order.id,
    });
    return;
  }

  const clientSubject = "Prijali sme vašu konfiguráciu";
  const clientText = "Prijali sme vašu konfiguráciu a púšťame sa do práce na vašom webe.";
  const clientHtml = `<!DOCTYPE html>
<html lang="sk">
<head><meta charset="UTF-8" /><title>Prijali sme vašu konfiguráciu</title></head>
<body style="font-family:Arial,Helvetica,sans-serif;">
  <p>Všetky podklady sme úspešne prijali a náš tím sa púšťa do práce na vašom webe.</p>
  ${order.delivery_speed ? `<p><strong>Zvolená rýchlosť dodania:</strong> ${order.delivery_speed}</p>` : ""}
  <p>Ďakujeme, že ste si vybrali <a href="https://www.vweb.sk" style="color:#7c3aed; font-weight:600;">Vweb</a>.</p>
</body>
</html>`;

  await transporter.sendMail({
    from: `Vweb <${smtpUser}>`,
    to: order.user_email,
    subject: clientSubject,
    text: clientText,
    html: clientHtml,
  });
}

export async function sendNewOrderNotification(order: OrderForEmail): Promise<void> {
  if (!smtpHost || !smtpUser || !smtpPass) {
    return;
  }

  const subject = "Prijali sme vašu objednávku";

  const lines: string[] = [
    "Nová objednávka bola odoslaná.",
    "",
    `ID objednávky: ${order.id}`,
  ];

  if (order.user_email) lines.push(`Email zákazníka: ${order.user_email}`);
  if (order.total_price != null) lines.push(`Celková cena: ${order.total_price} €`);
  if (order.delivery_speed) lines.push(`Rýchlosť dodania: ${order.delivery_speed}`);
  if (order.domain_option === "own" && order.domain_own) {
    lines.push(`Doména (vlastná): ${order.domain_own}`);
  } else if (order.domain_option === "request" && order.domain_request) {
    lines.push(`Požadovaná doména: ${order.domain_request}`);
  }
  if (order.created_at) lines.push(`Vytvorené: ${order.created_at}`);

  const text = lines.join("\n");

  let paymentUrl: string | null = null;

  if (order.total_price != null) {
    try {
      const rows = await query<{ weblink: string }>(
        "SELECT weblink FROM links WHERE price = ? LIMIT 1",
        [order.total_price]
      );

      if (rows.length > 0 && rows[0].weblink) {
        paymentUrl = rows[0].weblink;
      }
    } catch (error) {
      console.error("Failed to fetch payment URL from links table", error);
    }
  }

  const buttonHref = paymentUrl ?? "#";

  const clientHtml = `<!DOCTYPE html>
<html lang="sk">
<head><meta charset="UTF-8" /><title>Prijali sme vašu objednávku</title></head>
<body style="font-family:Arial,Helvetica,sans-serif;">
  <h1>Prijali sme vašu objednávku</h1>
  <p>Aby sa náš tím mohol pustiť do práce, uhraďte prosím požadovanú sumu.</p>
  ${order.total_price != null ? `<p><strong>Celková suma na úhradu:</strong> ${order.total_price} €</p>` : ""}
  <p><a href="${buttonHref}" style="background-color:#7c3aed; color:#ffffff; text-decoration:none; padding:10px 22px; border-radius:999px;">Uhradiť objednávku</a></p>
</body>
</html>`;

  if (order.user_email) {
    await transporter.sendMail({
      from: `Vweb <${smtpUser}>`,
      to: order.user_email,
      subject,
      text,
      html: clientHtml,
    });
  }

  const adminHtml = `<!DOCTYPE html>
<html lang="sk">
<head><meta charset="UTF-8" /><title>Nová objednávka</title></head>
<body style="font-family:Arial,Helvetica,sans-serif;">
  <p>Nová objednávka bola odoslaná.</p>
  <ul>
    <li><strong>ID objednávky:</strong> ${order.id}</li>
    ${order.user_email ? `<li><strong>Email zákazníka:</strong> ${order.user_email}</li>` : ""}
    ${order.total_price != null ? `<li><strong>Celková cena:</strong> ${order.total_price} €</li>` : ""}
    ${order.delivery_speed ? `<li><strong>Rýchlosť dodania:</strong> ${order.delivery_speed}</li>` : ""}
    ${order.domain_option === "own" && order.domain_own ? `<li><strong>Doména (vlastná):</strong> ${order.domain_own}</li>` : ""}
    ${order.domain_option === "request" && order.domain_request ? `<li><strong>Požadovaná doména:</strong> ${order.domain_request}</li>` : ""}
    ${order.created_at ? `<li><strong>Vytvorené:</strong> ${order.created_at}</li>` : ""}
  </ul>
</body>
</html>`;

  await transporter.sendMail({
    from: `Vweb <${smtpUser}>`,
    to: smtpUser,
    subject,
    text,
    html: adminHtml,
  });
}

export async function sendPaymentReceivedEmail(
  order: OrderForEmail,
  options?: { notifyAdmin?: boolean; outreachSelected?: boolean }
): Promise<void> {
  if (!smtpHost || !smtpUser || !smtpPass) {
    return;
  }

  const notifyAdmin = options?.notifyAdmin === true;
  const outreachSelected = options?.outreachSelected === true;

  const subject = "Prijali sme vašu platbu";

  const lines: string[] = [
    "Prijali sme vašu platbu.",
    "",
    `ID objednávky: ${order.id}`,
  ];

  if (order.total_price != null) lines.push(`Celková cena: ${order.total_price} €`);
  if (order.delivery_speed) lines.push(`Rýchlosť dodania: ${order.delivery_speed}`);
  if (order.domain_option === "own" && order.domain_own) {
    lines.push(`Doména (vlastná): ${order.domain_own}`);
  } else if (order.domain_option === "request" && order.domain_request) {
    lines.push(`Požadovaná doména: ${order.domain_request}`);
  }
  if (order.created_at) lines.push(`Vytvorené: ${order.created_at}`);

  const text = lines.join("\n");

  const html = `<!DOCTYPE html>
<html lang="sk">
<head><meta charset="UTF-8" /><title>Prijali sme vašu platbu</title></head>
<body style="font-family:Arial,Helvetica,sans-serif;">
  <h1>Prijali sme vašu platbu</h1>
  <p>Ďakujeme, vaša platba prebehla úspešne.</p>
  ${order.total_price != null ? `<p><strong>Celková suma:</strong> ${order.total_price} €</p>` : ""}
  <p><a href="https://www.vweb.sk/upload" style="background-color:#7c3aed; color:#ffffff; text-decoration:none; padding:10px 22px; border-radius:999px;">Spustiť Konfigurátor</a></p>
  <h2>Detaily objednávky</h2>
  <ul>
    ${order.delivery_speed ? `<li><strong>Rýchlosť dodania:</strong> ${order.delivery_speed}</li>` : ""}
    ${order.domain_option === "own" && order.domain_own ? `<li><strong>Doména (vlastná):</strong> ${order.domain_own}</li>` : ""}
    ${order.domain_option === "request" && order.domain_request ? `<li><strong>Požadovaná doména:</strong> ${order.domain_request}</li>` : ""}
  </ul>
</body>
</html>`;

  if (order.user_email) {
    await transporter.sendMail({
      from: `Vweb <${smtpUser}>`,
      to: order.user_email,
      subject,
      text,
      html,
    });
  } else {
    console.warn("Order is missing user_email, skipping payment received client email", {
      orderId: order.id,
    });
  }

  if (notifyAdmin) {
    const adminSubject = `Platba prijatá – objednávka #${order.id}`;
    const adminLines: string[] = [
      "Platba bola prijatá (Stripe).",
      "",
      `ID objednávky: ${order.id}`,
    ];
    if (order.user_email) adminLines.push(`Email zákazníka: ${order.user_email}`);
    if (order.total_price != null) adminLines.push(`Celková cena: ${order.total_price} €`);
    if (order.delivery_speed) adminLines.push(`Rýchlosť dodania: ${order.delivery_speed}`);
    if (order.domain_option === "own" && order.domain_own) {
      adminLines.push(`Doména (vlastná): ${order.domain_own}`);
    } else if (order.domain_option === "request" && order.domain_request) {
      adminLines.push(`Požadovaná doména: ${order.domain_request}`);
    }
    adminLines.push(`Outreach: ${outreachSelected ? "áno" : "nie"}`);
    if (order.created_at) adminLines.push(`Vytvorené: ${order.created_at}`);

    await transporter.sendMail({
      from: `Vweb <${smtpUser}>`,
      to: smtpUser,
      subject: adminSubject,
      text: adminLines.join("\n"),
      html: `<p>Platba bola prijatá (Stripe).</p>
<ul>
  <li><strong>ID objednávky:</strong> ${order.id}</li>
  ${order.user_email ? `<li><strong>Email zákazníka:</strong> ${order.user_email}</li>` : ""}
  ${order.total_price != null ? `<li><strong>Celková cena:</strong> ${order.total_price} €</li>` : ""}
  ${order.delivery_speed ? `<li><strong>Rýchlosť dodania:</strong> ${order.delivery_speed}</li>` : ""}
  ${order.domain_option === "own" && order.domain_own ? `<li><strong>Doména (vlastná):</strong> ${order.domain_own}</li>` : ""}
  ${order.domain_option === "request" && order.domain_request ? `<li><strong>Požadovaná doména:</strong> ${order.domain_request}</li>` : ""}
  <li><strong>Outreach:</strong> ${outreachSelected ? "áno" : "nie"}</li>
  ${order.created_at ? `<li><strong>Vytvorené:</strong> ${order.created_at}</li>` : ""}
</ul>`,
    });
  }
}

type ContactPayload = {
  fromEmail: string;
  message: string;
};

type ConsultationPayload = {
  name: string;
  phone: string;
  email: string;
  note: string;
};

export async function sendContactEmails(payload: ContactPayload): Promise<void> {
  if (!smtpHost || !smtpUser || !smtpPass) {
    return;
  }

  const fromEmail = payload.fromEmail.trim();
  const message = payload.message.trim();

  if (!fromEmail || !message) {
    return;
  }

  const clientSubject = "Prijali sme vašu správu";
  const adminSubject = "Nový dopyt z hlavnej stránky";

  const plainText = [
    "Prijali sme vašu správu z vweb.sk.",
    "",
    "Text správy:",
    message,
  ].join("\n");

  const clientHtml = `<!DOCTYPE html>
<html lang="sk">
<head><meta charset="UTF-8" /><title>Prijali sme vašu správu</title></head>
<body style="font-family:Arial,Helvetica,sans-serif;">
  <h1>Prijali sme vašu správu</h1>
  <p>Ďakujeme, že ste nás kontaktovali. Čoskoro sa vám ozveme späť.</p>
  <h2>Kópia vašej správy</h2>
  <div style="border:1px solid #e5e7eb; padding:8px 10px; white-space:pre-wrap;">${message.replace(/</g, "&lt;")}</div>
</body>
</html>`;

  await transporter.sendMail({
    from: `vweb.sk <${smtpUser}>`,
    to: fromEmail,
    subject: clientSubject,
    text: plainText,
    html: clientHtml,
  });

  const adminHtml = `<!DOCTYPE html>
<html lang="sk">
<head><meta charset="UTF-8" /><title>Nový dopyt z vweb.sk</title></head>
<body style="font-family:Arial,Helvetica,sans-serif;">
  <h1>Nový dopyt</h1>
  <p><strong>E-mail:</strong> ${fromEmail}</p>
  <h2>Text správy</h2>
  <div style="border:1px solid #e5e7eb; padding:10px 12px; white-space:pre-wrap;">${message.replace(/</g, "&lt;")}</div>
</body>
</html>`;

  await transporter.sendMail({
    from: `vweb.sk <${smtpUser}>`,
    to: smtpUser,
    subject: adminSubject,
    text: `Nový dopyt z hlavnej stránky. E-mail: ${fromEmail}\n\nSpráva:\n${message}`,
    html: adminHtml,
  });
}

export async function sendConsultationEmail(payload: ConsultationPayload): Promise<void> {
  if (!smtpHost || !smtpUser || !smtpPass) {
    return;
  }

  const name = payload.name.trim();
  const phone = payload.phone.trim();
  const email = payload.email.trim();
  const note = payload.note.trim();

  if (!name || !phone || !email) {
    return;
  }

  const subject = "Nová žiadosť o bezplatnú konzultáciu";

  const plainLines = [
    "Nová žiadosť o bezplatnú konzultáciu z vweb.sk.",
    "",
    `Meno: ${name}`,
    `Telefón: ${phone}`,
    `E-mail: ${email}`,
    "",
    "Poznámka / preferovaný čas:",
    note || "(bez poznámky)",
  ];

  const text = plainLines.join("\n");
  const safeNote = (note || "(bez poznámky)").replace(/</g, "&lt;");

  const html = `<!DOCTYPE html>
<html lang="sk">
<head><meta charset="UTF-8" /><title>Nová žiadosť o bezplatnú konzultáciu</title></head>
<body style="font-family:Arial,Helvetica,sans-serif;">
  <h1>Nová žiadosť o konzultáciu</h1>
  <p>Zákazník požiadal o bezplatnú konzultáciu cez vweb.sk.</p>
  <h2>Detaily žiadosti</h2>
  <table style="border-collapse:collapse; font-size:13px; color:#4b5563;">
    <tr><td style="padding:2px 0; color:#6b7280;">Meno</td><td style="padding:2px 0; font-weight:500;" align="right">${name}</td></tr>
    <tr><td style="padding:2px 0; color:#6b7280;">Telefón</td><td style="padding:2px 0; font-weight:500;" align="right">${phone}</td></tr>
    <tr><td style="padding:2px 0; color:#6b7280;">E-mail</td><td style="padding:2px 0; font-weight:500;" align="right">${email}</td></tr>
    <tr>
      <td style="padding:8px 0 2px 0; color:#6b7280; vertical-align:top;">Poznámka / preferovaný čas</td>
      <td style="padding:8px 0 2px 0; font-weight:500;" align="right">
        <div style="margin:4px 0 0 0; padding:8px 10px; font-size:13px; line-height:1.6; color:#111827; background-color:#ffffff; border-radius:6px; border:1px solid #e5e7eb; white-space:pre-wrap;">${safeNote}</div>
      </td>
    </tr>
  </table>
</body>
</html>`;

  await transporter.sendMail({
    from: `Vweb <${smtpUser}>`,
    to: smtpUser,
    subject,
    text,
    html,
  });
}

export async function sendOrderCompletedEmail(order: OrderForEmail): Promise<void> {
  if (!smtpHost || !smtpUser || !smtpPass) {
    return;
  }

  if (!order.user_email) {
    console.warn("Order is missing user_email, skipping order completed email", {
      orderId: order.id,
    });
    return;
  }

  const subject = "Dokončili sme vašu objednávku";

  const textLines = [
    "Dokončili sme vašu objednávku.",
    "",
    `ID objednávky: ${order.id}`,
  ];

  if (order.total_price != null) {
    textLines.push(`Celková cena: ${order.total_price} €`);
  }
  if (order.delivery_speed) {
    textLines.push(`Rýchlosť dodania: ${order.delivery_speed}`);
  }
  if (order.created_at) {
    textLines.push(`Vytvorené: ${order.created_at}`);
  }

  const text = textLines.join("\n");

  const html = `<!DOCTYPE html>
<html lang="sk">
<head><meta charset="UTF-8" /><title>Dokončili sme vašu objednávku</title></head>
<body style="font-family:Arial,Helvetica,sans-serif;">
  <h1>Dokončili sme vašu objednávku</h1>
  <p>Vaša webstránka je hotová. Ďakujeme, že ste si vybrali Vweb.</p>
  <ul>
    <li><strong>ID objednávky:</strong> ${order.id}</li>
    ${order.total_price != null ? `<li><strong>Celková cena:</strong> ${order.total_price} €</li>` : ""}
    ${order.delivery_speed ? `<li><strong>Rýchlosť dodania:</strong> ${order.delivery_speed}</li>` : ""}
    ${order.created_at ? `<li><strong>Vytvorené:</strong> ${order.created_at}</li>` : ""}
  </ul>
</body>
</html>`;

  await transporter.sendMail({
    from: `Vweb <${smtpUser}>`,
    to: order.user_email,
    subject,
    text,
    html,
  });

  await transporter.sendMail({
    from: `Vweb <${smtpUser}>`,
    to: smtpUser,
    subject: `${subject} – admin kópia`,
    text,
    html,
  });
}
