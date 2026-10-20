// Nightly precompute (run once, at build/deploy time). Regenerates the demo's
// default brief + scorecard through the REAL pipeline and validates them against
// the schema before writing. This is the "precompute" side of the
// precompute-vs-on-demand tradeoff: the app serves these JSON files instantly
// and for free; the live "Regenerate" button is the on-demand path.
//
// Requires ANTHROPIC_API_KEY. Usage:
//   ANTHROPIC_API_KEY=sk-... npx tsx scripts/precompute.ts
//
// Without a key the app still runs entirely off the committed JSON — this
// script is how you refresh it, not a runtime dependency.

import { writeFileSync } from "node:fs";
import { join } from "node:path";
import { generateBrief, generateScorecard, hasApiKey } from "../lib/anthropic";
import { DISCOVERY_MEETING } from "../data";
import { costUsd, formatUsd, BRIEF_MODEL } from "../lib/cost";

async function main() {
  if (!hasApiKey()) {
    console.error(
      "ANTHROPIC_API_KEY is not set. Set it to regenerate the precomputed brief:\n" +
        "  ANTHROPIC_API_KEY=sk-... npx tsx scripts/precompute.ts\n" +
        "(The app runs off the committed JSON without a key.)",
    );
    process.exit(1);
  }

  const dataDir = join(process.cwd(), "data");

  console.log("Generating brief…");
  const brief = await generateBrief(DISCOVERY_MEETING.id);
  writeFileSync(
    join(dataDir, "precomputed-brief.json"),
    JSON.stringify(brief.data, null, 2) + "\n",
  );
  console.log(`  ✓ schema-valid brief (${brief.usage.outputTokens} output tokens)`);

  console.log("Generating post-call scorecard…");
  const scorecard = await generateScorecard();
  writeFileSync(
    join(dataDir, "precomputed-scorecard.json"),
    JSON.stringify(scorecard.data, null, 2) + "\n",
  );
  console.log(`  ✓ schema-valid scorecard (${scorecard.usage.outputTokens} output tokens)`);

  // Record actual token counts + cost for the spec's cost table.
  const briefCost = costUsd(brief.usage);
  const cost = {
    model: BRIEF_MODEL,
    recordedAt: new Date().toISOString(),
    brief: { ...brief.usage, costUsd: briefCost },
    scorecard: { ...scorecard.usage, costUsd: costUsd(scorecard.usage) },
    note: "Per-brief cost is dominated by the input context (the full transcript). See lib/cost.ts for pricing and the cheap-tier compression optimization.",
  };
  writeFileSync(
    join(dataDir, "precomputed-cost.json"),
    JSON.stringify(cost, null, 2) + "\n",
  );

  console.log(`\nDone. Cost per brief: ${formatUsd(briefCost)}`);
  const unknowns = brief.data.unknowns.map((u) => u.text.toLowerCase()).join(" ");
  if (!/budget/.test(unknowns)) {
    console.warn("⚠ unknowns section did not mention budget — inspect the output.");
  }
}

main().catch((err) => {
  console.error("Precompute failed:", err);
  process.exit(1);
});
