// The brief schema — one zod schema doing two jobs: it validates the
// model's JSON output AND powers the mechanical eval harness (Phase 6). Because
// every claim is structured ({ text, citations, confidence }) rather than prose,
// the UI can render citation chips and confidence tags, and the evals can lint
// it. "You can't lint a markdown blob."
//
// The 10 sections mirror the brief the rep reads:
//   tldr · room · dealState · lastConversation · whyNow · hypothesizedPains ·
//   proofPoints · askThese · landmines · unknowns
// Pains carry stable IDs H1..Hn and questions Q1..Qn so the Post-Call Scorecard
// can reference and grade them after the call.

import { z } from "zod";

/** Confidence tag on a claim — becomes the green/amber/grey chip in the UI and
 *  a measurable calibration signal over time. */
export const Confidence = z.enum(["confirmed", "inferred", "speculative"]);
export type Confidence = z.infer<typeof Confidence>;

/** The atomic unit of the brief: an assertion that must trace to ≥1 source. */
export const Claim = z.object({
  text: z.string().min(1),
  citations: z.array(z.string()).min(1), // source IDs (SF-*, GONG-*, NEWS-*, KB-*)
  confidence: Confidence.optional(),
});
export type Claim = z.infer<typeof Claim>;

/** An honest gap. Deliberately has NO citations — you can't cite the absence of
 *  a fact. Kept structurally distinct from Claim so the eval's citation-coverage
 *  check applies to claims only, and the unknowns stay demonstrably honest. */
export const Unknown = z.object({
  text: z.string().min(1),
});
export type Unknown = z.infer<typeof Unknown>;

export const RoomMember = z.object({
  name: z.string(),
  title: z.string(),
  stance: z.enum([
    "champion",
    "skeptic",
    "blocker",
    "economic-buyer",
    "supportive",
    "neutral",
  ]),
  note: Claim,
});
export type RoomMember = z.infer<typeof RoomMember>;

export const Hypothesis = z.object({
  id: z.string().regex(/^H\d+$/), // H1, H2, ...
  pain: z.string(),
  rationale: Claim, // cited reasoning; confidence lives here
});
export type Hypothesis = z.infer<typeof Hypothesis>;

export const ProofPoint = z.object({
  title: z.string(),
  note: Claim, // why this KB asset is relevant, cited to the KB doc
});
export type ProofPoint = z.infer<typeof ProofPoint>;

export const DiscoveryQuestion = z.object({
  id: z.string().regex(/^Q\d+$/), // Q1, Q2, ...
  question: z.string(),
  rationale: Claim, // why to ask it, grounded in a source
});
export type DiscoveryQuestion = z.infer<typeof DiscoveryQuestion>;

export const Landmine = z.object({
  title: z.string(),
  guidance: Claim,
});
export type Landmine = z.infer<typeof Landmine>;

export const BriefSchema = z.object({
  meetingId: z.string(),
  generatedAt: z.string(),
  tldr: z.array(Claim).min(1),
  room: z.array(RoomMember).min(1),
  dealState: z.array(Claim).min(1),
  lastConversation: z.array(Claim).min(1),
  whyNow: z.array(Claim).min(1),
  /** The "no one's thinking about it" insight — rendered as the 💎 callout.
   *  Often a synthesis across two sources. */
  buriedAlpha: Claim.optional(),
  hypothesizedPains: z.array(Hypothesis).min(1),
  proofPoints: z.array(ProofPoint).min(1),
  askThese: z.array(DiscoveryQuestion).min(1),
  landmines: z.array(Landmine).min(1),
  unknowns: z.array(Unknown).min(1),
});
export type Brief = z.infer<typeof BriefSchema>;

/** Every Claim in the brief, flattened — the eval harness iterates this for
 *  citation-coverage, citation-resolution, and numeric-grounding checks.
 *  Unknowns are intentionally excluded (they carry no citations). */
export function allClaims(brief: Brief): Claim[] {
  const claims: Claim[] = [
    ...brief.tldr,
    ...brief.room.map((m) => m.note),
    ...brief.dealState,
    ...brief.lastConversation,
    ...brief.whyNow,
    ...brief.hypothesizedPains.map((h) => h.rationale),
    ...brief.proofPoints.map((p) => p.note),
    ...brief.askThese.map((q) => q.rationale),
    ...brief.landmines.map((l) => l.guidance),
  ];
  if (brief.buriedAlpha) claims.push(brief.buriedAlpha);
  return claims;
}

// ---------------------------------------------------------------------------
// Post-Call Scorecard — a brief is a set of falsifiable predictions;
// Gong records the ground truth. After the call, each prior hypothesis is scored
// against the transcript, and each suggested question is checked for whether it
// was actually asked. Same grounding discipline: every judgement cites a turn.
// ---------------------------------------------------------------------------

export const HypothesisOutcome = z.enum([
  "confirmed", // the prospect confirmed this pain on the call
  "refuted", // the prospect contradicted it
  "not-surfaced", // never came up — the brief predicted something untested
]);
export type HypothesisOutcome = z.infer<typeof HypothesisOutcome>;

const TranscriptEvidence = z.object({
  quote: z.string(),
  citations: z.array(z.string()).min(1), // GONG-<turn> ids
});

export const ScoredHypothesis = z.object({
  id: z.string().regex(/^H\d+$/),
  pain: z.string(),
  predictedConfidence: Confidence,
  outcome: HypothesisOutcome,
  evidence: TranscriptEvidence.optional(), // present unless not-surfaced
});
export type ScoredHypothesis = z.infer<typeof ScoredHypothesis>;

export const ScoredQuestion = z.object({
  id: z.string().regex(/^Q\d+$/),
  question: z.string(),
  asked: z.boolean(),
  evidence: TranscriptEvidence.optional(), // present when asked
});
export type ScoredQuestion = z.infer<typeof ScoredQuestion>;

export const ScorecardSchema = z.object({
  callSourceId: z.string(), // the Gong call graded against (GONG-CALL)
  headline: z.string(),
  hypotheses: z.array(ScoredHypothesis).min(1),
  questions: z.array(ScoredQuestion).min(1),
  dealAdvanced: z.boolean(),
});
export type Scorecard = z.infer<typeof ScorecardSchema>;
