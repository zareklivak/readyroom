"use client";

// Post-Call Scorecard — the self-grading loop, visible. The previous
// brief's predicted pains and suggested questions, graded against the intro
// call's transcript. Uses the same citation-chip pattern, pointed at Gong turns,
// so clicking any quote opens the exact line in the slide-over.

import type { Scorecard, HypothesisOutcome, Confidence } from "@/lib/brief-schema";
import { CitationChip, ConfidenceTag } from "@/components/brief/pieces";

const OUTCOME: Record<HypothesisOutcome, { label: string; cls: string }> = {
  confirmed: { label: "Confirmed", cls: "text-confirmed bg-confirmed/10" },
  refuted: { label: "Refuted", cls: "text-red-700 bg-red-100" },
  "not-surfaced": { label: "Not surfaced", cls: "text-speculative bg-speculative/10" },
};

function OutcomeBadge({ outcome }: { outcome: HypothesisOutcome }) {
  const o = OUTCOME[outcome];
  return (
    <span className={`inline-flex items-center rounded px-1.5 py-0.5 text-[11px] font-medium ${o.cls}`}>
      {o.label}
    </span>
  );
}

function Evidence({ quote, citations }: { quote: string; citations: string[] }) {
  return (
    <div className="mt-1.5 border-l-2 border-hair pl-3 text-sm text-ink-soft">
      <span className="italic">&ldquo;{quote}&rdquo;</span>{" "}
      <span className="inline-flex flex-wrap gap-1 align-middle">
        {citations.map((id) => (
          <CitationChip key={id} sourceId={id} claimText={quote} />
        ))}
      </span>
    </div>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div>
      <div className="text-xl font-semibold text-ink">{value}</div>
      <div className="text-xs text-ink-soft">{label}</div>
    </div>
  );
}

export function ScorecardView({ scorecard }: { scorecard: Scorecard }) {
  const confirmed = scorecard.hypotheses.filter((h) => h.outcome === "confirmed").length;
  const asked = scorecard.questions.filter((q) => q.asked).length;

  return (
    <article>
      <header className="mb-5">
        <h1 className="text-2xl font-semibold tracking-tight text-ink">
          Post-Call Scorecard
        </h1>
        <p className="mt-2 text-[15px] leading-relaxed text-ink">
          A brief is a set of testable predictions — the same Gong data that feeds it
          grades it.
        </p>
        <p className="mt-1 text-xs text-ink-soft">
          Previous brief graded against the intro call{" "}
          <CitationChip sourceId={scorecard.callSourceId} claimText={scorecard.headline} />
        </p>
      </header>

      {/* Stat strip */}
      <div className="mb-6 grid grid-cols-3 gap-4 rounded-xl border border-hair bg-surface p-5">
        <Stat value={`${confirmed} / ${scorecard.hypotheses.length}`} label="pains confirmed" />
        <Stat value={`${asked} / ${scorecard.questions.length}`} label="questions asked" />
        <Stat value={scorecard.dealAdvanced ? "Yes" : "No"} label="deal advanced" />
      </div>

      <p className="mb-6 text-[15px] leading-relaxed text-ink-soft">{scorecard.headline}</p>

      {/* Hypotheses */}
      <section className="border-t border-hair pt-6">
        <h2 className="mb-4 text-lg font-semibold tracking-tight text-ink">
          Predicted pains
        </h2>
        <ul className="space-y-4">
          {scorecard.hypotheses.map((h) => (
            <li key={h.id}>
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded bg-canvas px-1.5 py-0.5 font-mono text-[11px] text-ink-soft">
                  {h.id}
                </span>
                <OutcomeBadge outcome={h.outcome} />
                <span className="text-xs text-ink-soft">
                  predicted{" "}
                  <ConfidenceTag confidence={h.predictedConfidence as Confidence} />
                </span>
              </div>
              <p className="mt-1 text-[15px] leading-relaxed text-ink">{h.pain}</p>
              {h.evidence && (
                <Evidence quote={h.evidence.quote} citations={h.evidence.citations} />
              )}
            </li>
          ))}
        </ul>
      </section>

      {/* Questions */}
      <section className="mt-8 border-t border-hair pt-6">
        <h2 className="mb-4 text-lg font-semibold tracking-tight text-ink">
          Suggested questions
        </h2>
        <ul className="space-y-4">
          {scorecard.questions.map((q) => (
            <li key={q.id}>
              <div className="flex items-start gap-2">
                <span
                  className={`mt-0.5 shrink-0 text-sm font-semibold ${q.asked ? "text-confirmed" : "text-speculative"}`}
                  aria-hidden
                >
                  {q.asked ? "✓" : "○"}
                </span>
                <div>
                  <p className="text-[15px] leading-relaxed text-ink">
                    <span className="mr-1.5 font-mono text-[11px] text-ink-soft">{q.id}</span>
                    {q.question}
                    <span className="ml-2 text-xs text-ink-soft">
                      {q.asked ? "asked" : "not asked"}
                    </span>
                  </p>
                  {q.evidence && (
                    <Evidence quote={q.evidence.quote} citations={q.evidence.citations} />
                  )}
                </div>
              </div>
            </li>
          ))}
        </ul>
      </section>

      <p className="mt-8 border-t border-hair pt-4 text-xs italic text-ink-soft">
        Predictions that never surfaced stay in &ldquo;What we don&apos;t know&rdquo; — the
        loop won&apos;t quietly fill a gap it couldn&apos;t verify.
      </p>
    </article>
  );
}
