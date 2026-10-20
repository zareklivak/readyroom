"use client";

// Small presentational building blocks for the brief. Kept deliberately plain —
// the wow is information architecture, not ornament.

import { createContext, useContext } from "react";
import type { Claim as ClaimT, Confidence } from "@/lib/brief-schema";
import { sectionMeta, formatSeconds } from "@/lib/brief-meta";
import { stanceMeta } from "@/lib/stance";

// Chips open the source slide-over without prop-drilling a callback everywhere.
export const CiteContext = createContext<(sourceId: string, claimText: string) => void>(
  () => {},
);

const CONFIDENCE_LABEL: Record<Confidence, string> = {
  confirmed: "Confirmed",
  inferred: "Inferred",
  speculative: "Speculative",
};

// Confidence tag → token color (defined in globals.css @theme).
const CONFIDENCE_CLASS: Record<Confidence, string> = {
  confirmed: "text-confirmed bg-confirmed/10",
  inferred: "text-inferred bg-inferred/10",
  speculative: "text-speculative bg-speculative/10",
};

export function ConfidenceTag({ confidence }: { confidence: Confidence }) {
  return (
    <span
      className={`inline-flex items-center rounded px-1.5 py-0.5 text-[11px] font-medium ${CONFIDENCE_CLASS[confidence]}`}
      title={`Confidence: ${CONFIDENCE_LABEL[confidence]}`}
    >
      {CONFIDENCE_LABEL[confidence]}
    </span>
  );
}

export function CitationChip({ sourceId, claimText }: { sourceId: string; claimText: string }) {
  const openCite = useContext(CiteContext);
  return (
    <button
      type="button"
      onClick={() => openCite(sourceId, claimText)}
      className="rounded bg-accent-weak px-1.5 py-0.5 font-mono text-[11px] leading-none text-accent transition hover:bg-accent hover:text-white"
      aria-label={`View source ${sourceId}`}
    >
      {sourceId}
    </button>
  );
}

// Bold the first sentence — the skim device that carries each claim's point.
// The splitter skips abbreviations ("St.", "Inc.") so it doesn't break mid-name.
const ABBREVIATIONS = new Set([
  "st", "mr", "mrs", "ms", "dr", "inc", "ltd", "co", "vs", "etc", "no", "jr", "sr",
]);

function splitFirstSentence(text: string): [string, string] {
  const re = /[.?!]/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(text)) !== null) {
    const end = m.index + 1;
    if (end < 15) continue; // too short to be a real sentence
    const lastWord = text.slice(0, m.index).split(/\s+/).pop() ?? "";
    if (ABBREVIATIONS.has(lastWord.toLowerCase())) continue; // e.g. "St." "Inc."
    const next = text[end];
    if (next === undefined) return [text, ""]; // terminator at the very end
    if (/\s/.test(next)) return [text.slice(0, end), text.slice(end)];
  }
  return [text, ""];
}

function boldFirstSentence(text: string) {
  const [first, rest] = splitFirstSentence(text);
  return (
    <>
      <strong className="font-semibold">{first}</strong>
      {rest}
    </>
  );
}

/** A claim: text (optionally bold-first-sentence) + confidence tag + citation chips. */
export function Claim({ claim, bold = true }: { claim: ClaimT; bold?: boolean }) {
  return (
    <span>
      <span className="text-ink">{bold ? boldFirstSentence(claim.text) : claim.text}</span>{" "}
      <span className="inline-flex flex-wrap items-center gap-1 align-middle">
        {claim.confidence && <ConfidenceTag confidence={claim.confidence} />}
        {claim.citations.map((id) => (
          <CitationChip key={id} sourceId={id} claimText={claim.text} />
        ))}
      </span>
    </span>
  );
}

export function StanceTag({ stance }: { stance: string }) {
  const s = stanceMeta(stance);
  return (
    <span className="inline-flex items-center gap-1.5 text-xs font-medium text-ink-soft">
      <span className={`h-2 w-2 rounded-full ${s.dot}`} aria-hidden />
      {s.label}
    </span>
  );
}

/** Section wrapper: anchor + header (label · time badge) + "replaces" note. */
export function Section({ id, children }: { id: string; children: React.ReactNode }) {
  const meta = sectionMeta(id);
  if (!meta) return null;
  const replaces =
    meta.replacesMinutes > 0
      ? `Replaces: ${meta.replacesLabel} — ~${meta.replacesMinutes} min`
      : `Replaces: ${meta.replacesLabel}`;
  return (
    <section id={id} className="scroll-mt-20 border-t border-hair pt-8">
      <div className="mb-3 flex items-baseline justify-between gap-3">
        <h2 className="text-lg font-semibold tracking-tight text-ink">{meta.label}</h2>
        <span className="shrink-0 font-mono text-xs text-ink-soft">
          {formatSeconds(meta.readSeconds)}
        </span>
      </div>
      <p className="mb-4 text-xs italic text-ink-soft">{replaces}</p>
      <div className="space-y-3 text-[15px] leading-relaxed">{children}</div>
    </section>
  );
}
