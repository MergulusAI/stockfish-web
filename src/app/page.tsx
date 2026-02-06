'use client';

import React, { useMemo, useRef, useState } from 'react';

// --- TYPES ---
type View = 'IDLE' | 'SURVEY' | 'SUCCESS' | 'ERROR';
type Preference = 'RAW' | 'PURE' | null;

// --- CONSTANTS ---
const ACCENT = '#4DA3FF'; // Isblå (låst)
const PRICE_EUR = 22;
const FREE_SHIP_THRESHOLD_EUR = 66;

// --- HELPERS ---
function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(' ');
}

// --- COMPONENT ---
export default function StockfishLanding() {
  const [email, setEmail] = useState('');
  const [view, setView] = useState<View>('IDLE');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [preference, setPreference] = useState<Preference>(null);
  const [errorMsg, setErrorMsg] = useState('');

  const waitlistRef = useRef<HTMLDivElement>(null);

  const canSubmitEmail = useMemo(() => {
    if (isSubmitting) return false;
    return isValidEmail(email);
  }, [email, isSubmitting]);

  const scrollToWaitlist = () => {
    waitlistRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  // NOTE:
  // Byt ut detta mot din riktiga API-route (t.ex. /api/waitlist) när den finns.
  async function submitWaitlist(payload: { email: string; preference?: Preference }) {
    // Simulerar nätverk
    await new Promise((r) => setTimeout(r, 650));
    void payload;
    return { ok: true };
  }

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isValidEmail(email)) {
      setView('ERROR');
      setErrorMsg('Enter a valid email.');
      return;
    }

    setErrorMsg('');
    setIsSubmitting(true);

    try {
      const res = await submitWaitlist({ email: email.trim() });
      if (!res.ok) throw new Error('Submit failed');
      setView('SURVEY');
    } catch {
      setView('ERROR');
      setErrorMsg('Something went wrong. Try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSurveyFinish = async () => {
    setErrorMsg('');
    setIsSubmitting(true);

    try {
      const res = await submitWaitlist({ email: email.trim(), preference });
      if (!res.ok) throw new Error('Submit failed');
      setView('SUCCESS');
    } catch {
      setView('ERROR');
      setErrorMsg('Something went wrong. Try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSurveySkip = async () => {
    setPreference(null);
    await handleSurveyFinish();
  };

  const resetForm = () => {
    setEmail('');
    setPreference(null);
    setErrorMsg('');
    setIsSubmitting(false);
    setView('IDLE');
  };

  // --- UI PRIMITIVES ---
  const Section = ({
    id,
    title,
    children,
  }: {
    id: string;
    title?: string;
    children: React.ReactNode;
  }) => (
    <section id={id} className="scroll-mt-24 border-t border-white/10 py-16">
      <div className="mx-auto w-full max-w-5xl px-6">
        {title ? (
          <h2 className="text-sm font-medium tracking-wide text-white/70">{title}</h2>
        ) : null}
        <div className={cn(title ? 'mt-6' : '')}>{children}</div>
      </div>
    </section>
  );

  const Pill = ({ children }: { children: React.ReactNode }) => (
    <span className="inline-flex items-center rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs text-white/75">
      {children}
    </span>
  );

  const PrimaryButton = ({
    children,
    onClick,
    type = 'button',
    disabled,
  }: {
    children: React.ReactNode;
    onClick?: () => void;
    type?: 'button' | 'submit';
    disabled?: boolean;
  }) => (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={cn(
        'inline-flex items-center justify-center rounded-xl px-5 py-3 text-sm font-semibold',
        'transition focus:outline-none focus:ring-2 focus:ring-offset-0',
        disabled
          ? 'cursor-not-allowed bg-white/10 text-white/40'
          : 'bg-white text-black hover:bg-white/90',
      )}
      style={{ boxShadow: `0 0 0 1px rgba(255,255,255,0.08) inset` }}
    >
      {children}
    </button>
  );

  const GhostButton = ({
    children,
    onClick,
  }: {
    children: React.ReactNode;
    onClick: () => void;
  }) => (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex items-center justify-center rounded-xl border border-white/15 bg-white/5 px-5 py-3 text-sm font-semibold text-white/85 hover:bg-white/10 transition"
    >
      {children}
    </button>
  );

  // --- RENDER ---
  return (
    <div className="min-h-screen bg-[#05060A] text-white">
      {/* Top bar */}
      <header className="sticky top-0 z-50 border-b border-white/10 bg-[#05060A]/80 backdrop-blur">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <div
              className="h-2.5 w-2.5 rounded-full"
              style={{ backgroundColor: ACCENT, boxShadow: `0 0 18px ${ACCENT}` }}
              aria-hidden
            />
            <div className="text-sm font-semibold tracking-wide">Stockfish</div>
          </div>

          <nav className="hidden md:flex items-center gap-6 text-xs text-white/70">
            <a className="hover:text-white transition" href="#product">
              Product
            </a>
            <a className="hover:text-white transition" href="#ingredients">
              Ingredients
            </a>
            <a className="hover:text-white transition" href="#nutrition">
              Nutrition
            </a>
            <a className="hover:text-white transition" href="#stockfish">
              Stockfish
            </a>
            <a className="hover:text-white transition" href="#company">
              Company
            </a>
            <a className="hover:text-white transition" href="#batch">
              Batch
            </a>
          </nav>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={scrollToWaitlist}
              className="hidden sm:inline-flex items-center justify-center rounded-xl border border-white/15 bg-white/5 px-4 py-2 text-xs font-semibold text-white/85 hover:bg-white/10 transition"
            >
              Join the waitlist
            </button>
            <button
              type="button"
              onClick={scrollToWaitlist}
              className="inline-flex sm:hidden items-center justify-center rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-xs font-semibold text-white/85 hover:bg-white/10 transition"
              aria-label="Join the waitlist"
            >
              Join
            </button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <main>
        <section className="relative overflow-hidden">
          <div
            className="pointer-events-none absolute -top-24 left-1/2 h-72 w-[48rem] -translate-x-1/2 rounded-full opacity-25 blur-3xl"
            style={{ background: `radial-gradient(circle at center, ${ACCENT}, transparent 60%)` }}
            aria-hidden
          />

          <div className="mx-auto w-full max-w-6xl px-6 pb-10 pt-16 md:pt-20">
            <div className="flex flex-col gap-10">
              <div className="flex flex-wrap items-center gap-2">
                <Pill>Air-dried</Pill>
                <Pill>Icelandic cod</Pill>
                <Pill>Vacuum-sealed</Pill>
                <Pill>Limited batches</Pill>
              </div>

              <div className="max-w-3xl">
                <p className="text-sm text-white/70">Air-dried Icelandic cod protein</p>

                <div className="mt-6 space-y-2 text-3xl font-semibold leading-tight tracking-tight md:text-5xl">
                  <div>82% protein.</div>
                  <div>Fish. Air. Sea salt.</div>
                  <div className="text-white/90">Shelf-stable.</div>
                </div>

                {/* NO HEADING — LOCKED */}
                <div className="mt-8 space-y-2 text-sm text-white/80">
                  <div>Protein you chew.</div>
                  <div>Not mix. Not disguise.</div>
                </div>

                <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:items-center">
                  <PrimaryButton onClick={scrollToWaitlist}>Join the waitlist</PrimaryButton>
                  <div className="text-xs text-white/60">Limited first batch.</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Product */}
        <Section id="product" title="Product">
          <div className="grid gap-10 md:grid-cols-2">
            <div className="space-y-5">
              <div className="text-lg font-semibold tracking-tight text-white/90">
                One product. One version. Done properly.
              </div>

              <div className="space-y-2 text-sm leading-relaxed text-white/75">
                <p>For training, travel, field work, hiking, and preparedness.</p>
                <p>No preparation. Eat as it is.</p>
                <p>One pack is food.</p>
              </div>

              <div className="mt-6 flex flex-wrap gap-2">
                <Pill>100 g pack</Pill>
                <Pill>Lightly salted</Pill>
                <Pill>Hand-broken pieces</Pill>
                <Pill>24 months shelf life</Pill>
              </div>

              <div className="mt-8 space-y-1 text-xs text-white/55">
                <div>Price: €{PRICE_EUR} / 249 SEK</div>
                <div>Free shipping on orders over €{FREE_SHIP_THRESHOLD_EUR}.</div>
              </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
              <div className="text-xs font-medium tracking-wide text-white/60">Packaging</div>
              <div className="mt-3 text-sm text-white/80">
                Vacuum-sealed. No refrigeration required. Shelf-stable.
              </div>

              <div className="mt-8 border-t border-white/10 pt-6">
                <div className="text-xs font-medium tracking-wide text-white/60">Use</div>
                <div className="mt-3 space-y-2 text-sm text-white/80">
                  <div>Open.</div>
                  <div>Eat.</div>
                  <div>Done.</div>
                </div>
              </div>

              <div className="mt-8">
                <button
                  type="button"
                  onClick={scrollToWaitlist}
                  className="w-full rounded-xl border border-white/15 bg-white/5 px-5 py-3 text-sm font-semibold text-white/85 hover:bg-white/10 transition"
                >
                  Join the waitlist
                </button>
                <div className="mt-2 text-center text-xs text-white/60">Limited first batch.</div>
              </div>
            </div>
          </div>
        </Section>

        {/* Ingredients */}
        <Section id="ingredients" title="Ingredients">
          <div className="max-w-3xl space-y-4 text-sm leading-relaxed text-white/80">
            <div>Wild-caught Icelandic cod.</div>
            <div>Sea salt.</div>
            <div className="pt-2 text-white/90">Nothing else.</div>
          </div>
        </Section>

        {/* Nutrition */}
        <Section id="nutrition" title="Nutrition">
          <div className="max-w-3xl">
            <div className="grid gap-3 rounded-2xl border border-white/10 bg-white/[0.03] p-6 text-sm text-white/80">
              <div className="flex items-center justify-between">
                <span>Protein</span>
                <span>82 g per 100 g</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Fat</span>
                <span>&lt;2 g per 100 g</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Carbohydrates</span>
                <span>0 g</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Salt</span>
                <span>~2 g per 100 g</span>
              </div>

              <div className="my-2 border-t border-white/10" />

              <div className="flex items-center justify-between">
                <span>Shelf life</span>
                <span>24 months (unopened)</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Storage</span>
                <span>No refrigeration required</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Packaging</span>
                <span>Vacuum-sealed</span>
              </div>
            </div>
          </div>
        </Section>

        {/* Stockfish (heritage) */}
        <Section id="stockfish" title="Stockfish">
          <div className="max-w-4xl space-y-6">
            <h3 className="text-lg font-semibold tracking-tight text-white/90">
              Before protein powder, there was stockfish.
            </h3>

            <div className="space-y-4 text-sm leading-relaxed text-white/75">
              <p>Stockfish is one of the oldest protein foods in the world.</p>

              <p>
                For over a thousand years, air-dried cod carried fishermen, explorers, traders, and
                armies across the North Atlantic.
                <br />
                Not as a snack. As food.
              </p>

              <p>
                Before refrigeration.
                <br />
                Before supplements.
                <br />
                Before processing.
              </p>

              <p className="text-white/85">Fish, air, time, and salt.</p>

              <p>
                Most of the water is removed. What’s left is dense, natural nutrition — close to 80
                g protein per 100 g, shelf-stable, savory.
              </p>

              <p>
                What we’re doing isn’t new. We’re bringing it back — carefully.
                <br />
                And the first people in help decide how the next batch is made.
              </p>
            </div>
          </div>
        </Section>

        {/* Company */}
        <Section id="company" title="Company">
          <div className="max-w-4xl space-y-5 text-sm leading-relaxed text-white/75">
            <p className="text-white/90">
              Stockfish exists for a simple reason:
              <br />
              most protein products aren’t food anymore.
            </p>

            <p>
              We work with air-dried cod from Iceland — preserved by cold air, time, and restraint.
              <br />
              No flavor systems. No binders. No shortcuts.
            </p>

            <p>
              The goal isn’t convenience at any cost.
              <br />
              The goal is protein that behaves like food.
            </p>

            <p>
              We start small, produce in limited batches, and let the product speak first.
              <br />
              Everything else comes later.
            </p>
          </div>
        </Section>

        {/* Batch + Waitlist */}
        <Section id="batch" title="Batch">
          <div className="max-w-4xl space-y-6">
            <h3 className="text-lg font-semibold tracking-tight text-white/90">Batch 1 is limited.</h3>

            <div className="space-y-4 text-sm leading-relaxed text-white/75">
              <p>
                We’re launching with one product.
                <br />
                And it won’t be for everyone.
              </p>

              <p>
                The first batch is small — intentionally.
                <br />
                Those who get in early influence what comes next:
                <br />
                cut, texture, and preparation.
              </p>

              <p className="text-white/85">
                Not feedback.
                <br />
                Decisions.
              </p>

              <p>
                Once the first batch is gone, we move forward.
                <br />
                Next drops won’t be shaped by the waitlist.
              </p>
            </div>

            <div ref={waitlistRef} className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
              <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                <div className="space-y-1">
                  <div className="text-sm font-semibold text-white/90">Join the waitlist</div>
                  <div className="text-xs text-white/60">Limited first batch.</div>
                </div>

                <div className="w-full max-w-md">
                  {view === 'SUCCESS' ? (
                    <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                      <div className="text-sm font-semibold text-white/90">You’re in.</div>
                      <div className="mt-1 text-xs text-white/70">
                        You’ll hear from us when the first batch opens.
                      </div>

                      <div className="mt-4">
                        <GhostButton onClick={resetForm}>Add another email</GhostButton>
                      </div>
                    </div>
                  ) : view === 'SURVEY' ? (
                    <div className="space-y-3">
                      <div className="text-xs text-white/70">
                        Quick question (optional): what are you most interested in?
                      </div>

                      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                        <button
                          type="button"
                          onClick={() => setPreference('PURE')}
                          className={cn(
                            'rounded-xl border px-4 py-3 text-left text-sm transition',
                            preference === 'PURE'
                              ? 'border-white/40 bg-white/10 text-white'
                              : 'border-white/15 bg-white/5 text-white/80 hover:bg-white/10',
                          )}
                        >
                          Pure & minimal
                        </button>

                        <button
                          type="button"
                          onClick={() => setPreference('RAW')}
                          className={cn(
                            'rounded-xl border px-4 py-3 text-left text-sm transition',
                            preference === 'RAW'
                              ? 'border-white/40 bg-white/10 text-white'
                              : 'border-white/15 bg-white/5 text-white/80 hover:bg-white/10',
                          )}
                        >
                          Raw & intense
                        </button>
                      </div>

                      {errorMsg ? <div className="text-xs text-red-300">{errorMsg}</div> : null}

                      <div className="flex items-center gap-3">
                        <PrimaryButton onClick={handleSurveyFinish} disabled={isSubmitting}>
                          {isSubmitting ? 'Saving…' : 'Finish'}
                        </PrimaryButton>

                        <button
                          type="button"
                          onClick={handleSurveySkip}
                          className="text-xs text-white/60 hover:text-white/80 transition"
                          disabled={isSubmitting}
                        >
                          Skip
                        </button>
                      </div>
                    </div>
                  ) : (
                    <form onSubmit={handleEmailSubmit} className="space-y-3">
                      <div className="flex gap-3">
                        <input
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="Email"
                          className={cn(
                            'w-full rounded-xl border px-4 py-3 text-sm text-white placeholder:text-white/40',
                            'bg-[#05060A] focus:outline-none',
                            view === 'ERROR' ? 'border-red-400/50' : 'border-white/15',
                          )}
                          inputMode="email"
                          autoComplete="email"
                        />

                        <PrimaryButton type="submit" disabled={!canSubmitEmail}>
                          {isSubmitting ? 'Saving…' : 'Join'}
                        </PrimaryButton>
                      </div>

                      {errorMsg ? <div className="text-xs text-red-300">{errorMsg}</div> : null}

                      <div className="text-xs text-white/60">Limited first batch.</div>
                    </form>
                  )}
                </div>
              </div>
            </div>
          </div>
        </Section>

        {/* Footer */}
        <footer className="border-t border-white/10 py-10">
          <div className="mx-auto w-full max-w-6xl px-6">
            <div className="flex flex-col gap-2 text-xs text-white/55">
              <div>Stockfish.</div>
              <div className="text-white/40">
                Air-dried Icelandic cod protein. Vacuum-sealed. Limited batches.
              </div>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
}
