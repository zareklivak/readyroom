// Cost model for the spec's cost-per-brief table.
//
// Per-token pricing pulled from the Anthropic model docs (claude-api reference,
// cached 2026-06-24) — NOT from memory. Re-verify at build time
// if pricing may have moved.
//
//   claude-opus-4-8  (flagship — brief generation):  $5 / 1M in,  $25 / 1M out
//   claude-haiku-4-5 (cheap tier — see note below):  $1 / 1M in,   $5 / 1M out
//
// The nightly precompute pipeline generates each brief once with the flagship
// model. A production optimization (spec, not built here) is to compress each
// long Gong transcript with the cheap tier before the flagship call — the
// transcript is the largest and least information-dense input.

export interface TokenUsage {
  inputTokens: number;
  outputTokens: number;
  cacheReadInputTokens?: number;
  cacheCreationInputTokens?: number;
}

export const MODEL_PRICING = {
  "claude-opus-4-8": { inputPerMTok: 5, outputPerMTok: 25 },
  "claude-sonnet-5": { inputPerMTok: 3, outputPerMTok: 15 },
  "claude-haiku-4-5": { inputPerMTok: 1, outputPerMTok: 5 },
} as const;

export type PricedModel = keyof typeof MODEL_PRICING;

export const BRIEF_MODEL: PricedModel = "claude-opus-4-8"; // nightly precompute — max quality
export const LIVE_MODEL: PricedModel = "claude-sonnet-5"; // interactive regen — fast, still grounded
export const COMPRESSION_MODEL: PricedModel = "claude-haiku-4-5";

/** Dollar cost of one generation given its token usage. Cache reads bill at
 *  ~0.1× input; treated as input here for a conservative (slightly high) figure. */
export function costUsd(
  usage: TokenUsage,
  model: PricedModel = BRIEF_MODEL,
): number {
  const price = MODEL_PRICING[model];
  const input = usage.inputTokens + (usage.cacheCreationInputTokens ?? 0);
  const cachedInput = usage.cacheReadInputTokens ?? 0;
  const inputCost =
    (input / 1_000_000) * price.inputPerMTok +
    (cachedInput / 1_000_000) * price.inputPerMTok * 0.1;
  const outputCost = (usage.outputTokens / 1_000_000) * price.outputPerMTok;
  return inputCost + outputCost;
}

/** Round to cents for display. */
export function formatUsd(amount: number): string {
  return `$${amount.toFixed(amount < 0.1 ? 4 : 2)}`;
}
