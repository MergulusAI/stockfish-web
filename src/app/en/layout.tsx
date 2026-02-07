import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Stockfish",
  description: "Icelandic stockfish.",
  metadataBase: new URL("https://stockfish.se"),
  alternates: {
    canonical: "/en",
    languages: {
      sv: "/",
      en: "/en",
    },
  },
};

export default function EnLayout({ children }: { children: React.ReactNode }) {
  // NOTE: Sub-layout must NOT render <html> or <body>. Root layout owns that.
  return children;
}
