// `npm run evals` — the deterministic gate on brief quality.
//
//   npm run evals           evaluate the committed precomputed brief (no key)
//   npm run evals -- --live regenerate a fresh brief and evaluate that (needs key)
//
// Five checks, each mapped to a prompt-contract rule (R1-R6). Prints a pass/fail
// table, writes data/eval-results.json for the Architecture page, and exits
// non-zero on any failure so CI blocks a prompt change that breaks grounding.
// "Prompt changes are code changes."

import { writeFileSync } from "node:fs";
import { join } from "node:path";
import { BriefSchema } from "../lib/brief-schema";
import precomputedBrief from "../data/precomputed-brief.json";
import { runContentChecks, type CheckResult } from "./checks";

async function loadBrief(): Promise<{ raw: unknown; mode: string; model: string }> {
  if (process.argv.includes("--live")) {
    const { generateBrief } = await import("../lib/anthropic");
    const { DISCOVERY_MEETING } = await import("../data");
    const result = await generateBrief(DISCOVERY_MEETING.id);
    return { raw: result.data, mode: "live", model: result.model };
  }
  return { raw: precomputedBrief, mode: "precomputed", model: "n/a (precomputed)" };
}

function printTable(results: CheckResult[]) {
  const nameW = Math.max(...results.map((r) => r.name.length));
  console.log("");
  console.log("  ReadyRoom eval — prompt contract = eval contract");
  console.log("  " + "─".repeat(nameW + 44));
  for (const r of results) {
    const mark = r.pass ? "✓ PASS" : "✗ FAIL";
    console.log(`  ${r.rule.padEnd(3)} ${r.name.padEnd(nameW)}  ${mark}  ${r.detail}`);
  }
  console.log("  " + "─".repeat(nameW + 44));
}

async function main() {
  const { raw, mode, model } = await loadBrief();

  // Check 1 · R6 SCHEMA: the output is a single object matching the schema.
  const parsed = BriefSchema.safeParse(raw);
  const schemaCheck: CheckResult = {
    id: 1,
    rule: "R6",
    name: "Schema validity",
    pass: parsed.success,
    detail: parsed.success
      ? "output matches the brief schema"
      : parsed.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`).join("; "),
  };

  // Checks 2-5 need a typed brief; only run them if the schema is valid.
  const results: CheckResult[] = [schemaCheck];
  if (parsed.success) results.push(...runContentChecks(parsed.data));

  printTable(results);

  const passed = results.filter((r) => r.pass).length;
  const total = 5; // always report out of the five contract checks
  const allPass = results.every((r) => r.pass) && results.length === total;
  console.log(`  ${passed}/${total} checks passed (${mode} mode)\n`);

  // Persist for the Architecture page (Phase 7).
  writeFileSync(
    join(process.cwd(), "data", "eval-results.json"),
    JSON.stringify(
      {
        ranAt: new Date().toISOString(),
        mode,
        model,
        passed,
        total,
        allPass,
        checks: results.map((r) => ({
          rule: r.rule,
          name: r.name,
          pass: r.pass,
          detail: r.detail,
        })),
      },
      null,
      2,
    ) + "\n",
  );

  process.exit(allPass ? 0 : 1);
}

main().catch((err) => {
  console.error("Eval run failed:", err);
  process.exit(1);
});
