// Today view — the rep's morning. One READY meeting with a rich card
// that links to the brief, and two greyed teasers whose "brief generates at
// T-60 min" label implies the nightly precompute pipeline without building it.

import Link from "next/link";
import precomputedBrief from "@/data/precomputed-brief.json";
import { BriefSchema } from "@/lib/brief-schema";
import { salesforce } from "@/data/salesforce";
import { DISCOVERY_MEETING, TODAY } from "@/data";
import { stanceMeta } from "@/lib/stance";

function todayLabel(): string {
  return new Date(`${TODAY}T12:00:00`).toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

// Two fictional teasers — no data behind them, on purpose.
const TEASERS = [
  { time: "1:30 PM", type: "Discovery call", company: "Kestrel Logistics" },
  { time: "3:15 PM", type: "Follow-up", company: "Aldermoor Health System" },
];

export default function TodayPage() {
  const brief = BriefSchema.parse(precomputedBrief);
  const stanceByName = new Map(brief.room.map((m) => [m.name, m.stance]));

  const attendees = DISCOVERY_MEETING.attendees
    .filter((a) => a.Affiliation !== "Quarry")
    .map((a) => ({ ...a, stance: stanceByName.get(a.Name) ?? "neutral" }));

  return (
    <section>
      <header className="mb-1">
        <h1 className="text-2xl font-semibold tracking-tight text-ink">Today</h1>
        <p className="mt-1 text-sm text-ink-soft">{todayLabel()} · 3 meetings</p>
      </header>

      <div className="mt-6 space-y-3">
        {/* The one ready meeting */}
        <Link
          href={`/meeting/${DISCOVERY_MEETING.id}`}
          className="block rounded-xl border border-hair bg-surface p-5 transition hover:border-accent/50 hover:shadow-sm"
        >
          <div className="flex items-center justify-between gap-3">
            <div className="text-sm font-medium text-ink-soft">
              10:00 AM · Discovery call
            </div>
            <span className="rounded-full bg-confirmed/10 px-2.5 py-1 text-xs font-semibold uppercase tracking-wide text-confirmed">
              Ready
            </span>
          </div>

          <h2 className="mt-2 text-lg font-semibold tracking-tight text-ink">
            {salesforce.account.Name}
          </h2>
          <p className="mt-1 text-sm text-ink-soft">
            Inbound after a document-heavy construction-defect lawsuit — they came to you.
          </p>

          <ul className="mt-4 space-y-1.5 border-t border-hair pt-3">
            {attendees.map((a) => {
              const s = stanceMeta(a.stance);
              return (
                <li key={a.Name} className="flex items-center gap-2 text-sm">
                  <span className={`h-2 w-2 shrink-0 rounded-full ${s.dot}`} aria-hidden />
                  <span className="font-medium text-ink">{a.Name}</span>
                  <span className="text-ink-soft">{a.Title}</span>
                  <span className="ml-auto text-xs text-ink-soft">{s.label}</span>
                </li>
              );
            })}
          </ul>

          <div className="mt-4 text-sm font-medium text-accent">Open brief →</div>
        </Link>

        {/* Greyed teasers — imply the pipeline, hold no data */}
        {TEASERS.map((t) => (
          <div
            key={t.company}
            className="cursor-not-allowed rounded-xl border border-hair bg-canvas p-5 opacity-60"
            aria-disabled
          >
            <div className="flex items-center justify-between gap-3">
              <div className="text-sm font-medium text-ink-soft">
                {t.time} · {t.type}
              </div>
              <span className="rounded-full border border-hair px-2.5 py-1 text-xs font-medium text-ink-soft">
                Brief generates at T-60 min
              </span>
            </div>
            <h2 className="mt-2 text-lg font-semibold tracking-tight text-ink-soft">
              {t.company}
            </h2>
          </div>
        ))}
      </div>
    </section>
  );
}
