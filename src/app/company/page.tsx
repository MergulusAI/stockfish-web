"use client";

import Link from "next/link";

export default function CompanyPage() {
  return (
    <div className="min-h-screen bg-[#0B0E14] text-white">
      {/* HEADER */}
      <header className="fixed top-0 w-full z-50 border-b border-white/10 bg-[#0B0E14]/70 backdrop-blur">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-baseline gap-3">
            <div className="font-bold text-xl">Stockfish</div>
            <div className="text-xs text-white/55">Icelandic stockfish</div>
          </div>

          <nav className="hidden md:flex gap-6 text-xs text-white/55">
            <Link href="/product" className="hover:text-white transition-colors">
              Product
            </Link>
            <span className="text-white">Company</span>
          </nav>

          <Link
            href="/product"
            className="px-4 py-2 text-xs border border-white/15 bg-white/[0.06] hover:bg-white/[0.16] transition-colors rounded-2xl"
          >
            Back
          </Link>
        </div>
      </header>

      {/* BODY */}
      <main className="pt-28 px-6 max-w-3xl mx-auto">
        <h1 className="text-3xl md:text-5xl font-semibold">Company</h1>

        <div className="mt-10 rounded-3xl border border-white/10 bg-white/[0.03] p-7">
          <div className="font-mono text-sm md:text-[15px] text-white/80 space-y-3">
            <div>Stockfish exists for a simple reason:</div>
            <div>most protein products aren't food anymore.</div>
            <div>This is food.</div>
            <div>Simple. Stable. Whole.</div>

            <div className="pt-6 text-white/55 space-y-3">
              <div>
                We’re not building a brand experience. We’re building food.
              </div>
              <div>
                Vacuum-sealed. Shelf-stable. Built for storage.
              </div>
              <div>
                One product. One standard.
              </div>
            </div>
          </div>
        </div>

        <div className="mt-10 text-xs text-white/45">
          Stockfish.se — Icelandic stockfish.
        </div>
      </main>
    </div>
  );
}
