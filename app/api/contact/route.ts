import { NextRequest, NextResponse } from "next/server";
import { resend } from "@/lib/resend";
import { checkLimit, limiters } from "@/lib/ratelimit";
import { BRAND } from "@/config/brand";

const ADMIN_EMAIL  = process.env.ADMIN_EMAIL  ?? BRAND.adminEmail;
const FROM_ADDRESS = process.env.RESEND_FROM  ?? "onboarding@resend.dev";

function escHtml(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#x27;");
}

export async function POST(req: NextRequest) {
  const limited = await checkLimit(limiters.contact, req);
  if (limited) return limited;

  try {
    const { firstName, lastName, email, phone, subject, message } = await req.json();

    if (!firstName?.trim() || !email?.trim() || !message?.trim()) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }
    if (message.length > 4000) {
      return NextResponse.json({ error: "Message too long" }, { status: 400 });
    }

    await resend.emails.send({
      from: FROM_ADDRESS,
      to: [ADMIN_EMAIL],
      replyTo: email,
      subject: `Contact: ${subject || "General Inquiry"} — ${firstName} ${lastName}`,
      html: `<!DOCTYPE html><html><body style="margin:0;padding:24px;background:#f3f4f6;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif">
  <div style="max-width:520px;margin:0 auto;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,.1)">
    <div style="background:#000;padding:24px 32px">
      <span style="color:#fff;font-size:18px;font-weight:700;letter-spacing:-.02em">${BRAND.name}</span>
      <span style="color:#9ca3af;font-size:13px;margin-left:12px">Contact Form</span>
    </div>
    <div style="padding:32px">
      <h2 style="margin:0 0 4px;font-size:20px;font-weight:700">${escHtml(firstName)} ${escHtml(lastName)}</h2>
      <p style="margin:0 0 4px;font-size:14px;color:#374151"><a href="mailto:${escHtml(email)}" style="color:#000">${escHtml(email)}</a></p>
      ${phone ? `<p style="margin:0 0 20px;font-size:14px;color:#6b7280">${escHtml(phone)}</p>` : `<p style="margin-bottom:20px"></p>`}
      <p style="margin:0 0 12px;font-size:13px;font-weight:600;text-transform:uppercase;letter-spacing:.05em;color:#6b7280">Subject</p>
      <p style="margin:0 0 24px;font-size:15px;color:#111">${escHtml(subject || "—")}</p>
      <p style="margin:0 0 12px;font-size:13px;font-weight:600;text-transform:uppercase;letter-spacing:.05em;color:#6b7280">Message</p>
      <p style="margin:0;font-size:15px;color:#374151;line-height:1.7;white-space:pre-wrap">${escHtml(message)}</p>
    </div>
  </div>
</body></html>`,
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[api/contact]", err);
    return NextResponse.json({ error: "Failed to send message" }, { status: 500 });
  }
}
