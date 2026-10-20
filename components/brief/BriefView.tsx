"use client";

// The brief view — the submission's centerpiece. Single-column ~720px spine
// (inherited from the app layout), sticky rail, and the regenerate/feedback bar.
// Renders entirely from the schema-typed brief object. The citation slide-over
// lives one level up (MeetingTabs) so the Brief and Scorecard tabs share it.

import type { Brief } from "@/lib/brief-schema";
import { TOTAL_REPLACED_MINUTES } from "@/lib/brief-meta";
import { Claim, Section, StanceTag } from "@/components/brief/pieces";
import { BriefRail } from "@/components/brief/BriefRail";
import { RegenerateBar } from "@/components/brief/RegenerateBar";
import { useReadingProgress } from "@/components/brief/useReadingProgress";
import { DealStageTrack, CallSignals, type BriefSignals } from "@/components/brief/Visuals";

export interface BriefMeta {
  companyName: string;
  meetingLabel: string;
  generatedAtLabel: string;
}

export function BriefView({
  initialBrief,
  meta,
  signals,
}: {
  initialBrief: Brief;
  meta: BriefMeta;
  signals: BriefSignals;
}) {
  const brief = initialBrief;
  const { progress, activeId } = useReadingProgress();

  return (
    <>
      {/* Top reading-progress bar */}
      <div
        className="fixed left-0 top-0 z-30 h-0.5 bg-accent transition-[width] duration-150"
        style={{ width: `${progress * 100}%` }}
        aria-hidden
      />

      <BriefRail progress={progress} activeId={activeId} />

      <article>
        {/* Header */}
        <header className="mb-5">
          <h1 className="text-2xl font-semibold tracking-tight text-ink">
            {meta.companyName}
          </h1>
          <p className="mt-1 text-sm text-ink-soft">{meta.meetingLabel}</p>
          <p className="mt-0.5 text-xs text-ink-soft">{meta.generatedAtLabel}</p>
        </header>

        {/* What-this-replaced strip */}
        <div className="mb-5 rounded-lg border border-hair bg-canvas px-4 py-2.5 text-sm text-ink-soft">
          Replaces <span className="font-medium text-ink">~{TOTAL_REPLACED_MINUTES} min</span>{" "}
          of manual prep — designed to read in{" "}
          <span className="font-medium text-ink">~5 min</span>.
        </div>

        <div className="mb-8">
          <RegenerateBar meetingId={brief.meetingId} />
        </div>

        {/* TL;DR hero card */}
        <section id="tldr" className="scroll-mt-20">
          <div className="rounded-xl border border-accent/25 bg-accent-weak/50 p-5">
            <div className="mb-3 flex items-baseline justify-between">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-accent">
                TL;DR
              </h2>
              <span className="font-mono text-xs text-ink-soft">0:20</span>
            </div>
            <ul className="space-y-2.5 text-[15px] leading-relaxed">
              {brief.tldr.map((c, i) => (
                <li key={i} className="flex gap-2">
                  <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" aria-hidden />
                  <Claim claim={c} />
                </li>
              ))}
            </ul>
          </div>
        </section>

        <div className="mt-8 space-y-8">
          {/* Who's in the room */}
          <Section id="room">
            <ul className="space-y-4">
              {brief.room.map((m, i) => (
                <li key={i}>
                  <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
                    <span className="font-semibold text-ink">{m.name}</span>
                    <span className="text-sm text-ink-soft">{m.title}</span>
                    <StanceTag stance={m.stance} />
                  </div>
                  <div className="mt-1">
                    <Claim claim={m.note} bold={false} />
                  </div>
                </li>
              ))}
            </ul>
          </Section>

          {/* Deal state */}
          <Section id="dealState">
            <DealStageTrack stages={signals.stages} current={signals.dealStage} />
            <ClaimList claims={brief.dealState} />
          </Section>

          {/* Last conversation */}
          <Section id="lastConversation">
            <ClaimList claims={brief.lastConversation} />
            <CallSignals
              sentiment={signals.call.sentiment}
              repTalkRatio={signals.call.repTalkRatio}
              trackers={signals.call.trackers}
            />
          </Section>

          {/* Why now */}
          <Section id="whyNow">
            <ClaimList claims={brief.whyNow} />
          </Section>

          {/* Buried alpha */}
          {brief.buriedAlpha && (
            <section id="buriedAlpha" className="scroll-mt-20 border-t border-hair pt-8">
              <div className="mb-3 flex items-baseline justify-between gap-3">
                <h2 className="text-lg font-semibold tracking-tight text-ink">
                  Buried alpha
                </h2>
                <span className="shrink-0 font-mono text-xs text-ink-soft">0:20</span>
              </div>
              <div className="rounded-xl border border-accent/30 bg-accent-weak/60 p-4 text-[15px] leading-relaxed">
                <span className="mr-1.5" aria-hidden>💎</span>
                <Claim claim={brief.buriedAlpha} />
              </div>
            </section>
          )}

          {/* Hypothesized pains */}
          <Section id="hypothesizedPains">
            <ul className="space-y-4">
              {brief.hypothesizedPains.map((h) => (
                <li key={h.id}>
                  <div className="flex gap-2">
                    <span className="mt-0.5 shrink-0 rounded bg-canvas px-1.5 py-0.5 font-mono text-[11px] text-ink-soft">
                      {h.id}
                    </span>
                    <span className="font-semibold text-ink">{h.pain}</span>
                  </div>
                  <div className="mt-1 pl-8 text-ink-soft">
                    <Claim claim={h.rationale} bold={false} />
                  </div>
                </li>
              ))}
            </ul>
          </Section>

          {/* Proof points */}
          <Section id="proofPoints">
            <ul className="space-y-4">
              {brief.proofPoints.map((p, i) => (
                <li key={i}>
                  <div className="font-semibold text-ink">{p.title}</div>
                  <div className="mt-1">
                    <Claim claim={p.note} bold={false} />
                  </div>
                </li>
              ))}
            </ul>
          </Section>

          {/* Ask these */}
          <Section id="askThese">
            <ol className="space-y-4">
              {brief.askThese.map((q) => (
                <li key={q.id}>
                  <div className="flex gap-2">
                    <span className="mt-0.5 shrink-0 rounded bg-canvas px-1.5 py-0.5 font-mono text-[11px] text-ink-soft">
                      {q.id}
                    </span>
                    <span className="font-semibold text-ink">{q.question}</span>
                  </div>
                  <div className="mt-1 pl-8 text-ink-soft">
                    <Claim claim={q.rationale} bold={false} />
                  </div>
                </li>
              ))}
            </ol>
          </Section>

          {/* Landmines */}
          <Section id="landmines">
            <ul className="space-y-3">
              {brief.landmines.map((l, i) => (
                <li
                  key={i}
                  className="rounded-lg border border-red-200 bg-red-50 p-3.5"
                >
                  <div className="mb-1 font-semibold text-red-800">⚠ {l.title}</div>
                  <div className="text-[15px] leading-relaxed text-red-900/90">
                    <Claim claim={l.guidance} bold={false} />
                  </div>
                </li>
              ))}
            </ul>
          </Section>

          {/* What we don't know */}
          <Section id="unknowns">
            <ul className="space-y-2">
              {brief.unknowns.map((u, i) => (
                <li key={i} className="flex gap-2 text-ink-soft">
                  <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-ink-soft" aria-hidden />
                  <span>{u.text}</span>
                </li>
              ))}
            </ul>
            <p className="mt-3 text-xs italic text-ink-soft">
              These are honest gaps — the sources don&apos;t establish them, so the brief
              won&apos;t guess.
            </p>
          </Section>
        </div>
      </article>
    </>
  );
}

function ClaimList({ claims }: { claims: Brief["dealState"] }) {
  return (
    <ul className="space-y-2.5">
      {claims.map((c, i) => (
        <li key={i} className="flex gap-2">
          <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-hair" aria-hidden />
          <Claim claim={c} />
        </li>
      ))}
    </ul>
  );
}
