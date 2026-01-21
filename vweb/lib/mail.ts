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

export async function sendNewOrderNotification(order: OrderForEmail): Promise<void> {
  if (!smtpHost || !smtpUser || !smtpPass) {
    return;
  }

  const subject = "Prijali sme vašu objednávku";

  const lines: string[] = [
    `Nová objednávka bola odoslaná.`,
    "",
    `ID objednávky: ${order.id}`,
  ];

  if (order.user_email) {
    lines.push(`Email zákazníka: ${order.user_email}`);
  }
  if (order.total_price != null) {
    lines.push(`Celková cena: ${order.total_price} €`);
  }
  if (order.delivery_speed) {
    lines.push(`Rýchlosť dodania: ${order.delivery_speed}`);
  }
  if (order.domain_option === "own" && order.domain_own) {
    lines.push(`Doména (vlastná): ${order.domain_own}`);
  } else if (order.domain_option === "request" && order.domain_request) {
    lines.push(`Požadovaná doména: ${order.domain_request}`);
  }
  if (order.created_at) {
    lines.push(`Vytvorené: ${order.created_at}`);
  }

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
<head>
  <meta charset="UTF-8" />
  <title>Prijali sme vašu objednávku</title>
</head>
<body style="margin:0; padding:0; background-color:#ffffff; font-family: Arial, Helvetica, sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
    <tr>
      <td align="center" style="padding: 32px 16px;">
        <table width="600" cellpadding="0" cellspacing="0" role="presentation" style="width:100%; max-width:600px; background-color:#ffffff; border-radius:8px; border:1px solid #e5e7eb;">

          <tr>
            <td style="padding:24px 32px 16px 32px; border-bottom:1px solid #f3f4f6;">
              <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
                <tr>
                  <td align="left" style="font-size:14px; color:#6b7280;">
                    <span style="display:inline-block; padding:4px 10px; border-radius:999px; background-color:#f5f3ff; color:#7c3aed; font-size:11px; font-weight:600; letter-spacing:0.08em; text-transform:uppercase;">
                      Nová objednávka
                    </span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <tr>
            <td style="padding:24px 32px 8px 32px;">
              <h1 style="margin:0 0 8px 0; font-size:22px; line-height:1.3; color:#111827;">Prijali sme vašu objednávku</h1>
              <p style="margin:0 0 16px 0; font-size:14px; line-height:1.6; color:#4b5563;">
                Aby sa náš tím mohol pustiť do práce, uhraďte prosím požadovanú sumu.
              </p>
              ${order.total_price != null ? `<p style="margin:0 0 24px 0; font-size:14px; line-height:1.6; color:#4b5563;">
                <strong style="color:#111827;">Celková suma na úhradu:</strong>
                <span style="font-weight:700; color:#7c3aed;"> ${order.total_price} &euro;</span>
              </p>` : ""}
            </td>
          </tr>

          <tr>
            <td align="center" style="padding:4px 32px 24px 32px;">
              <a href="${buttonHref}"
                 style="background-color:#7c3aed; color:#ffffff; text-decoration:none; padding:12px 28px; font-size:14px; font-weight:600; border-radius:999px; display:inline-block; box-shadow:0 10px 15px -3px rgba(124,58,237,0.35);">
                Uhradiť objednávku
              </a>
            </td>
          </tr>

          <tr>
            <td style="padding:0 32px 24px 32px;">
              <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="border-collapse:collapse; font-size:13px; color:#4b5563; background-color:#f9fafb; border-radius:8px;">
                <tr>
                  <td style="padding:12px 16px; border-bottom:1px solid #e5e7eb; font-weight:600; color:#111827;">
                    Detaily objednávky
                  </td>
                </tr>
                <tr>
                  <td style="padding:12px 16px;">
                    <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="border-collapse:collapse;">
                      
                      ${order.delivery_speed ? `<tr>
                        <td style="padding:2px 0; color:#6b7280;">Rýchlosť dodania</td>
                        <td align="right" style="padding:2px 0; color:#111827; font-weight:500;">${order.delivery_speed}</td>
                      </tr>` : ""}
                      ${order.domain_option === "own" && order.domain_own ? `<tr>
                        <td style="padding:2px 0; color:#6b7280;">Doména (vlastná)</td>
                        <td align="right" style="padding:2px 0; color:#111827; font-weight:500;">${order.domain_own}</td>
                      </tr>` : ""}
                      ${order.domain_option === "request" && order.domain_request ? `<tr>
                        <td style="padding:2px 0; color:#6b7280;">Požadovaná doména</td>
                        <td align="right" style="padding:2px 0; color:#111827; font-weight:500;">${order.domain_request}</td>
                      </tr>` : ""}
                      
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <tr>
            <td style="padding:0 32px 24px 32px; font-size:12px; color:#9ca3af; text-align:center; border-top:1px solid #f3f4f6;">
              <p style="margin:16px 0 4px 0;">Ďakujeme, že ste si vybrali <a href="https://www.vweb.sk"; style="color:#7c3aed; font-weight:600;">Vveb</a>.</p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
 </html>`;

  // Send styled payment email to client
  if (order.user_email) {
    await transporter.sendMail({
      from: `Vweb <${smtpUser}>`,
      to: order.user_email,
      subject,
      text,
      html: clientHtml,
    });
  } else {
    console.warn("Order is missing user_email, skipping client notification email", {
      orderId: order.id,
    });
  }

  // Send plain notification email to admin (no design)
  const adminHtml = `<p>Nová objednávka bola odoslaná.</p>
<ul>
  <li><strong>ID objednávky:</strong> ${order.id}</li>
  ${order.user_email ? `<li><strong>Email zákazníka:</strong> ${order.user_email}</li>` : ""}
  ${order.total_price != null ? `<li><strong>Celková cena:</strong> ${order.total_price} €</li>` : ""}
  ${order.delivery_speed ? `<li><strong>Rýchlosť dodania:</strong> ${order.delivery_speed}</li>` : ""}
  ${order.domain_option === "own" && order.domain_own ? `<li><strong>Doména (vlastná):</strong> ${order.domain_own}</li>` : ""}
  ${order.domain_option === "request" && order.domain_request ? `<li><strong>Požadovaná doména:</strong> ${order.domain_request}</li>` : ""}
  ${order.created_at ? `<li><strong>Vytvorené:</strong> ${order.created_at}</li>` : ""}
</ul>`;

  await transporter.sendMail({
    from: `Vweb <${smtpUser}>`,
    to: smtpUser,
    subject,
    text,
    html: adminHtml,
  });
}

export async function sendPaymentReceivedEmail(order: OrderForEmail): Promise<void> {
  if (!smtpHost || !smtpUser || !smtpPass) {
    return;
  }

  if (!order.user_email) {
    console.warn("Order is missing user_email, skipping payment received email", {
      orderId: order.id,
    });
    return;
  }

  const subject = "Prijali sme vašu platbu";

  const lines: string[] = [
    "Prijali sme vašu platbu.",
    "",
    `ID objednávky: ${order.id}`,
  ];

  if (order.total_price != null) {
    lines.push(`Celková cena: ${order.total_price} €`);
  }
  if (order.delivery_speed) {
    lines.push(`Rýchlosť dodania: ${order.delivery_speed}`);
  }
  if (order.domain_option === "own" && order.domain_own) {
    lines.push(`Doména (vlastná): ${order.domain_own}`);
  } else if (order.domain_option === "request" && order.domain_request) {
    lines.push(`Požadovaná doména: ${order.domain_request}`);
  }
  if (order.created_at) {
    lines.push(`Vytvorené: ${order.created_at}`);
  }

  const text = lines.join("\n");

  const html = `<!DOCTYPE html>
<html lang="sk">
<head>
  <meta charset="UTF-8" />
  <title>Prijali sme vašu platbu</title>
</head>
<body style="margin:0; padding:0; background-color:#ffffff; font-family: Arial, Helvetica, sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
    <tr>
      <td align="center" style="padding: 32px 16px;">
        <table width="600" cellpadding="0" cellspacing="0" role="presentation" style="width:100%; max-width:600px; background-color:#ffffff; border-radius:8px; border:1px solid #e5e7eb;">

          <tr>
            <td style="padding:24px 32px 16px 32px; border-bottom:1px solid #f3f4f6;">
              <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
                <tr>
                  <td align="left" style="font-size:14px; color:#6b7280;">
                    <span style="display:inline-block; padding:4px 10px; border-radius:999px; background-color:#f5f3ff; color:#7c3aed; font-size:11px; font-weight:600; letter-spacing:0.08em; text-transform:uppercase;">
                      Platba prijatá
                    </span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <tr>
            <td style="padding:24px 32px 8px 32px;">
              <h1 style="margin:0 0 8px 0; font-size:22px; line-height:1.3; color:#111827;">Prijali sme vašu platbu</h1>
              <p style="margin:0 0 16px 0; font-size:14px; line-height:1.6; color:#4b5563;">
                Ďakujeme, vaša platba prebehla úspešne. Teraz sa púšťame do práce na vašom webe.
              </p>
              ${order.total_price != null ? `<p style="margin:0 0 24px 0; font-size:14px; line-height:1.6; color:#4b5563;">
                <strong style="color:#111827;">Celková suma:</strong>
                <span style="font-weight:700; color:#7c3aed;"> ${order.total_price} &euro;</span>
              </p>` : ""}
            </td>
          </tr>

          <tr>
            <td style="padding:0 32px 24px 32px;">
              <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="border-collapse:collapse; font-size:13px; color:#4b5563; background-color:#f9fafb; border-radius:8px;">
                <tr>
                  <td style="padding:12px 16px; border-bottom:1px solid #e5e7eb; font-weight:600; color:#111827;">
                    Detaily objednávky
                  </td>
                </tr>
                <tr>
                  <td style="padding:12px 16px;">
                    <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="border-collapse:collapse;">
                      ${order.delivery_speed ? `<tr>
                        <td style="padding:2px 0; color:#6b7280;">Rýchlosť dodania</td>
                        <td align="right" style="padding:2px 0; color:#111827; font-weight:500;">${order.delivery_speed}</td>
                      </tr>` : ""}
                      ${order.domain_option === "own" && order.domain_own ? `<tr>
                        <td style="padding:2px 0; color:#6b7280;">Doména (vlastná)</td>
                        <td align="right" style="padding:2px 0; color:#111827; font-weight:500;">${order.domain_own}</td>
                      </tr>` : ""}
                      ${order.domain_option === "request" && order.domain_request ? `<tr>
                        <td style="padding:2px 0; color:#6b7280;">Požadovaná doména</td>
                        <td align="right" style="padding:2px 0; color:#111827; font-weight:500;">${order.domain_request}</td>
                      </tr>` : ""}
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <tr>
            <td style="padding:0 32px 24px 32px; font-size:12px; color:#9ca3af; text-align:center; border-top:1px solid #f3f4f6;">
              <p style="margin:16px 0 4px 0;">Ďakujeme, že ste si vybrali <a href="https://www.vweb.sk" style="color:#7c3aed; font-weight:600;">Vveb</a>.</p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

  await transporter.sendMail({
    from: `Vweb <${smtpUser}>`,
    to: order.user_email,
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

  const lines: string[] = [
    "Dokončili sme vašu objednávku.",
    "",
    `ID objednávky: ${order.id}`,
  ];
  if (order.delivery_speed) {
    lines.push(`Rýchlosť dodania: ${order.delivery_speed}`);
  }
  if (order.domain_option === "own" && order.domain_own) {
    lines.push(`Doména (vlastná): ${order.domain_own}`);
  } else if (order.domain_option === "request" && order.domain_request) {
    lines.push(`Požadovaná doména: ${order.domain_request}`);
  }
  if (order.created_at) {
    lines.push(`Vytvorené: ${order.created_at}`);
  }

  const text = lines.join("\n");

  const html = `<!DOCTYPE html>
<html lang="sk">
<head>
  <meta charset="UTF-8" />
  <title>Dokončili sme vašu objednávku</title>
</head>
<body style="margin:0; padding:0; background-color:#ffffff; font-family: Arial, Helvetica, sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
    <tr>
      <td align="center" style="padding: 32px 16px;">
        <table width="600" cellpadding="0" cellspacing="0" role="presentation" style="width:100%; max-width:600px; background-color:#ffffff; border-radius:8px; border:1px solid #e5e7eb;">

          <tr>
            <td style="padding:24px 32px 16px 32px; border-bottom:1px solid #f3f4f6;">
              <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
                <tr>
                  <td align="left" style="font-size:14px; color:#6b7280;">
                    <span style="display:inline-block; padding:4px 10px; border-radius:999px; background-color:#f5f3ff; color:#7c3aed; font-size:11px; font-weight:600; letter-spacing:0.08em; text-transform:uppercase;">
                      Objednávka dokončená
                    </span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <tr>
            <td style="padding:24px 32px 8px 32px;">
              <h1 style="margin:0 0 8px 0; font-size:22px; line-height:1.3; color:#111827;">Dokončili sme vašu objednávku</h1>
              <p style="margin:0 0 24px 0; font-size:14px; line-height:1.6; color:#4b5563;">
                Váš web je dokončený. V prípade otázok nás môžete kedykoľvek kontaktovať.
              </p>
            </td>
          </tr>

          <tr>
            <td style="padding:0 32px 24px 32px;">
              <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="border-collapse:collapse; font-size:13px; color:#4b5563; background-color:#f9fafb; border-radius:8px;">
                <tr>
                  <td style="padding:12px 16px; border-bottom:1px solid #e5e7eb; font-weight:600; color:#111827;">
                    Detaily objednávky
                  </td>
                </tr>
                <tr>
                  <td style="padding:12px 16px;">
                    <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="border-collapse:collapse;">
                      ${order.delivery_speed ? `<tr>
                        <td style="padding:2px 0; color:#6b7280;">Rýchlosť dodania</td>
                        <td align="right" style="padding:2px 0; color:#111827; font-weight:500;">${order.delivery_speed}</td>
                      </tr>` : ""}
                      ${order.domain_option === "own" && order.domain_own ? `<tr>
                        <td style="padding:2px 0; color:#6b7280;">Doména (vlastná)</td>
                        <td align="right" style="padding:2px 0; color:#111827; font-weight:500;">${order.domain_own}</td>
                      </tr>` : ""}
                      ${order.domain_option === "request" && order.domain_request ? `<tr>
                        <td style="padding:2px 0; color:#6b7280;">Požadovaná doména</td>
                        <td align="right" style="padding:2px 0; color:#111827; font-weight:500;">${order.domain_request}</td>
                      </tr>` : ""}
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <tr>
            <td style="padding:0 32px 24px 32px; font-size:12px; color:#9ca3af; text-align:center; border-top:1px solid #f3f4f6;">
              <p style="margin:16px 0 4px 0;">Ďakujeme, že ste si vybrali <a href="https://www.vweb.sk" style="color:#7c3aed; font-weight:600;">Vveb</a>.</p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

  await transporter.sendMail({
    from: `Vweb <${smtpUser}>`,
    to: order.user_email,
    subject,
    text,
    html,
  });
}
