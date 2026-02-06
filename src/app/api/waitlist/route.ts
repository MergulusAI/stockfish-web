import { NextResponse } from "next/server";
import nodemailer from "nodemailer";

export const runtime = "nodejs"; // viktigt: nodemailer kräver Node runtime (inte Edge)

type Body = { email?: string };

// Enkel, defensiv validering (vi håller det minimal och robust)
function isValidEmail(email: string) {
  if (!email) return false;
  const e = email.trim().toLowerCase();
  if (e.length < 6 || e.length > 254) return false;
  // enkel regex räcker här
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);
}

export async function POST(req: Request) {
  try {
    // DEBUG: visar om env verkligen laddas av Next (syns i terminalen där npm run dev kör)
    console.log("[waitlist env]", {
      user: !!process.env.WAITLIST_SMTP_USER,
      pass: !!process.env.WAITLIST_SMTP_PASS,
    });

    const { email }: Body = await req.json().catch(() => ({}));

    if (!email || !isValidEmail(email)) {
      return NextResponse.json(
        { success: false, error: "Invalid email" },
        { status: 400 }
      );
    }

    const smtpUser = process.env.WAITLIST_SMTP_USER;
    const smtpPass = process.env.WAITLIST_SMTP_PASS;

    if (!smtpUser || !smtpPass) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing SMTP env (WAITLIST_SMTP_USER/PASS)",
        },
        { status: 500 }
      );
    }

    // Gmail / Google Workspace SMTP
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 465,
      secure: true,
      auth: { user: smtpUser, pass: smtpPass },
    });

    // Skicka lead till dig (info@stockfish.se)
    await transporter.sendMail({
      from: `Stockfish Waitlist <${smtpUser}>`,
      to: smtpUser, // skickas till samma inbox du authar med (billigt, enkelt)
      subject: "[BATCH NOTIS] Ny waitlist",
      text: `Ny användare har registrerat sig för batch-notis:\n\n${email}\n`,
      replyTo: email, // så du kan svara direkt
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[waitlist] error:", error);
    return NextResponse.json(
      { success: false, error: "Something went wrong" },
      { status: 500 }
    );
  }
}
