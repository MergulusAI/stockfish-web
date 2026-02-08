// src/app/api/waitlist/route.ts
import { NextResponse } from "next/server";
import nodemailer from "nodemailer";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";

type ProductChoice = "Stockfish 100g" | "Field";
type Body = { email?: string; product?: string };

function isValidEmail(email: string) {
  if (!email) return false;
  const e = email.trim().toLowerCase();
  if (e.length < 6 || e.length > 254) return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);
}

function normalizeProduct(input: unknown): ProductChoice | null {
  if (typeof input !== "string") return null;
  const v = input.trim();

  if (v === "Stockfish 100g") return "Stockfish 100g";
  if (v === "Field") return "Field";

  const low = v.toLowerCase();
  if (low.includes("stockfish")) return "Stockfish 100g";
  if (low.includes("field")) return "Field";

  return null;
}

export async function POST(req: Request) {
  try {
    const { email, product }: Body = await req.json().catch(() => ({}));

    if (!email || !isValidEmail(email)) {
      return NextResponse.json(
        { success: false, error: "Invalid email" },
        { status: 400 }
      );
    }

    const productChoice = normalizeProduct(product);
    if (!productChoice) {
      return NextResponse.json(
        { success: false, error: "Invalid product" },
        { status: 400 }
      );
    }

    // --- Supabase (primary truth) ---
    const supabaseUrl = process.env.SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !serviceRoleKey) {
      console.error("[waitlist] Missing Supabase env", {
        hasUrl: !!supabaseUrl,
        hasServiceKey: !!serviceRoleKey,
      });
      return NextResponse.json(
        { success: false, error: "Server misconfigured (Supabase env)" },
        { status: 500 }
      );
    }

    const supabase = createClient(supabaseUrl, serviceRoleKey, {
      auth: { persistSession: false },
    });

    // UPSERT på email (kräver UNIQUE index på email i public.waitlist)
    const { data: row, error: dbError } = await supabase
      .from("waitlist")
      .upsert(
        { email: email.trim().toLowerCase(), product: productChoice },
        { onConflict: "email" }
      )
      .select("id,email,product,created_at")
      .single();

    if (dbError) {
      console.error("[waitlist] Supabase error:", dbError);
      return NextResponse.json(
        { success: false, error: "Insert failed" },
        { status: 500 }
      );
    }

    // --- Email (secondary notification) ---
    const smtpUser = process.env.WAITLIST_SMTP_USER;
    const smtpPass = process.env.WAITLIST_SMTP_PASS;

    // SMTP är nice-to-have: om det failar ska vi INTE förstöra signupen
    if (smtpUser && smtpPass) {
      try {
        const transporter = nodemailer.createTransport({
          host: "smtp.gmail.com",
          port: 465,
          secure: true,
          auth: { user: smtpUser, pass: smtpPass },
        });

        await transporter.sendMail({
          from: `Stockfish Waitlist <${smtpUser}>`,
          to: smtpUser,
          subject: "[BATCH NOTIS] Ny waitlist",
          text:
            `Ny användare har registrerat sig för batch-notis:\n\n` +
            `Email: ${email}\n` +
            `Product: ${productChoice}\n` +
            `Row ID: ${row?.id ?? "n/a"}\n`,
          replyTo: email,
        });
      } catch (mailErr) {
        console.error("[waitlist] Email notify failed (non-blocking):", mailErr);
      }
    } else {
      console.log("[waitlist] SMTP env missing — skipping email notify");
    }

    return NextResponse.json({ success: true, row });
  } catch (error) {
    console.error("[waitlist] error:", error);
    return NextResponse.json(
      { success: false, error: "Something went wrong" },
      { status: 500 }
    );
  }
}
