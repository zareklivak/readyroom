// Source registry — the single place that knows every citable record across
// the four systems. It flattens each mock into a uniform { sourceId, system,
// title, text } "snippet" so downstream code can:
//   • validate that a citation the model emits actually exists (Phase 6 evals),
//   • render a citation chip's slide-over with the real source text (Phase 4).
//
// On import it asserts every sourceId is unique — a duplicate throws loudly at
// module load rather than silently shadowing a record.

import type { SourceSystem } from "./types";
import { SYSTEM_LABEL } from "./types";
import { salesforce } from "./salesforce";
import { gong } from "./gong";
import { knowledgeBase } from "./kb";
import { publicInfo } from "./public-info";

export interface SourceSnippet {
  sourceId: string;
  system: SourceSystem;
  systemLabel: string;
  title: string;
  text: string;
}

function mmss(totalSec: number): string {
  const m = Math.floor(totalSec / 60);
  const s = totalSec % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

const speakerName = new Map(gong.call.parties.map((p) => [p.speakerId, p.name]));

function buildSnippets(): SourceSnippet[] {
  const out: SourceSnippet[] = [];
  const push = (
    sourceId: string,
    system: SourceSystem,
    title: string,
    text: string,
  ) => out.push({ sourceId, system, systemLabel: SYSTEM_LABEL[system], title, text });

  // --- Salesforce ---------------------------------------------------------
  const a = salesforce.account;
  push(
    a.sourceId,
    "salesforce",
    `Account · ${a.Name}`,
    `${a.Name} — ${a.Industry}, ${a.BillingCity}, ${a.BillingState}. ~${a.NumberOfEmployees.toLocaleString()} employees. ${a.Description}`,
  );

  const o = salesforce.opportunity;
  push(
    o.sourceId,
    "salesforce",
    `Opportunity · ${o.Name}`,
    `Stage: ${o.StageName}. Lead source: ${o.LeadSource}. Next step: ${o.NextStep}. ${o.Description}`,
  );

  for (const c of salesforce.contacts) {
    push(
      c.sourceId,
      "salesforce",
      `Contact · ${c.Name}, ${c.Title}`,
      `${c.Name} — ${c.Title}, ${c.Department}. ${c.Description}`,
    );
  }

  const e = salesforce.discoveryEvent;
  const attendeeLine = e.Attendees.map(
    (at) => `${at.Name} (${at.Title}, ${at.Company}; ${at.Affiliation})`,
  ).join("; ");
  push(
    e.sourceId,
    "salesforce",
    `Event · ${e.Subject}`,
    `${e.Subject} — ${e.StartDateTime}, ${e.DurationInMinutes} min. Attendees: ${attendeeLine}. ${e.Description}`,
  );

  for (const t of salesforce.activities) {
    push(
      t.sourceId,
      "salesforce",
      `${t.TaskSubtype} · ${t.Subject}`,
      `${t.ActivityDate} — ${t.Subject}. ${t.Description}`,
    );
  }

  // --- Gong ---------------------------------------------------------------
  const call = gong.call;
  const trackerLine = call.content.trackers
    .map((tr) => `${tr.name} ×${tr.count}`)
    .join(", ");
  push(
    call.sourceId,
    "gong",
    `Gong call · ${call.metaData.title}`,
    `${call.metaData.title} (${Math.round(call.metaData.durationSec / 60)} min, ${call.metaData.scheduled.slice(0, 10)}). Sentiment: ${call.sentiment.overall}. Trackers: ${trackerLine}. ${call.content.brief}`,
  );

  for (const turn of gong.transcript) {
    const who = speakerName.get(turn.speakerId) ?? turn.speakerId;
    push(
      turn.sourceId,
      "gong",
      `Gong transcript · ${who} @ ${mmss(turn.startSec)}`,
      `${who}: ${turn.text}`,
    );
  }

  // --- Knowledge base -----------------------------------------------------
  for (const cs of knowledgeBase.caseStudies) {
    push(
      cs.sourceId,
      "kb",
      cs.title,
      `${cs.title} — ${cs.customer} (${cs.industry}, ${cs.matterType}). Challenge: ${cs.challenge} Results: ${cs.results.join(" ")}`,
    );
  }
  for (const doc of knowledgeBase.productDocs) {
    push(
      doc.sourceId,
      "kb",
      doc.title,
      `${doc.title} — ${doc.summary} Capabilities: ${doc.capabilities.join("; ")}.`,
    );
  }

  // --- Public web ---------------------------------------------------------
  for (const n of publicInfo.news) {
    push(
      n.sourceId,
      "news",
      `${n.outlet} · ${n.headline}`,
      `${n.headline} (${n.outlet}, ${n.publishedDate}). ${n.summary}`,
    );
  }

  return out;
}

export const SOURCE_SNIPPETS: SourceSnippet[] = buildSnippets();

// Assert uniqueness at load time — a duplicate sourceId is a data bug.
const seen = new Set<string>();
const dupes: string[] = [];
for (const s of SOURCE_SNIPPETS) {
  if (seen.has(s.sourceId)) dupes.push(s.sourceId);
  seen.add(s.sourceId);
}
if (dupes.length > 0) {
  throw new Error(`Duplicate sourceId(s) in corpus: ${dupes.join(", ")}`);
}

export const SOURCE_IDS: ReadonlySet<string> = seen;

const byId = new Map(SOURCE_SNIPPETS.map((s) => [s.sourceId, s]));

/** Resolve a citation id to its snippet (title + source text). */
export function resolveSource(sourceId: string): SourceSnippet | undefined {
  return byId.get(sourceId);
}

/** True if a citation id refers to a real record in the corpus. */
export function isValidSourceId(sourceId: string): boolean {
  return byId.has(sourceId);
}
