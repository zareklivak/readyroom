// Server loader for the meeting page (Brief + Post-Call Scorecard tabs). Reads
// and validates both precomputed artifacts, and resolves the whole corpus into
// snippets so every citation chip — in either tab, and in a live-regenerated
// brief — opens its source.

import precomputedBrief from "@/data/precomputed-brief.json";
import precomputedScorecard from "@/data/precomputed-scorecard.json";
import { BriefSchema, ScorecardSchema } from "@/lib/brief-schema";
import { SOURCE_SNIPPETS } from "@/data/sources";
import { salesforce } from "@/data/salesforce";
import { gong } from "@/data/gong";
import { DISCOVERY_MEETING } from "@/data";
import { MeetingTabs } from "@/components/brief/MeetingTabs";
import type { BriefMeta } from "@/components/brief/BriefView";
import type { BriefSignals } from "@/components/brief/Visuals";
import type { ActiveSource } from "@/components/brief/SourceSlideOver";

const PIPELINE_STAGES = ["Lead", "Discovery", "Evaluation", "Proposal", "Closed"];

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export default async function MeetingPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await params; // single-meeting demo; id is accepted for routing parity

  const brief = BriefSchema.parse(precomputedBrief);
  const scorecard = ScorecardSchema.parse(precomputedScorecard);

  // Resolve the full corpus once — any cited id (brief, scorecard, or a live
  // regeneration) has a snippet to open.
  const sources: Record<string, Omit<ActiveSource, "claimText">> = {};
  for (const s of SOURCE_SNIPPETS) {
    sources[s.sourceId] = {
      sourceId: s.sourceId,
      system: s.system,
      systemLabel: s.systemLabel,
      title: s.title,
      text: s.text,
    };
  }

  const prospectAttendees = DISCOVERY_MEETING.attendees.filter(
    (a) => a.Affiliation !== "Quarry",
  ).length;

  const meta: BriefMeta = {
    companyName: salesforce.account.Name,
    meetingLabel: `Discovery call · Today, 10:00 AM MT · ${prospectAttendees} attendees`,
    generatedAtLabel: `Brief precomputed · ${formatDate(brief.generatedAt)}`,
  };

  // Signals for the data visuals — derived from the same CRM + Gong records the
  // brief is grounded in.
  const signals: BriefSignals = {
    dealStage: salesforce.opportunity.StageName,
    stages: PIPELINE_STAGES,
    call: {
      sentiment: gong.call.sentiment.overall,
      repTalkRatio: gong.call.interaction.repTalkRatio,
      trackers: gong.call.content.trackers
        .filter((t) => t.count > 0)
        .map((t) => ({ name: t.name, count: t.count })),
    },
  };

  return (
    <MeetingTabs
      brief={brief}
      meta={meta}
      scorecard={scorecard}
      sources={sources}
      signals={signals}
    />
  );
}
