// The eval checks — the ENFORCEMENT half of "prompt contract = eval contract".
// Each check is deterministic and cross-referenced to the rule it
// enforces in prompts/brief-system.ts (R1-R6). The prompt asks the model to obey
// the rules; these checks prove it did. Same rules, two enforcement points.
//
// Named-but-not-built (honest scoping): a semantic LLM-judge
// faithfulness check. In production that runs on samples; the deterministic
// checks below run on every brief.

import { allClaims, type Brief } from "../lib/brief-schema";
import { SOURCE_IDS, resolveSource } from "../data/sources";

export interface CheckResult {
  id: number;
  rule: string; // the contract rule this enforces
  name: string;
  pass: boolean;
  detail: string;
}

/** Text units in the brief that make factual assertions, paired with the
 *  citations that must ground any number they contain. Claims carry their own
 *  citations; a pain/question/title is grounded by its rationale/note. */
function groundedUnits(brief: Brief): { text: string; citations: string[] }[] {
  const units = allClaims(brief).map((c) => ({ text: c.text, citations: c.citations }));
  for (const h of brief.hypothesizedPains) units.push({ text: h.pain, citations: h.rationale.citations });
  for (const q of brief.askThese) units.push({ text: q.question, citations: q.rationale.citations });
  for (const p of brief.proofPoints) units.push({ text: p.title, citations: p.note.citations });
  return units;
}

// --- Check 2 · R2 CITATIONS: every claim cites at least one source -----------
export function citationCoverage(brief: Brief): CheckResult {
  const uncited = allClaims(brief).filter((c) => c.citations.length === 0);
  return {
    id: 2,
    rule: "R2",
    name: "Citation coverage",
    pass: uncited.length === 0,
    detail:
      uncited.length === 0
        ? `all ${allClaims(brief).length} claims cite ≥1 source`
        : `${uncited.length} uncited claim(s)`,
  };
}

// --- Check 3 · R1 GROUNDING: every cited ID is a real record -----------------
export function citationResolution(brief: Brief): CheckResult {
  const invalid = new Set<string>();
  for (const c of allClaims(brief)) {
    for (const id of c.citations) if (!SOURCE_IDS.has(id)) invalid.add(id);
  }
  return {
    id: 3,
    rule: "R1",
    name: "Citation resolution",
    pass: invalid.size === 0,
    detail:
      invalid.size === 0
        ? "every cited ID exists in data/"
        : `invented source ID(s): ${[...invalid].join(", ")}`,
  };
}

// --- Check 4 · R3 NO INVENTION: every number appears in a cited source -------
export function numericGrounding(brief: Brief): CheckResult {
  const ungrounded: string[] = [];
  for (const unit of groundedUnits(brief)) {
    const numbers = unit.text.match(/\d[\d,]*(?:\.\d+)?/g) ?? [];
    if (numbers.length === 0) continue;
    const sourceText = unit.citations
      .map((id) => resolveSource(id)?.text ?? "")
      .join(" ");
    for (const n of numbers) {
      if (!sourceText.includes(n)) {
        ungrounded.push(`"${n}" in "${unit.text.slice(0, 40)}…"`);
      }
    }
  }
  return {
    id: 4,
    rule: "R3",
    name: "Numeric grounding",
    pass: ungrounded.length === 0,
    detail:
      ungrounded.length === 0
        ? "every number appears verbatim in a cited source"
        : `ungrounded: ${ungrounded.join("; ")}`,
  };
}

// --- Check 5 · R4 HONEST UNKNOWNS: the planted gap is flagged, not filled -----
// The gap is Northslope's budget + procurement authority. It must appear in
// `unknowns`, and no claim may assert it as fact — deterministically: no claim
// may carry a money amount, and no *confirmed* claim may assert approval
// authority. (A fuller semantic non-contradiction check is the LLM-judge above.)
const MONEY = /\$\s?\d|\b\d[\d,]*\s*(?:dollars|usd|million|billion)\b|\b\d+\s?k\b/i;
const AUTHORITY_ASSERTION =
  /\b(?:procurement|purchasing)\s*authority\b|\bsigns?\s*off\b|\bhas\s+(?:the\s+)?(?:final\s+)?(?:say|authority|approval)\b|\bapprov(?:es|ed)\s+the\s+(?:purchase|budget|deal)\b/i;

export function honestUnknowns(brief: Brief): CheckResult {
  const failures: string[] = [];

  if (brief.unknowns.length === 0) failures.push("unknowns section is empty");

  const unknownsText = brief.unknowns.map((u) => u.text.toLowerCase()).join(" ");
  if (!/budget/.test(unknownsText)) failures.push("budget not flagged in unknowns");
  if (!/(authority|procurement|approv)/.test(unknownsText))
    failures.push("procurement/authority not flagged in unknowns");

  for (const c of allClaims(brief)) {
    if (MONEY.test(c.text)) failures.push(`claim asserts a money amount: "${c.text.slice(0, 40)}…"`);
    if (c.confidence === "confirmed" && AUTHORITY_ASSERTION.test(c.text))
      failures.push(`confirmed claim asserts authority: "${c.text.slice(0, 40)}…"`);
  }

  return {
    id: 5,
    rule: "R4",
    name: "Honest unknowns",
    pass: failures.length === 0,
    detail:
      failures.length === 0
        ? "budget + authority flagged as unknown, unasserted elsewhere"
        : failures.join("; "),
  };
}

/** Checks 2-5 (schema validity is check 1, run separately over raw JSON). */
export function runContentChecks(brief: Brief): CheckResult[] {
  return [
    citationCoverage(brief),
    citationResolution(brief),
    numericGrounding(brief),
    honestUnknowns(brief),
  ];
}
