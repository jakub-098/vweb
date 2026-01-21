import nodemailer from "nodemailer";

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

  const to = smtpUser; // send to admin address (same as SMTP user)

  const subject = `Nová objednávka #${order.id}`;

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

  const html = `<p>Nová objednávka bola odoslaná.</p>
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
    from: smtpUser,
    to,
    subject,
    text,
    html,
  });
}
