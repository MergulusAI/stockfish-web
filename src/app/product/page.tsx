"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";

type ModalState = "WAITLIST" | null;

// Asset path (your file lives in public/fish/)
const HERO2_BG_SRC = "/fish/stockfish-hero2.png";

// --------------------
// PRICES (SV/SEK)
// --------------------
const CURRENCY = "kr";
const STOCKFISH_BUNDLES = [
  { qty: 5, total: 995, badge: "REKOMMENDERAD" },
  { qty: 10, total: 1890, badge: "" },
  { qty: 1, total: 229, badge: "" },
];

const FIELD_BUNDLES = [
  { qty: 5, total: 1295, badge: "EXPEDITION SET" },
  { qty: 10, total: 2490, badge: "" },
  { qty: 1, total: 279, badge: "" },
];

function formatMoney(amount: number) {
  return `${amount.toLocaleString("sv-SE")} ${CURRENCY}`;
}

function perPack(total: number, qty: number) {
  const v = total / qty;
  return `${Math.round(v).toLocaleString("sv-SE")} ${CURRENCY} / st`;
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

export default function ProductPage() {
  const [activeModal, setActiveModal] = useState<ModalState>(null);
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  // ✅ Waitlist submit UX
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const allocationId = useMemo(() => generateAllocationId(), []);

  const overlayRef = useRef<HTMLDivElement | null>(null);

  const pathname = usePathname();
  const router = useRouter();
  const isEN = pathname.startsWith("/en");
  const toggleLanguage = () => {
    router.push(isEN ? "/product" : "/en/product");
  };

  useEffect(() => {
    const img = new window.Image();
    img.onerror = () => {
      console.error("[bg] FAILED to load:", HERO2_BG_SRC);
    };
    img.src = HERO2_BG_SRC;
  }, []);

  const openWaitlist = () => {
    setSubmitted(false);
    setSubmitError("");
    setIsSubmitting(false);
    setActiveModal("WAITLIST");
  };

  const closeModal = () => setActiveModal(null);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeModal();
    };
    if (activeModal) window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [activeModal]);

  const scrollToId = (id: string) => {
    const el = document.getElementById(id);
    if (!el) return;
    el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  async function submitWaitlist(formEmail: string) {
    setIsSubmitting(true);
    setSubmitError("");

    try {
      const res = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: formEmail }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok || !data?.success) {
        setSubmitError(
          !isEN
            ? "Kunde inte skicka just nu. Testa igen om en stund."
            : "Could not submit right now. Please try again shortly."
        );
        setIsSubmitting(false);
        return;
      }

      setSubmitted(true);
      setIsSubmitting(false);
    } catch (err) {
      console.error("[waitlist] network error:", err);
      setSubmitError(
        !isEN
          ? "Nätverksfel. Testa igen om en stund."
          : "Network error. Please try again shortly."
      );
      setIsSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen text-[#F9FAFB] font-sans selection:bg-white selection:text-black bg-black">
      {/* GLOBAL BACKGROUND LAYER (Hero2) */}
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
            filter: "brightness(1.02) contrast(1.02) saturate(0.98)",
          }}
        />

        {/* ✅ Same “damping” feel as Hero1: a subtle global dark wash + the same style gradient */}
        <div className="absolute inset-0 bg-black/30" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/55 via-black/45 to-black/95" />
      </div>

      {/* HEADER */}
      <header className="fixed top-0 w-full z-50 border-b border-white/10 bg-black/40 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <MiniIcelandGlobe size={20} />
            <span className="font-semibold tracking-tight">Stockfish</span>
            <span className="text-[11px] uppercase tracking-widest text-white/55">
              icelandic stockfish
            </span>
          </div>

          <nav className="hidden md:flex items-center gap-6 text-[11px] uppercase tracking-widest text-white/75">
            <button
              onClick={() => scrollToId("product")}
              className="hover:text-white transition-colors"
            >
              Produkt
            </button>
            <button
              onClick={() => scrollToId("stockfish")}
              className="hover:text-white transition-colors"
            >
              Stockfish
            </button>
            <button
              onClick={() => scrollToId("company")}
              className="hover:text-white transition-colors"
            >
              Företaget
            </button>
          </nav>

          <div className="w-[120px] hidden md:flex justify-end">
            <button
              onClick={toggleLanguage}
              className="text-[11px] uppercase tracking-widest text-white/65 hover:text-white transition"
              aria-label="Byt språk"
              title="Byt språk"
            >
              {isEN ? "SV" : "EN"}
            </button>
          </div>
        </div>
      </header>

      <main className="relative z-10 pt-14">
        {/* HERO */}
        <section
          id="hero"
          className="relative min-h-[88vh] flex items-center justify-center overflow-hidden"
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

          {/* Hero1 overlay (reference look) */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/55 via-black/45 to-black/95" />

          <div className="relative z-10 text-center px-6 max-w-3xl mx-auto">
            {!isEN ? (
              <>
                <h1 className="mt-6 text-4xl md:text-6xl font-semibold tracking-tight leading-[1.05]">
                  Världens mest proteinrika näringskälla.
                </h1>

                <div className="mt-4 text-[11px] md:text-xs uppercase tracking-[0.35em] text-white/80">
                  RAW. ORGANIC. ARCTIC.
                </div>

                <div className="mt-6 space-y-2 text-base md:text-lg font-medium tracking-wide text-white/95">
                  <div>84 g protein / 100 g.</div>
                  <div className="text-white/90 font-normal">
                    Lufttorkad isländsk torsk.
                  </div>
                </div>

                <div className="mt-8 flex flex-col items-center gap-3">
                  <button
                    onClick={() => scrollToId("product")}
                    className="rounded-full border border-white/25 bg-white/5 px-6 py-3 text-[11px] uppercase tracking-widest hover:bg-white/10 hover:border-white/35 transition"
                  >
                    Visa produkter
                  </button>
                </div>
              </>
            ) : (
              <>
                <h1 className="mt-6 text-5xl md:text-7xl font-semibold tracking-tight">
                  82% protein.
                </h1>

                <div className="mt-3 text-[11px] md:text-xs uppercase tracking-[0.35em] text-white/80">
                  RAW. ORGANIC. ARCTIC.
                </div>

                <div className="mt-6 space-y-2 text-base md:text-lg font-medium tracking-wide text-white/95">
                  <div>Fish. Air. Sea Salt. Time.</div>
                  <div>Shelf-stable at room temperature.</div>
                  <div className="text-white/90 font-normal">
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
              </>
            )}
          </div>
        </section>

        {/* BRIDGE A2 */}
        <section aria-hidden="true" className="relative h-28 md:h-36">
          <div className="absolute inset-0 bg-gradient-to-b from-black/95 via-black/70 to-black/20" />
          <div
            className="absolute inset-0 opacity-[0.06]"
            style={{
              backgroundImage:
                "radial-gradient(rgba(255,255,255,0.12) 1px, transparent 1px)",
              backgroundSize: "22px 22px",
              backgroundPosition: "0 0",
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/15" />
        </section>

        {/* PRODUCT */}
        <section id="product" className="py-16">
          <div className="max-w-7xl mx-auto px-6">
            <div className="max-w-3xl mx-auto">
              <div className="border-t border-white/10 pt-10" />
            </div>

            <div className="mt-10 grid md:grid-cols-2 gap-6 max-w-5xl mx-auto">
              {/* Stockfish Pack 100g */}
              <div className="group rounded-2xl border border-white/10 bg-black/40 ring-1 ring-white/5 overflow-hidden backdrop-blur-[2px]">
                <div className="relative aspect-[4/5] bg-black/30">
                  <Image
                    src="/fish/tactical-snack.png"
                    alt="Stockfish Pack 100g pouch"
                    fill
                    className="object-contain p-6 transition-transform duration-300 ease-out group-hover:scale-[1.04]"
                  />
                </div>

                <div className="p-6">
                  <div className="text-[10px] uppercase tracking-widest text-white/75">
                    Stockfish Pack 100 g
                  </div>

                  {/* ✅ Readability: no thin low-contrast body text */}
                  <div className="mt-2 text-sm font-medium text-white/90 leading-relaxed">
                    Redo att ätas. Vakuumförpackad. 100 g.
                  </div>

                  <div className="mt-5 space-y-2">
                    {STOCKFISH_BUNDLES.map((b) => {
                      const isRecommended = (b.badge || "").length > 0;
                      return (
                        <div
                          key={b.qty}
                          className={`rounded-xl border px-4 py-3 flex items-center justify-between ${
                            isRecommended
                              ? "border-white/20 bg-black/45"
                              : "border-white/10 bg-black/35"
                          }`}
                        >
                          <div>
                            <div className="flex items-baseline gap-2">
                              <div className="text-[11px] uppercase tracking-widest text-white/85">
                                {b.qty} PACK
                              </div>
                              {b.badge ? (
                                <div className="text-[10px] uppercase tracking-[0.25em] text-white/55">
                                  {b.badge}
                                </div>
                              ) : null}
                            </div>

                            {/* ✅ Medium per-st (readable, not weak) */}
                            <div className="mt-1 font-mono text-[12px] font-medium text-white/85">
                              {perPack(b.total, b.qty)}
                            </div>
                          </div>

                          {/* ✅ Semibold total */}
                          <div className="font-mono text-[13px] font-semibold text-white">
                            {formatMoney(b.total)}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div className="mt-5">
                    <button
                      onClick={openWaitlist}
                      className="w-full rounded-full border border-white/25 bg-black/40 px-4 py-2 text-[11px] uppercase tracking-widest hover:bg-black/50 hover:border-white/35 transition"
                    >
                      Få batch-notis
                    </button>

                    {/* ✅ Specs: readable, consistent, no low-opacity grey */}
                    <div className="mt-5 font-mono text-[12px] leading-6 font-medium text-white/90">
                      <div>Vakuumförpackad. 100 g.</div>
                      <div>84 g protein / 100 g.</div>
                      <div>Ingredienser: torsk + havssalt.</div>
                      <div>Hållbar i rumstemperatur.</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Field */}
              <div className="group rounded-2xl border border-white/10 bg-black/40 ring-1 ring-white/5 overflow-hidden backdrop-blur-[2px]">
                <div className="relative aspect-[4/5] bg-black/30">
                  <Image
                    src="/fish/field.png"
                    alt="Stockfish Field pouch"
                    fill
                    className="object-contain p-6 transition-transform duration-300 ease-out group-hover:scale-[1.04]"
                  />
                </div>

                <div className="p-6">
                  <div className="text-[10px] uppercase tracking-widest text-white/75">
                    Field Pouch
                  </div>

                  <div className="mt-2 text-sm font-medium text-white/90 leading-relaxed">
                    Field. Världens mest proteinrika måltidspåse.
                  </div>

                  <div className="mt-5 space-y-2">
                    {FIELD_BUNDLES.map((b) => {
                      const isRecommended = (b.badge || "").length > 0;
                      return (
                        <div
                          key={b.qty}
                          className={`rounded-xl border px-4 py-3 flex items-center justify-between ${
                            isRecommended
                              ? "border-white/20 bg-black/45"
                              : "border-white/10 bg-black/35"
                          }`}
                        >
                          <div>
                            <div className="flex items-baseline gap-2">
                              <div className="text-[11px] uppercase tracking-widest text-white/85">
                                {b.qty} PACK
                              </div>
                              {b.badge ? (
                                <div className="text-[10px] uppercase tracking-[0.25em] text-white/55">
                                  {b.badge}
                                </div>
                              ) : null}
                            </div>

                            <div className="mt-1 font-mono text-[12px] font-medium text-white/85">
                              {perPack(b.total, b.qty)}
                            </div>
                          </div>

                          <div className="font-mono text-[13px] font-semibold text-white">
                            {formatMoney(b.total)}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div className="mt-5">
                    <button
                      onClick={openWaitlist}
                      className="w-full rounded-full border border-white/25 bg-black/40 px-4 py-2 text-[11px] uppercase tracking-widest hover:bg-black/50 hover:border-white/35 transition"
                    >
                      Få batch-notis
                    </button>

                    <div className="mt-5 font-mono text-[12px] leading-6 font-medium text-white/90">
                      <div>84 g protein / 100 g.</div>
                      <div>Kalorier: ~500 kcal.</div>
                      <div>Prep: tillsätt kokande vatten direkt i påsen.</div>
                      <div>Hållbar i rumstemperatur.</div>
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
                className="rounded-2xl border border-white/10 bg-black/40 ring-1 ring-white/5 p-6 backdrop-blur-[2px]"
              >
                <h2 className="text-sm uppercase tracking-widest text-white/85">
                  Stockfish
                </h2>

                {/* ✅ Readability: use color, not opacity-only */}
                <div className="mt-4 space-y-2 text-sm md:text-base font-medium text-white/88 leading-relaxed">
                  <div className="text-white/95">
                    Före proteinpulver fanns stockfish.
                  </div>
                  <div>En konserveringsmetod äldre än moderna tillskott.</div>
                  <div>Fisk, luft, tid och salt.</div>
                  <div>Det vi gör är inte nytt.</div>
                  <div>Det är en återkomst.</div>
                </div>
              </section>

              <section
                id="company"
                className="rounded-2xl border border-white/10 bg-black/40 ring-1 ring-white/5 p-6 backdrop-blur-[2px]"
              >
                <h2 className="text-sm uppercase tracking-widest text-white/85">
                  Företaget
                </h2>

                <div className="mt-4 space-y-2 text-sm md:text-base font-medium text-white/88 leading-relaxed">
                  <div>Vi gör mat.</div>

                  <div className="pt-2">Inte kemiskt processade pulver.</div>
                  <div>Inte sönderplockade proteiner från industriprocesser.</div>

                  <div className="pt-2">
                    Kroppen känner igen riktig mat bättre än industriella
                    substitut.
                  </div>
                  <div>Mat slår tillskott.</div>
                  <div>Enkelhet slår komplexitet.</div>

                  <div className="pt-2">Uppdraget är enkelt.</div>
                  <div>
                    Återställa riktig mat i en värld av pulver och tillsatser.
                  </div>

                  <div className="pt-2">Fångad i Nordatlanten.</div>
                  <div>Lufttorkad på Island.</div>

                  <div className="pt-2">Fisk. Luft. Tid. Salt.</div>

                  <div className="pt-2 text-white/95">Det räcker.</div>
                </div>
              </section>
            </div>
          </div>
        </section>

        <footer className="border-t border-white/10 py-10">
          <div className="max-w-7xl mx-auto px-6 text-[10px] uppercase tracking-[0.35em] text-white/35">
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
                <div className="text-[10px] uppercase tracking-widest text-white/60">
                  Väntelista
                </div>
                <h3 className="mt-2 text-2xl font-semibold tracking-tight">
                  Gå med.
                </h3>

                <p className="mt-2 text-sm text-white/75 leading-relaxed">
                  <span className="block">
                    Få 1 notis när nästa batch öppnar.
                  </span>
                  <span className="block mt-2">Begränsat utbud.</span>
                  <span className="block mt-2">Först till kvarn.</span>
                </p>

                {submitError ? (
                  <div className="mt-4 rounded-xl border border-white/15 bg-white/5 p-3 text-sm text-white/85">
                    {submitError}
                  </div>
                ) : null}

                <form
                  onSubmit={async (e) => {
                    e.preventDefault();
                    const v = email.trim();
                    if (!v.includes("@")) return;
                    if (isSubmitting) return;
                    await submitWaitlist(v);
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
                    disabled={isSubmitting}
                  />
                  <button
                    type="submit"
                    className="w-full rounded-xl border border-white/25 bg-white/5 px-4 py-3 text-[11px] uppercase tracking-widest hover:bg-white/10 hover:border-white/35 transition disabled:opacity-60 disabled:cursor-not-allowed"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? "Skickar..." : "Få batch-notis"}
                  </button>
                </form>
              </>
            ) : (
              <>
                <div className="text-[10px] uppercase tracking-widest text-white/60">
                  Bekräftad
                </div>
                <h3 className="mt-2 text-2xl font-semibold tracking-tight">
                  Du är inne.
                </h3>

                <div className="mt-4 rounded-xl border border-white/10 bg-white/5 p-4 font-mono text-[11px] text-white/85">
                  <div>STATUS: WAITLIST</div>
                  <div>ID: {allocationId}</div>
                </div>

                <p className="mt-4 text-sm text-white/75 leading-relaxed">
                  Du får 1 notis när nästa batch öppnar.
                </p>

                <div className="mt-6">
                  <button
                    onClick={() => {
                      setSubmitted(false);
                      setEmail("");
                      setSubmitError("");
                      setIsSubmitting(false);
                      closeModal();
                    }}
                    className="w-full rounded-xl border border-white/25 bg-white/5 px-4 py-3 text-[11px] uppercase tracking-widest hover:bg-white/10 hover:border-white/35 transition"
                  >
                    Stäng
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      <BgToggle />
    </div>
  );
}

function BgToggle() {
  useEffect(() => {
    const bg = document.getElementById("bg-stockfish-hero2");
    const hero = document.getElementById("hero");
    if (!bg || !hero) return;

    const onScroll = () => {
      const rect = hero.getBoundingClientRect();
      const trigger = Math.max(120, window.innerHeight * 0.25);
      const show = rect.bottom <= trigger;

      if (show) {
        bg.classList.remove("opacity-0");
        bg.classList.add("opacity-100");
      } else {
        bg.classList.remove("opacity-100");
        bg.classList.add("opacity-0");
      }
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  return null;
}
