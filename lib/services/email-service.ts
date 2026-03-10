import nodemailer from "nodemailer";
import type { Inquiry } from "@prisma/client";

function createTransport() {
  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT ?? "587");
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!host || !user || !pass) {
    return nodemailer.createTransport({ jsonTransport: true });
  }

  return nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass }
  });
}

export async function sendInquiryNotification(inquiry: Inquiry) {
  const transporter = createTransport();
  const to = process.env.NOTIFICATION_EMAIL || "leads@mediway.com";
  const from = process.env.SMTP_FROM || "no-reply@mediway.com";

  await transporter.sendMail({
    to,
    from,
    subject: `New Consultation Inquiry: ${inquiry.treatmentInterest}`,
    text: [
      `Patient: ${inquiry.name}`,
      `Country: ${inquiry.country}`,
      `Phone: ${inquiry.phone}`,
      `Email: ${inquiry.email}`,
      `Treatment: ${inquiry.treatmentInterest}`,
      `Message: ${inquiry.message}`
    ].join("\n")
  });
}
