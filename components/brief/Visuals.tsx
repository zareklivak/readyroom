// Data visuals for the brief — kept to the ones that surface a real signal not
// already stated in text. Dataviz mark specs: thin marks, rounded ends, 2px
// gaps, labels in ink tokens (never color-alone), only the locked palette.

// ---------------------------------------------------------------------------
// Deal-stage track — where this opportunity sits in the pipeline.
// ---------------------------------------------------------------------------
export function DealStageTrack({ stages, current }: { stages: string[]; current: string }) {
  const idx = Math.max(0, stages.indexOf(current));
  return (
    <div className="my-1" aria-label={`Deal stage: ${current}`}>
      <div className="flex items-center gap-[3px]">
        {stages.map((s, i) => (
          <div
            key={s}
            className={`h-1.5 flex-1 rounded-full ${i <= idx ? "bg-accent" : "bg-hair"}`}
          />
        ))}
      </div>
      <div className="mt-1.5 flex justify-between">
        {stages.map((s, i) => (
          <span
            key={s}
            className={`text-[11px] ${i === idx ? "font-semibold text-accent" : "text-ink-soft"}`}
          >
            {s}
          </span>
        ))}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Call signals — sentiment, talk ratio, and tracker hits from the intro call.
// The one visual carrying data that's nowhere in the brief text.
// ---------------------------------------------------------------------------
export interface CallSignalsData {
  sentiment: string;
  repTalkRatio: number; // 0–1
  trackers: { name: string; count: number }[];
}

export interface BriefSignals {
  dealStage: string;
  stages: string[];
  call: CallSignalsData;
}

export function CallSignals({ sentiment, repTalkRatio, trackers }: CallSignalsData) {
  const repPct = Math.round(repTalkRatio * 100);
  const maxCount = Math.max(...trackers.map((t) => t.count), 1);
  const sorted = [...trackers].sort((a, b) => b.count - a.count);
  return (
    <div className="my-3 rounded-lg border border-hair bg-canvas p-4">
      <div className="mb-3 text-xs font-semibold uppercase tracking-wide text-ink-soft">
        Intro-call signals
      </div>

      {/* Sentiment */}
      <div className="mb-3 flex items-center gap-2 text-sm">
        <span className="h-2 w-2 rounded-full bg-confirmed" aria-hidden />
        <span className="text-ink-soft">Sentiment</span>
        <span className="font-medium text-ink">{sentiment}</span>
      </div>

      {/* Talk ratio */}
      <div className="mb-3">
        <div className="mb-1 flex justify-between text-xs text-ink-soft">
          <span>Talk ratio</span>
          <span className="tabular-nums">
            Rep {repPct}% · Prospect {100 - repPct}%
          </span>
        </div>
        <div className="flex h-2.5 gap-[2px] overflow-hidden rounded-full">
          <div className="rounded-l-full bg-accent" style={{ width: `${repPct}%` }} />
          <div className="flex-1 rounded-r-full bg-speculative/40" />
        </div>
      </div>

      {/* Trackers — magnitude bars, single hue */}
      <div className="space-y-1.5">
        <div className="text-xs text-ink-soft">Tracker mentions</div>
        {sorted.map((t) => (
          <div key={t.name} className="flex items-center gap-2 text-xs">
            <span className="w-28 shrink-0 truncate text-ink-soft">{t.name}</span>
            <div className="h-2 flex-1 overflow-hidden rounded-full bg-hair/60">
              <div className="h-full rounded-full bg-accent" style={{ width: `${(t.count / maxCount) * 100}%` }} />
            </div>
            <span className="w-5 shrink-0 text-right font-medium tabular-nums text-ink">{t.count}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
