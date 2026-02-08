// src/app/api/waitlist/route.ts
import { NextResponse } from "next/server";
import nodemailer from "nodemailer";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";

type ProductChoice = "Stockfish 100g" | "Field";
type Body = { email?: string; product?: string; website?: string };

function isValidEmail(email: string) {
  if (!email) return false;
  const e = email.trim().toLowerCase();
  if (e.length < 6 || e.length > 254) return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);
}

// Stenhård: bara exakt match (minskar spam/skript som skickar skräp)
function normalizeProductStrict(input: unknown): ProductChoice | null {
  if (typeof input !== "string") return null;
  const v = input.trim();
  if (v === "Stockfish 100g") return "Stockfish 100g";
  if (v === "Field") return "Field";
  return null;
}

function getClientIp(req: Request) {
  const xff = req.headers.get("x-forwarded-for");
  if (xff) return xff.split(",")[0].trim();
  const realIp = req.headers.get("x-real-ip");
  if (realIp) return realIp.trim();
  return "unknown";
}

type Bucket = { hits: number[] };
const ipBucket = new Map<string, Bucket>();
const emailBucket = new Map<string, Bucket>();

function prune(bucket: Bucket, windowMs: number) {
  const cutoff = Date.now() - windowMs;
  bucket.hits = bucket.hits.filter((t) => t >= cutoff);
}

function tooMany(
  map: Map<string, Bucket>,
  key: string,
  windowMs: number,
  maxHits: number
) {
  const now = Date.now();
  const b = map.get(key) ?? { hits: [] };
  prune(b, windowMs);
  b.hits.push(now);
  map.set(key, b);
  return b.hits.length > maxHits;
}

export async function POST(req: Request) {
  try {
    const { email, product, website }: Body = await req.json().catch(() => ({}));

    // Honeypot: om ifyllt -> bot. Returnera "success" men gör inget.
    if (typeof website === "string" && website.trim().length > 0) {
      return NextResponse.json({ success: true });
    }

    if (!email || !isValidEmail(email)) {
      return NextResponse.json(
        { success: false, error: "Invalid email" },
        { status: 400 }
      );
    }

    const productChoice = normalizeProductStrict(product);
    if (!productChoice) {
      return NextResponse.json(
        { success: false, error: "Invalid product" },
        { status: 400 }
      );
    }

    // Rate limit (best effort)
    const ip = getClientIp(req);
    const normalizedEmail = email.trim().toLowerCase();

    // IP: max 10 req / 10 min
    if (tooMany(ipBucket, ip, 10 * 60 * 1000, 10)) {
      return NextResponse.json(
        { success: false, error: "Too many requests" },
        { status: 429 }
      );
    }

    // Email: max 3 req / 60 min
    if (tooMany(emailBucket, normalizedEmail, 60 * 60 * 1000, 3)) {
      return NextResponse.json(
        { success: false, error: "Too many requests" },
        { status: 429 }
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

    // UPSERT på email (förutsätter UNIQUE index på email i public.waitlist)
    const { data: row, error: dbError } = await supabase
      .from("waitlist")
      .upsert(
        { email: normalizedEmail, product: productChoice },
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

    // Valfritt: om du vill skicka till en annan inbox än smtpUser
    const notifyTo = process.env.WAITLIST_NOTIFY_TO || smtpUser;

    // SMTP är nice-to-have: om det failar ska vi INTE förstöra signupen
    if (smtpUser && smtpPass && notifyTo) {
      try {
        const transporter = nodemailer.createTransport({
          host: "smtp.gmail.com",
          port: 465,
          secure: true,
          auth: { user: smtpUser, pass: smtpPass },
        });

        await transporter.sendMail({
          from: `Stockfish Waitlist <${smtpUser}>`,
          to: notifyTo,
          subject: "[BATCH NOTIS] Ny waitlist",
          text:
            `Ny användare har registrerat sig för batch-notis:\n\n` +
            `Email: ${normalizedEmail}\n` +
            `Product: ${productChoice}\n` +
            `Row ID: ${row?.id ?? "n/a"}\n`,
          replyTo: normalizedEmail,
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
