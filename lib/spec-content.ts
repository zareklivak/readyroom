// Single source for the spec's structured content, rendered three ways: the
// in-app Architecture page (screen), the /docs/spec page (print-to-PDF), and —
// authored to match — README.md (GitHub). Keeping the drift-prone tables and the
// cost model here means the two in-app renderings never disagree.

import { MODEL_PRICING, costUsd, BRIEF_MODEL, LIVE_MODEL, COMPRESSION_MODEL } from "@/lib/cost";

// ---------------------------------------------------------------------------
// Architecture diagram (ASCII — renders identically on screen, in print, and on
// GitHub, so there's one diagram to maintain).
// ---------------------------------------------------------------------------
export const DIAGRAM = `SOURCES (adapters)      CONTEXT ASSEMBLY          REASONING             OUTPUT
 Salesforce  ┐          (deterministic TS)        one Claude call        Brief JSON
 Gong        ┤   ─────▶  load → select →    ─────▶  • assert only    ───▶  (schema-
 Public web  ┤          rank (KB) → tag             source-ID'd facts       validated)
 Knowledge   ┘          w/ [SOURCE-ID] →           • every claim cites   →  citation
 base                   one context block          • gaps → unknowns        chips + UI
                                                                              │
   nightly precompute  ◀── serve precomputed default ──────────────◀─────────┘
   (batch, cached)         + on-demand regenerate endpoint (rate-limited)

 EVAL THREAD:  dev harness (npm run evals)  ─▶  CI gate  ─▶  Post-Call Scorecard
               the same rules (R1–R6) enforced at three moments`;

// ---------------------------------------------------------------------------
// Source-adapter table: what we mocked vs. the real API it stands in for.
// ---------------------------------------------------------------------------
export interface AdapterRow {
  source: string;
  mock: string;
  realApi: string;
  notes: string;
}

export const SOURCE_ADAPTERS: AdapterRow[] = [
  {
    source: "Salesforce (CRM)",
    mock: "REST-ish objects — attributes / Id / PascalCase fields, FK relationships",
    realApi: "Salesforce REST + Bulk API (Account, Opportunity, Contact, Event, Task)",
    notes: "Small slice; always fits in context. Fields map 1:1.",
  },
  {
    source: "Gong (call intelligence)",
    mock: "Call object — metaData, parties, content.trackers, full transcript",
    realApi: "Gong API: /v2/calls/extensive + /v2/calls/transcript",
    notes: "Largest input. Cheap-tier transcript compression at scale.",
  },
  {
    source: "Public web",
    mock: "News items — outlet, headline, body, tags",
    realApi: "Web search API + fetch, or a firmographic data provider",
    notes: "Freshness matters; cache per company, refresh on a schedule.",
  },
  {
    source: "Knowledge base",
    mock: "Case studies + product one-pagers with tags",
    realApi: "Quarry content store / docs CMS",
    notes: "Ranked by tag overlap; switch to retrieval past the flip threshold.",
  },
];

// ---------------------------------------------------------------------------
// Tradeoffs: chosen / rejected / why / revisit-when (6 rows).
// ---------------------------------------------------------------------------
export interface TradeoffRow {
  decision: string;
  chosen: string;
  rejected: string;
  why: string;
  revisit: string;
}

export const TRADEOFFS: TradeoffRow[] = [
  {
    decision: "Pipeline shape",
    chosen: "Deterministic TS pipeline",
    rejected: "Agentic tool-calling loop",
    why: "A known meeting with four known sources doesn't need the model to decide what to fetch. A loop adds latency, cost, and nondeterminism for no benefit. Choosing boring is the senior call.",
    revisit: "Sources become dynamic/unknown and the agent must decide what to pull.",
  },
  {
    decision: "Retrieval",
    chosen: "Stuff the full context",
    rejected: "Vector store / RAG",
    why: "At one-meeting scope everything fits in a single context window. A vector DB would be infrastructure earning nothing.",
    revisit: "KB grows past ~50 docs, or Gong history spans years → retrieve on KB + Gong only (the Salesforce slice always fits).",
  },
  {
    decision: "Serving",
    chosen: "Nightly precompute (default) + on-demand regenerate",
    rejected: "Always on-demand",
    why: "Meetings are known in advance, so briefs can be built ahead — instant to open, cheap to batch, no cold-call latency in front of a prospect.",
    revisit: "Meetings routinely appear < 60 min out → the on-demand path covers the gap.",
  },
  {
    decision: "Output format",
    chosen: "Structured JSON (one schema)",
    rejected: "Markdown / free text",
    why: "Structure is load-bearing: citation chips, confidence tags, and the mechanical evals all fall out of the same schema. You can't lint a markdown blob.",
    revisit: "Never — the structure is the product.",
  },
  {
    decision: "Model choice (per stage)",
    chosen: `Flagship (${BRIEF_MODEL}) for the nightly precompute; a faster tier (${LIVE_MODEL}) for the interactive regen; cheap tier for transcript compression`,
    rejected: "One mid-tier model everywhere",
    why: "Match the model to the stage: the nightly brief has no latency budget, so it gets the flagship; the interactive 'Regenerate' has a hard serverless time limit, so it gets a faster tier — same pipeline, same grounding contract. Compressing a transcript is a cheap-tier job.",
    revisit: "Cost pressure → push more stages down a tier; latency pressure → fast mode on the flagship.",
  },
  {
    decision: "Access control (demo)",
    chosen: "Shared-password gate",
    rejected: "Real SSO in the prototype",
    why: "Auth isn't what's being evaluated, and a shared code lets reviewers in with one credential.",
    revisit: "Production → Okta SSO + permissions that inherit Salesforce visibility.",
  },
];

// ---------------------------------------------------------------------------
// Path to production: right-sized for an internal tool at ~250 GTM users.
// ---------------------------------------------------------------------------
export const PATH_TO_PRODUCTION = {
  framing:
    "This is a cost-and-trust scaling problem, not a traffic scaling problem. 250 GTM users generating a few briefs a day is trivial serverless load — the interesting scaling is keeping briefs cheap and trustworthy, not keeping servers up.",
  need: [
    "Okta SSO in place of the demo password gate.",
    "Permissions that inherit Salesforce visibility — a rep sees briefs only for accounts they can see in CRM.",
    "Prompt caching on the stable prefix + the nightly precompute batch, for cost control.",
    "Rate limiting (built) plus spend-budget alerts.",
    "Secrets management — model keys server-side only (already the case).",
    "Error tracking / observability (e.g. Sentry) on the pipeline and the live endpoint.",
    "Evals in CI gating prompt changes (built), and the post-call scorecard as the live eval loop.",
  ],
  dontNeed: [
    "Kubernetes or container orchestration — serverless functions are plenty.",
    "Load balancers or autoscaling fleets — the traffic is trivial.",
    "Multi-region — a single region is fine for an internal tool.",
    "A vector database — context fits until the KB/Gong flip threshold.",
    "A fine-tuned model — grounded prompting is enough; fine-tuning adds cost and a training-data liability.",
  ],
};

// ---------------------------------------------------------------------------
// Cost model. Token counts are heuristic estimates (chars ÷ 4) from the built
// context; `npm run precompute` records live actuals to data/precomputed-cost.json.
// ---------------------------------------------------------------------------
const EST_INPUT_TOKENS = 6700; // system prompt + assembled context (full transcript dominates)
const EST_OUTPUT_TOKENS = 4800; // brief JSON (~2.3K) + adaptive thinking (~2.5K)
const REPS = 250;
const BRIEFS_PER_REP_PER_DAY = 2;
const WORKDAYS_PER_MONTH = 21;

const perBriefUsd = costUsd({ inputTokens: EST_INPUT_TOKENS, outputTokens: EST_OUTPUT_TOKENS });
const briefsPerMonth = REPS * BRIEFS_PER_REP_PER_DAY * WORKDAYS_PER_MONTH;

export const COST = {
  model: BRIEF_MODEL,
  pricing: MODEL_PRICING[BRIEF_MODEL],
  compressionModel: COMPRESSION_MODEL,
  estInputTokens: EST_INPUT_TOKENS,
  estOutputTokens: EST_OUTPUT_TOKENS,
  perBriefUsd,
  reps: REPS,
  briefsPerRepPerDay: BRIEFS_PER_REP_PER_DAY,
  briefsPerMonth,
  perMonthUsd: perBriefUsd * briefsPerMonth,
  note: "Estimates (heuristic token counts). Prompt caching on the stable system+context prefix and cheap-tier transcript compression cut the input cost materially at batch scale.",
};

// ---------------------------------------------------------------------------
// The one pseudocode block: the nightly precompute scheduler — the
// piece the prototype implies but doesn't run.
// ---------------------------------------------------------------------------
export const SCHEDULER_PSEUDOCODE = `# Nightly precompute scheduler (unbuilt — the prototype precomputes one brief by hand)
# Runs ~T-12h before the day's meetings; briefs are ready when reps wake up.

for meeting in calendar.meetings_between(now, now + 24h):
    if meeting.type != "discovery_call":
        continue
    if cache.fresh(meeting.id):              # sources unchanged since last run
        continue

    ctx = assemble_context(meeting)          # load 4 sources → select → rank → tag
    # prompt caching: the system prompt + stable context prefix are cached,
    # so only the per-meeting tail is billed at full input rate.
    brief = claude.generate(ctx, schema=BriefSchema, cached_prefix=ctx.stable)

    if not evals.pass(brief):                # the SAME 5 checks CI runs
        alerts.notify("brief failed grounding evals", meeting)
        continue                             # never ship an ungrounded brief

    cache.put(meeting.id, brief)             # rep opens it instantly at T-0

# T-60m top-up for meetings created late (the on-demand path also covers this live).`;

// ---------------------------------------------------------------------------
// Section prose (dual-register: each opens with an "In short" line for GTM
// readers; technical depth follows). Some sections also render a table (handled
// by the page via `table`).
// ---------------------------------------------------------------------------
export interface SpecSection {
  id: string;
  title: string;
  inShort: string;
  body: string[];
  table?: "adapters" | "tradeoffs" | "cost" | "evals" | "diagram" | "pathToProd" | "pseudocode";
}

export const SECTIONS: SpecSection[] = [
  {
    id: "what-this-is",
    title: "1 · What this is",
    inShort:
      "ReadyRoom turns 45 minutes of manual meeting prep into a 5-minute read: a grounded, source-cited brief a rep opens right before a discovery call.",
    body: [
      "Field reps spend ~45 minutes assembling context before each discovery call — reading the CRM, re-listening to the last call, searching for company news, hunting the knowledge base for a relevant case study. ReadyRoom does that assembly automatically and hands the rep a single brief that ends in what to ASK and what to AVOID, not a wall of facts.",
      "Every claim in the brief traces to a source (Salesforce, Gong, public web, or the knowledge base) via a citation chip. Anything the sources don't establish is flagged as unknown rather than guessed. The prototype prepares one fictional discovery call end-to-end and designs all five sources; two (Salesforce, Gong) plus the knowledge base are mocked deeply.",
    ],
  },
  {
    id: "assumptions",
    title: "2 · Assumptions",
    inShort:
      "All data here is fictional. The scenario, the prospect, the transcript, and every case study are invented for this project.",
    body: [
      "The prospect (Northslope Construction Group), its people, the Gong call, the news items, and the knowledge-base case studies are entirely fictional. No confidential, proprietary, or customer data from anywhere is used. Product descriptions are written only at the level of a public website.",
      "Assumed inputs a production version would have: read access to Salesforce, Gong, a company-news source, and Quarry's knowledge base; a calendar to know which meetings are coming; and an LLM API. The rep's meeting is assumed to be a known calendar event (which is what makes precompute possible).",
    ],
  },
  {
    id: "rep-experience",
    title: "3 · The rep experience (where the 45 minutes goes)",
    inShort:
      "Each brief section maps to a manual step it replaces; the section time badges sum to ~5 minutes, the replaced steps to ~45.",
    body: [
      "The brief is built for the rep's five minutes, not the model's: a TL;DR hero card, a sticky rail with a 5:00 reading meter, time badges per section, and a bold-first-sentence pattern so it skims in one pass.",
      "Each section carries a subtle \"replaces\" note — e.g. \"Last conversation\" replaces re-listening to the intro call (~12 min); \"Why now\" replaces searching the web for news (~5 min). The header totals it: ~45 minutes of manual prep, designed to read in ~5.",
    ],
  },
  {
    id: "architecture",
    title: "4 · Architecture",
    inShort:
      "Four source adapters feed a deterministic assembly step, which feeds one Claude call, which produces a schema-validated brief. A nightly job precomputes the default; an on-demand endpoint regenerates on request (rate-limited).",
    body: [
      "The pipeline is four plain steps — load the sources, select the relevant slice, rank the knowledge base, tag every fact with a source ID — then a single model call that must obey a grounding contract, then a schema-validated JSON brief the UI renders. No agent loop, no vector store.",
    ],
    table: "diagram",
  },
  {
    id: "source-adapters",
    title: "5 · Source adapters (mock ↔ real)",
    inShort:
      "Each mocked source mimics the shape of the real API it stands in for, so swapping in the live integration is a field mapping, not a redesign.",
    body: [
      "The mocks are shaped like the real API responses (Salesforce REST objects, a Gong call object) on purpose — it makes the integration boundary honest and the swap mechanical.",
    ],
    table: "adapters",
  },
  {
    id: "reasoning",
    title: "6 · The reasoning layer",
    inShort:
      "One model call, structured JSON out, under a strict grounding contract: assert only cited facts, flag everything else as unknown.",
    body: [
      "The model receives one context block where every fact is tagged with a [SOURCE-ID]. Its contract (R1–R6): assert only source-ID'd facts; every claim must cite; never invent numbers, quotes, or names; anything not in context goes to \"What we don't know\"; tag each claim's confidence; output one JSON object matching the schema.",
      "Output is structured, not prose, because structure is load-bearing — citation chips, confidence tags, and the mechanical evals all derive from the same schema. Generation uses the flagship model with adaptive thinking and no temperature knob; determinism comes from the contract, not sampling.",
    ],
  },
  {
    id: "tradeoffs",
    title: "7 · Tradeoffs",
    inShort:
      "The interesting decisions and the road not taken — with the condition under which we'd revisit each.",
    body: [],
    table: "tradeoffs",
  },
  {
    id: "evaluation",
    title: "8 · The evaluation thread",
    inShort:
      "One continuous thread — the same grounding rules are checked at dev time, in CI, and in production after the call.",
    body: [
      "The system-prompt contract and the eval harness enforce the SAME numbered rules (prompt contract = eval contract). `npm run evals` runs five deterministic checks over the brief: schema validity, citation coverage, citation resolution, numeric grounding, and honest-unknowns. CI runs them on any change to the prompt, schema, or checks — prompt changes are code changes.",
      "The same idea closes the loop in production: a brief is a set of falsifiable predictions, and Gong records the ground truth. The Post-Call Scorecard grades each predicted pain against the transcript (confirmed / refuted / never surfaced) and checks which suggested questions were actually asked. Dev harness → CI gate → post-call scorecard: the same rules, three moments. A named-but-unbuilt next step is an LLM-judge faithfulness check, run on samples in production.",
    ],
    table: "evals",
  },
  {
    id: "path-to-production",
    title: "9 · Path to production",
    inShort:
      "At ~250 GTM users this is a cost-and-trust problem, not a traffic problem. What you need is SSO, CRM-inherited permissions, caching, and evals-in-CI; what you don't need is Kubernetes, load balancers, or a vector DB.",
    body: [],
    table: "pathToProd",
  },
  {
    id: "cost",
    title: "10 · Cost",
    inShort:
      "A brief costs roughly a dime and a half to generate; briefing every discovery call for 250 reps runs on the order of a few thousand dollars a month before caching.",
    body: [
      "The input is dominated by the full Gong transcript. Prompt caching on the stable system+context prefix and cheap-tier transcript compression cut that materially at batch scale. Token counts below are heuristic estimates; `npm run precompute` records live actuals.",
    ],
    table: "cost",
  },
  {
    id: "security-privacy",
    title: "11 · Security & privacy",
    inShort:
      "Demo access is a shared password (production would be SSO); model keys stay server-side; no customer data trains any model.",
    body: [
      "The prototype gates access with a shared password over a signed HttpOnly cookie — stated plainly as demo-only; production replaces it with Okta SSO and permissions that inherit Salesforce visibility. The Anthropic key is server-side only, never shipped to the browser, and the live endpoint is rate-limited with a spend cap.",
      "For a legal buyer specifically: no customer data is used to train any model, and briefs are grounded in the customer's own systems of record with every claim traceable. All data in this exercise is fictional.",
    ],
  },
  {
    id: "build-next",
    title: "12 · What we'd build next",
    inShort:
      "Ship the nightly scheduler, wire the two easiest real integrations first, and turn the scorecard's signals into the calibration dashboard.",
    body: [
      "First: the nightly precompute scheduler (pseudocode below) so briefs are ready before reps wake up. Then the two highest-signal real integrations — Salesforce and Gong — behind the adapter boundary already designed. Then turn the auto-instrumented scorecard metrics (hypothesis-confirmation rate, question-adoption rate) into a calibration view so the confidence tags become measurable over time.",
    ],
    table: "pseudocode",
  },
];
