// Deterministic context-assembly pipeline. No agentic tool-calling
// loop: for a known meeting with four known sources, an agent loop would add
// latency, cost, and nondeterminism for zero benefit. "Choosing boring is the
// senior tradeoff." The pipeline is four plain steps:
//
//   1. LOAD    the four sources for this meeting
//   2. SELECT  the relevant slice (here: rank the KB; everything else fits)
//   3. TAG     every fact with its [SOURCE-ID]
//   4. EMIT    one structured context block for a single Claude call
//
// RAG verdict: at one-meeting scope everything fits in context, so
// there is no vector store. The flip threshold is named in the spec (KB >~50
// docs / multi-year Gong → retrieval on KB+Gong only). The KB ranking here is
// the one place selection is real work — it demonstrates the ranking step that
// retrieval would formalize at scale.

import { salesforce } from "@/data/salesforce";
import { gong } from "@/data/gong";
import { knowledgeBase, type KbDoc } from "@/data/kb";
import { publicInfo } from "@/data/public-info";
import { DISCOVERY_MEETING } from "@/data";

/** Tags describing this meeting's matter — the "query" the KB is ranked against.
 *  Derived deterministically from the account/opportunity/matter. */
const MATTER_TAGS = [
  "construction",
  "construction-defect",
  "general-contractor",
  "multi-party",
  "in-house",
  "subcontractor-records",
  "change-orders",
  "early-case-assessment",
  "ai-assisted-review",
];

export interface RankedKbDoc {
  doc: KbDoc;
  score: number;
  relevance: "high" | "medium" | "low";
}

/** Rank KB docs by tag overlap with the matter. Deterministic; the visible
 *  output is that the perfect defect analog rises to the top and the off-topic
 *  case studies sink — the ranking a retriever would do at scale. */
export function rankKnowledgeBase(): RankedKbDoc[] {
  const query = new Set(MATTER_TAGS);
  const all: KbDoc[] = [
    ...knowledgeBase.caseStudies,
    ...knowledgeBase.productDocs,
  ];
  const ranked = all
    .map((doc) => {
      const score = doc.tags.filter((t) => query.has(t)).length;
      return { doc, score };
    })
    .sort((a, b) => b.score - a.score);

  const top = ranked[0]?.score ?? 0;
  return ranked.map(({ doc, score }) => ({
    doc,
    score,
    relevance: score >= Math.max(3, top - 1) ? "high" : score >= 1 ? "medium" : "low",
  }));
}

export interface AssembledContext {
  contextBlock: string;
  /** Every source ID the model is allowed to cite — the assembled slice. */
  allowedSourceIds: string[];
}

/** Build the single grounded context block for the discovery-call brief. */
export function assembleContext(): AssembledContext {
  const ids: string[] = [];
  const lines: string[] = [];
  const add = (id: string, text: string) => {
    ids.push(id);
    lines.push(`[${id}] ${text}`);
  };

  const { account, opportunity, contacts, discoveryEvent, activities } =
    salesforce;

  // --- Meeting ------------------------------------------------------------
  lines.push("# THE MEETING");
  const attendees = discoveryEvent.Attendees.map(
    (a) => `${a.Name} (${a.Title}, ${a.Company}; ${a.Affiliation})`,
  ).join("; ");
  add(
    discoveryEvent.sourceId,
    `${discoveryEvent.Subject} — ${discoveryEvent.DurationInMinutes} min, today. Attendees: ${attendees}. Note: ${discoveryEvent.Description}`,
  );

  // --- Salesforce ---------------------------------------------------------
  lines.push("\n# SALESFORCE (CRM)");
  add(
    account.sourceId,
    `Account: ${account.Name} — ${account.Industry}, HQ ${account.BillingCity} ${account.BillingState}, ~${account.NumberOfEmployees.toLocaleString()} employees. ${account.Description}`,
  );
  add(
    opportunity.sourceId,
    `Opportunity: stage ${opportunity.StageName}, lead source ${opportunity.LeadSource}. Next step: ${opportunity.NextStep}. ${opportunity.Description}`,
  );
  for (const c of contacts) {
    add(c.sourceId, `Contact: ${c.Name}, ${c.Title}. ${c.Description}`);
  }
  for (const t of activities) {
    add(t.sourceId, `Activity (${t.TaskSubtype}, ${t.ActivityDate}): ${t.Subject}. ${t.Description}`);
  }

  // --- Gong ---------------------------------------------------------------
  lines.push("\n# GONG (call intelligence)");
  const trackers = gong.call.content.trackers
    .map((tr) => `${tr.name}: ${tr.count}`)
    .join(", ");
  add(
    gong.call.sourceId,
    `Intro call, ${salesforce.activities[0].ActivityDate}. Overall sentiment: ${gong.call.sentiment.overall}. Tracker mentions — ${trackers}. Auto-summary: ${gong.call.content.brief}`,
  );
  lines.push("Full transcript (cite individual turns):");
  const speakerName = new Map(gong.call.parties.map((p) => [p.speakerId, p.name]));
  for (const turn of gong.transcript) {
    add(turn.sourceId, `${speakerName.get(turn.speakerId)}: ${turn.text}`);
  }

  // --- Public web ---------------------------------------------------------
  lines.push("\n# PUBLIC WEB");
  for (const n of publicInfo.news) {
    add(
      n.sourceId,
      `${n.outlet} (${n.publishedDate}) — "${n.headline}". ${n.summary} ${n.body}`,
    );
  }

  // --- Knowledge base (ranked) -------------------------------------------
  lines.push("\n# KNOWLEDGE BASE (ranked by relevance to this matter)");
  for (const { doc, relevance } of rankKnowledgeBase()) {
    if (doc.kind === "case-study") {
      add(
        doc.sourceId,
        `[relevance: ${relevance}] Case study — ${doc.title} (${doc.customer}, ${doc.industry}, ${doc.matterType}). Challenge: ${doc.challenge} Results: ${doc.results.join(" ")}`,
      );
    } else {
      add(
        doc.sourceId,
        `[relevance: ${relevance}] Product — ${doc.title}. ${doc.summary} Capabilities: ${doc.capabilities.join("; ")}.`,
      );
    }
  }

  return {
    contextBlock: lines.join("\n"),
    allowedSourceIds: ids,
  };
}

export { DISCOVERY_MEETING };
