// The one-page measurement brief (attached to the submission): how we'd measure
// success and what we'd iterate on first. Metric definitions are written to be
// unambiguous to a sales / RevOps / enablement reader. Sized to print on one page.

import Link from "next/link";
import { PrintButton } from "@/components/spec/PrintButton";
import { Logo } from "@/components/Logo";

export const metadata = {
  title: "ReadyRoom — Measuring Success (one-pager)",
};

interface Metric {
  metric: string;
  definition: string;
  measured: string;
  target: string;
}

// Phase 1+ instrumented metrics. Illustrative targets are tagged as assumptions.
const METRICS: Metric[] = [
  {
    metric: "Prep time",
    definition: "Minutes from opening prep to being ready for a discovery call.",
    measured: "Instrumented time-in-tool, plus periodic self-report.",
    target: "45 → <5 min (illustrative)",
  },
  {
    metric: "Brief opened before call",
    definition: "Of discovery calls, the share where the rep opened the brief before the call started.",
    measured: "Brief-open timestamp vs. calendar start time.",
    target: "70% by week 4 (illustrative)",
  },
  {
    metric: "Hypothesis-confirmation rate",
    definition: "Of the pains the brief predicted, the share the prospect confirmed on the recorded call.",
    measured: "Post-Call Scorecard grades each predicted pain against the Gong transcript.",
    target: "Calibrate — an accuracy signal, not a number to maximize.",
  },
  {
    metric: "Question-adoption rate",
    definition: "Of the discovery questions the brief suggested, the share the rep actually asked.",
    measured: "Scorecard checks each suggested question against the transcript.",
    target: "≥50% (illustrative)",
  },
  {
    metric: "Trust",
    definition: "Reported inaccuracies per brief, and the share of briefs edited before use.",
    measured: "👍/👎, edit events, and rep-reported errors.",
    target: "Errors → 0; edit rate trending down.",
  },
  {
    metric: "Discovery → next-stage conversion (lagging)",
    definition: "Of briefed discovery calls, the share that advance to the next opportunity stage.",
    measured: "CRM stage change after the call.",
    target: "Improve vs. baseline.",
  },
];

const TH = "border-b border-ink/20 px-2 py-1.5 text-left font-semibold text-ink align-bottom";
const TD = "border-b border-hair px-2 py-1.5 align-top text-ink-soft";

export default function OnePagerPage() {
  return (
    <main className="print-doc">
      <div className="no-print mb-6 flex items-center justify-between">
        <Link href="/architecture" className="text-sm text-accent underline">
          ← Architecture
        </Link>
        <PrintButton />
      </div>

      <article className="one-pager text-[13px] leading-relaxed">
        <header className="mb-3 border-b border-hair pb-3">
          <h1 className="flex items-center gap-2 text-xl font-semibold tracking-tight text-ink">
            <Logo size={22} />
            <span>
              Ready<span className="text-accent">Room</span> — Measuring success &amp; what
              we&apos;d iterate on first
            </span>
          </h1>
        </header>

        <p className="mb-3">
          <span className="font-semibold text-ink">North star:</span> cut discovery-call prep from
          ~45 minutes to under 5 — <span className="italic">without losing call quality</span>. The
          guardrail matters as much as the goal.
        </p>

        <p className="mb-3">
          <span className="font-semibold text-ink">Phase 0 (weeks 0–2) — validate the baseline.</span>{" "}
          Before instrumenting anything, shadow 3–5 reps through real prep. The 45-minute figure is a
          hypothesis too: confirm it, learn where the time actually goes, then instrument.
          Qualitative first; instrumentation is the durable system.
        </p>

        <h2 className="mb-2 mt-4 text-sm font-semibold uppercase tracking-wide text-accent">
          Phase 1+ — instrumented metrics
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr>
                <th className={TH}>Metric</th>
                <th className={TH}>What it means (plain language)</th>
                <th className={TH}>How it&apos;s measured</th>
                <th className={TH}>Target</th>
              </tr>
            </thead>
            <tbody>
              {METRICS.map((m) => (
                <tr key={m.metric}>
                  <td className={`${TD} font-medium text-ink`}>{m.metric}</td>
                  <td className={TD}>{m.definition}</td>
                  <td className={TD}>{m.measured}</td>
                  <td className={`${TD} text-ink`}>{m.target}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <p className="mt-4">
          <span className="font-semibold text-ink">Goodhart guard.</span> We won&apos;t declare
          victory on time saved alone. Prep time down is paired with hypothesis-confirmation rate up
          and discovery→next-stage conversion — a brief that&apos;s fast but wrong is worse than no
          brief.
        </p>

        <p className="mt-3">
          <span className="font-semibold text-ink">Lagging indicators.</span> Discovery→next-stage
          conversion and new-rep ramp time — slower to move, but the outcomes that justify the tool.
        </p>

        <p className="mt-3">
          <span className="font-semibold text-ink">Iterate first.</span> Grounding and trust, plus
          Gong-extraction quality — adoption dies the first time a brief is wrong in front of a
          prospect. Then tune the &ldquo;Ask these&rdquo; section using question-adoption data: the
          confidence tags become measurable calibration over time.
        </p>

        <footer className="mt-5 border-t border-hair pt-3 text-[11px] text-ink-soft">
          Targets marked &ldquo;(illustrative)&rdquo; are assumptions to be set with the team, not
          commitments. Portfolio project — all data, people and companies are fictional.
        </footer>
      </article>
    </main>
  );
}
