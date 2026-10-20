"use client";

// The meeting page's two surfaces: Brief and Post-Call Scorecard.
// The citation slide-over and its context live HERE so both tabs share one
// slide-over — a chip in either view opens the same panel. Sources are resolved
// server-side and passed in; live-regenerated briefs still resolve because the
// full corpus is available.

import { useState } from "react";
import type { Brief, Scorecard } from "@/lib/brief-schema";
import { CiteContext } from "@/components/brief/pieces";
import { BriefView, type BriefMeta } from "@/components/brief/BriefView";
import { ScorecardView } from "@/components/brief/ScorecardView";
import { SourceSlideOver, type ActiveSource } from "@/components/brief/SourceSlideOver";
import type { BriefSignals } from "@/components/brief/Visuals";

type SourceSnippet = Omit<ActiveSource, "claimText">;
type Tab = "brief" | "scorecard";

export function MeetingTabs({
  brief,
  meta,
  scorecard,
  sources,
  signals,
}: {
  brief: Brief;
  meta: BriefMeta;
  scorecard: Scorecard;
  sources: Record<string, SourceSnippet>;
  signals: BriefSignals;
}) {
  const [tab, setTab] = useState<Tab>("brief");
  const [active, setActive] = useState<ActiveSource | null>(null);

  const openCite = (sourceId: string, claimText: string) => {
    const s = sources[sourceId];
    if (s) setActive({ ...s, claimText });
  };

  return (
    <CiteContext.Provider value={openCite}>
      {/* Tab bar */}
      <div className="mb-6 flex gap-1 border-b border-hair">
        <TabButton active={tab === "brief"} onClick={() => setTab("brief")}>
          Brief
        </TabButton>
        <TabButton active={tab === "scorecard"} onClick={() => setTab("scorecard")}>
          Post-Call Scorecard
        </TabButton>
      </div>

      {tab === "brief" ? (
        <BriefView initialBrief={brief} meta={meta} signals={signals} />
      ) : (
        <ScorecardView scorecard={scorecard} />
      )}

      <SourceSlideOver source={active} onClose={() => setActive(null)} />
    </CiteContext.Provider>
  );
}

function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`-mb-px border-b-2 px-3 py-2 text-sm font-medium transition ${
        active
          ? "border-accent text-accent"
          : "border-transparent text-ink-soft hover:text-ink"
      }`}
    >
      {children}
    </button>
  );
}
