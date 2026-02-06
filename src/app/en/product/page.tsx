"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";

type ModalState = "WAITLIST" | null;

// Asset path (your file lives in public/fish/)
const HERO2_BG_SRC = "/fish/stockfish-hero2.png";

// --------------------
// PRICES (EN/EUR)
// --------------------
const CURRENCY = "€";
const STOCKFISH_BUNDLES = [
  { qty: 5, total: 84.5, badge: "RECOMMENDED" },
  { qty: 10, total: 159.0, badge: "" },
  { qty: 1, total: 17.9, badge: "" },
];

const FIELD_BUNDLES = [
  { qty: 5, total: 104.5, badge: "EXPEDITION SET" },
  { qty: 10, total: 199.0, badge: "" },
  { qty: 1, total: 21.9, badge: "" },
];

function formatMoney(amount: number) {
  return `${CURRENCY}${amount.toFixed(2)}`;
}

function perPack(total: number, qty: number) {
  const v = total / qty;
  return `${CURRENCY}${v.toFixed(2)} / pack`;
}

function generateAllocationId() {
  return `SF-${Math.floor(1000 + Math.random() * 9000)}-${Math.floor(
    1000 + Math.random() * 9000
  )}`;
}

function MiniIcelandGlobe({ size = 20 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      aria-hidden="true"
      className="shrink-0"
    >
      <defs>
        <radialGradient id="ocean" cx="30%" cy="25%" r="80%">
          <stop offset="0%" stopColor="#3B82F6" />
          <stop offset="55%" stopColor="#1D4ED8" />
          <stop offset="100%" stopColor="#0B1630" />
        </radialGradient>
        <radialGradient id="shine" cx="25%" cy="20%" r="60%">
          <stop offset="0%" stopColor="rgba(255,255,255,0.22)" />
          <stop offset="55%" stopColor="rgba(255,255,255,0.08)" />
          <stop offset="100%" stopColor="rgba(255,255,255,0)" />
        </radialGradient>
      </defs>

      <circle cx="32" cy="32" r="29" fill="url(#ocean)" />
      <circle
        cx="32"
        cy="32"
        r="29"
        fill="none"
        stroke="rgba(255,255,255,0.18)"
        strokeWidth="1.5"
      />

      <path
        d="M37 22c5-4 12-3 15 1 3 4 1 9-2 13-4 5-10 10-16 9-6-1-11-6-11-11 0-5 4-8 6-11 1-2 4-3 8-1z"
        fill="#22C55E"
        opacity="0.96"
      />

      <path
        d="M35 28c2-2 6-2 8-1 2 1 2 3 0 4-3 2-7 2-10 0-1-1-1-2 2-3z"
        fill="rgba(255,255,255,0.65)"
      />

      <circle cx="32" cy="32" r="29" fill="url(#shine)" />
    </svg>
  );
}

function BundleTable({
  bundles,
}: {
  bundles: { qty: number; total: number; badge?: string }[];
}) {
  return (
    <div className="mt-5 space-y-2">
      {bundles.map((b) => {
        const isRecommended = (b.badge || "").length > 0;
        return (
          <div
            key={b.qty}
            className={`rounded-xl border px-4 py-3 flex items-center justify-between ${
              isRecommended
                ? "border-white/20 bg-white/8"
                : "border-white/10 bg-white/5"
            }`}
          >
            <div>
              <div className="flex items-baseline gap-2">
                <div className="text-[11px] uppercase tracking-widest opacity-80">
                  {b.qty} PACK
                </div>
                {b.badge ? (
                  <div className="text-[10px] uppercase tracking-[0.25em] opacity-45">
                    {b.badge}
                  </div>
                ) : null}
              </div>

              <div className="mt-1 font-mono text-[11px] opacity-75">
                {perPack(b.total, b.qty)}
              </div>
            </div>

            <div className="font-mono text-[12px] opacity-90">
              {formatMoney(b.total)}
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default function ProductPage() {
  const [activeModal, setActiveModal] = useState<ModalState>(null);
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const allocationId = useMemo(() => generateAllocationId(), []);

  const overlayRef = useRef<HTMLDivElement | null>(null);

  // Language toggle
  const pathname = usePathname();
  const router = useRouter();
  const isEN = pathname.startsWith("/en");
  const toggleLanguage = () => {
    router.push(isEN ? "/product" : "/en/product");
  };

  // Preload bg image + log if fails
  useEffect(() => {
    const img = new window.Image();
    img.onload = () => {
      // ok
    };
    img.onerror = () => {
      console.error("[bg] FAILED to load:", HERO2_BG_SRC);
    };
    img.src = HERO2_BG_SRC;
  }, []);

  const openWaitlist = () => {
    setSubmitted(false);
    setActiveModal("WAITLIST");
  };

  const closeModal = () => {
    setActiveModal(null);
  };

  // ESC to close modal
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeModal();
    };
    if (activeModal) window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [activeModal]);

  // Smooth scroll (nav anchors)
  const scrollToId = (id: string) => {
    const el = document.getElementById(id);
    if (!el) return;
    el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div className="min-h-screen text-[#F9FAFB] font-sans selection:bg-white selection:text-black bg-black">
      {/* =========================
          GLOBAL BACKGROUND LAYER
          ✅ Off during Hero, On after Hero.
         ========================= */}
      <div
        aria-hidden="true"
        id="bg-stockfish-hero2"
        className="pointer-events-none fixed inset-0 z-0 opacity-0 transition-opacity duration-700"
      >
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `url('${HERO2_BG_SRC}')`,
            backgroundSize: "cover",
            backgroundPosition: "center top",
            backgroundRepeat: "no-repeat",
            filter: "brightness(1.05) contrast(1.02)",
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/40 to-black/60" />
      </div>

      {/* HEADER */}
      <header className="fixed top-0 w-full z-50 border-b border-white/10 bg-black/40 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <MiniIcelandGlobe size={20} />
            <span className="font-semibold tracking-tight">Stockfish</span>
            <span className="text-[11px] uppercase tracking-widest opacity-50">
              icelandic stockfish
            </span>
          </div>

          <nav className="hidden md:flex items-center gap-6 text-[11px] uppercase tracking-widest opacity-70">
            <button
              onClick={() => scrollToId("product")}
              className="hover:opacity-100 transition-opacity"
            >
              Product
            </button>
            <button
              onClick={() => scrollToId("stockfish")}
              className="hover:opacity-100 transition-opacity"
            >
              Stockfish
            </button>
            <button
              onClick={() => scrollToId("company")}
              className="hover:opacity-100 transition-opacity"
            >
              Company
            </button>
          </nav>

          {/* Language toggle (right) */}
          <div className="w-[120px] hidden md:flex justify-end">
            <button
              onClick={toggleLanguage}
              className="text-[11px] uppercase tracking-widest opacity-60 hover:opacity-100 transition"
              aria-label="Switch language"
              title="Switch language"
            >
              {isEN ? "SV" : "EN"}
            </button>
          </div>
        </div>
      </header>

      {/* CONTENT */}
      <main className="relative z-10 pt-14">
        {/* HERO (SEA VIDEO) */}
        <section
          id="hero"
          className="relative min-h-[92vh] flex items-center justify-center overflow-hidden"
        >
          <video
            autoPlay
            loop
            muted
            playsInline
            className="absolute inset-0 w-full h-full object-cover opacity-55"
          >
            <source src="/hero/hero-waves-01.mp4" type="video/mp4" />
          </video>

          <div className="absolute inset-0 bg-gradient-to-b from-black/55 via-black/45 to-black/95" />

          <div className="relative z-10 text-center px-6 max-w-3xl mx-auto">
            <h1 className="mt-6 text-5xl md:text-7xl font-semibold tracking-tight">
              82% protein.
            </h1>

            <div className="mt-3 text-[11px] md:text-xs uppercase tracking-[0.35em] opacity-75">
              RAW. ORGANIC. ARCTIC.
            </div>

            <div className="mt-6 space-y-2 text-base md:text-lg font-medium tracking-wide opacity-95">
              <div>Fish. Air. Sea salt. Time.</div>
              <div>Shelf-stable.</div>
              <div className="opacity-85 font-normal">
                Air-dried Icelandic cod protein.
              </div>
            </div>

            <div className="mt-8 flex flex-col items-center gap-3">
              <button
                onClick={() => scrollToId("product")}
                className="rounded-full border border-white/25 bg-white/5 px-6 py-3 text-[11px] uppercase tracking-widest hover:bg-white/10 hover:border-white/35 transition"
              >
                View products
              </button>
            </div>
          </div>
        </section>

        {/* PRODUCT */}
        <section id="product" className="py-20">
          <div className="max-w-7xl mx-auto px-6">
            <div className="max-w-3xl mx-auto">
              <div className="border-t border-white/10 pt-10" />
            </div>

            <div className="mt-10 grid md:grid-cols-2 gap-6 max-w-5xl mx-auto">
              {/* Stockfish Pack 100g */}
              <div className="group rounded-2xl border border-white/10 bg-white/5 overflow-hidden backdrop-blur-[2px]">
                <div className="relative aspect-[4/5] bg-black/30">
                  <Image
                    src="/fish/tactical-snack.png"
                    alt="Stockfish Pack 100g pouch"
                    fill
                    className="object-contain p-6 transition-transform duration-300 ease-out group-hover:scale-[1.04]"
                  />
                </div>

                <div className="p-6">
                  <div className="text-[10px] uppercase tracking-widest opacity-60">
                    Stockfish Pack 100 g
                  </div>
                  <div className="mt-2 text-sm opacity-70 leading-relaxed">
                    Eat dry. Vacuum-sealed. 100 g.
                  </div>

                  <BundleTable bundles={STOCKFISH_BUNDLES} />

                  <div className="mt-5">
                    <button
                      onClick={openWaitlist}
                      className="w-full rounded-full border border-white/25 bg-white/5 px-4 py-2 text-[11px] uppercase tracking-widest hover:bg-white/10 hover:border-white/35 transition"
                    >
                      Join waitlist
                    </button>

                    <div className="mt-5 font-mono text-[11px] leading-6 opacity-85">
                      <div>Vacuum-sealed. 100 g.</div>
                      <div>Protein: 82 g / 100 g.</div>
                      <div>Ingredients: cod + sea salt.</div>
                      <div>Shelf-stable.</div>
                      <div>No refrigeration required.</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Field */}
              <div className="group rounded-2xl border border-white/10 bg-white/5 overflow-hidden backdrop-blur-[2px]">
                <div className="relative aspect-[4/5] bg-black/30">
                  <Image
                    src="/fish/field-ration.png"
                    alt="Stockfish Field pouch"
                    fill
                    className="object-contain p-6 transition-transform duration-300 ease-out group-hover:scale-[1.04]"
                  />
                </div>

                <div className="p-6">
                  <div className="text-[10px] uppercase tracking-widest opacity-60">
                    Field Pouch
                  </div>
                  <div className="mt-2 text-sm opacity-70 leading-relaxed">
                    Expedition pouch. Add boiling water directly to pouch. Wait
                    5–8 minutes. Eat.
                  </div>

                  <BundleTable bundles={FIELD_BUNDLES} />

                  <div className="mt-5">
                    <button
                      onClick={openWaitlist}
                      className="w-full rounded-full border border-white/25 bg-white/5 px-4 py-2 text-[11px] uppercase tracking-widest hover:bg-white/10 hover:border-white/35 transition"
                    >
                      Join waitlist
                    </button>

                    <div className="mt-5 font-mono text-[11px] leading-6 opacity-85">
                      <div>Protein: 82 g / pouch.</div>
                      <div>Calories: ~400–500 kcal.</div>
                      <div>Prep: add boiling water (in pouch).</div>
                      <div>Shelf-stable.</div>
                      <div>No refrigeration required.</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* ✅ No inline waitlist box here */}
          </div>
        </section>

        {/* FLOW SECTIONS */}
        <section className="pb-20">
          <div className="max-w-7xl mx-auto px-6">
            <div className="max-w-5xl mx-auto mt-10 space-y-6">
              <section
                id="stockfish"
                className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-[2px]"
              >
                <h2 className="text-sm uppercase tracking-widest opacity-70">
                  Stockfish
                </h2>
                <div className="mt-4 space-y-2 text-sm opacity-80 leading-relaxed">
                  <div className="font-medium opacity-95">
                    Before protein powder, there was stockfish.
                  </div>
                  <div>A preservation method older than modern supplements.</div>
                  <div>Fish, air, time, and salt.</div>
                  <div>What we&apos;re doing isn&apos;t new.</div>
                  <div>It&apos;s a return.</div>
                </div>
              </section>

              <section
                id="company"
                className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-[2px]"
              >
                <h2 className="text-sm uppercase tracking-widest opacity-70">
                  Company
                </h2>
                <div className="mt-4 space-y-2 text-sm opacity-80 leading-relaxed">
                  <div className="opacity-95">
                    Stockfish exists for a simple reason:
                  </div>
                  <div>most protein products aren&apos;t food anymore.</div>
                  <div>This is food.</div>
                  <div>Simple. Stable. Whole.</div>
                </div>
              </section>
            </div>
          </div>
        </section>

        <footer className="border-t border-white/10 py-10">
          <div className="max-w-7xl mx-auto px-6 text-[10px] uppercase tracking-[0.35em] opacity-35">
            Batches only.
          </div>
        </footer>
      </main>

      {/* WAITLIST MODAL */}
      {activeModal && (
        <div
          className="fixed inset-0 z-[200] flex items-center justify-center px-4 bg-black/70 backdrop-blur-sm"
          ref={overlayRef}
          onMouseDown={(e) => {
            if (e.target === overlayRef.current) closeModal();
          }}
        >
          <div className="w-full max-w-md rounded-2xl border border-white/15 bg-[#0b0f14] p-8 relative">
            <button
              onClick={closeModal}
              className="absolute top-3 right-3 h-9 w-9 rounded-full border border-white/15 bg-white/5 hover:bg-white/10 transition flex items-center justify-center text-white/70 hover:text-white"
              aria-label="Close"
              title="Close"
            >
              ×
            </button>

            {!submitted ? (
              <>
                <div className="text-[10px] uppercase tracking-widest opacity-60">
                  Waitlist
                </div>
                <h3 className="mt-2 text-2xl font-semibold tracking-tight">
                  Join.
                </h3>
                <p className="mt-2 text-sm opacity-70 leading-relaxed">
                  Get 1 notification when next batch releases. No obligation.
                </p>

                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (!email.includes("@")) return;
                    setSubmitted(true);
                  }}
                  className="mt-6 space-y-3"
                >
                  <input
                    type="email"
                    required
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-sm outline-none focus:border-white/30"
                  />
                  <button
                    type="submit"
                    className="w-full rounded-xl border border-white/25 bg-white/5 px-4 py-3 text-[11px] uppercase tracking-widest hover:bg-white/10 hover:border-white/35 transition"
                  >
                    Join waitlist
                  </button>
                </form>

                <div className="mt-4 text-[10px] uppercase tracking-widest opacity-40">
                  Press ESC to close.
                </div>
              </>
            ) : (
              <>
                <div className="text-[10px] uppercase tracking-widest opacity-60">
                  Confirmed
                </div>
                <h3 className="mt-2 text-2xl font-semibold tracking-tight">
                  You&apos;re in.
                </h3>

                <div className="mt-4 rounded-xl border border-white/10 bg-white/5 p-4 font-mono text-[11px] opacity-85">
                  <div>STATUS: WAITLIST</div>
                  <div>ID: {allocationId}</div>
                </div>

                <p className="mt-4 text-sm opacity-70 leading-relaxed">
                  You&apos;ll get 1 notification when the next batch releases.
                </p>

                <div className="mt-6">
                  <button
                    onClick={() => {
                      setSubmitted(false);
                      setEmail("");
                      closeModal();
                    }}
                    className="w-full rounded-xl border border-white/25 bg-white/5 px-4 py-3 text-[11px] uppercase tracking-widest hover:bg-white/10 hover:border-white/35 transition"
                  >
                    Close
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* BG SWITCH: show hero2 only after hero leaves viewport */}
      <BgToggle />
    </div>
  );
}

function BgToggle() {
  useEffect(() => {
    const bg = document.getElementById("bg-stockfish-hero2");
    const hero = document.getElementById("hero");
    if (!bg || !hero) return;

    const io = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry.isIntersecting) {
          bg.classList.remove("opacity-100");
          bg.classList.add("opacity-0");
        } else {
          bg.classList.remove("opacity-0");
          bg.classList.add("opacity-100");
        }
      },
      { root: null, threshold: 0.01 }
    );

    io.observe(hero);
    return () => io.disconnect();
  }, []);

  return null;
}
