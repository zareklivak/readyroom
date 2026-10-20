// Server-side Claude wrapper. ONE call per brief, structured JSON out, validated
// against the zod schema before it is trusted.
//
// Model notes (from the Anthropic docs, cached 2026-06-24 — not memory):
//   • claude-opus-4-8 is the flagship tier used for generation.
//   • Adaptive thinking (`thinking: {type:"adaptive"}`) — the model decides how
//     much to reason. `budget_tokens` and `temperature` are REMOVED on 4.8 and
//     return 400 if sent; determinism comes from the prompt contract + low-ish
//     effort, not a temperature knob.
//   • Streamed with `.finalMessage()` so a large structured response can't hit
//     the SDK's non-streaming HTTP timeout.
//
// Graceful no-key behavior: this module only makes network calls when asked to
// generate. The app's default path serves the precomputed JSON (see the API
// route and the brief page), so local dev / preview need no key at all.

import Anthropic from "@anthropic-ai/sdk";
import { BriefSchema, ScorecardSchema, type Brief, type Scorecard } from "@/lib/brief-schema";
import type { TokenUsage } from "@/lib/cost";
import { BRIEF_MODEL } from "@/lib/cost";
import { assembleContext } from "@/lib/context-assembly";
import {
  BRIEF_SYSTEM_PROMPT,
  buildUserPrompt,
  SCORECARD_SYSTEM_PROMPT,
  buildScorecardUserPrompt,
} from "@/prompts/brief-system";
import { gong } from "@/data/gong";
import { PRIOR_HYPOTHESES, PRIOR_QUESTIONS } from "@/data/prior-brief";

export function hasApiKey(): boolean {
  return Boolean(process.env.ANTHROPIC_API_KEY);
}

export interface GenerationResult<T> {
  data: T;
  usage: TokenUsage;
  model: string;
}

/** Pull the JSON object out of the model's text output, tolerating stray prose
 *  or code fences, and parse it. */
function extractJson(text: string): unknown {
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const raw = fenced ? fenced[1] : text;
  const start = raw.indexOf("{");
  const end = raw.lastIndexOf("}");
  if (start === -1 || end === -1 || end < start) {
    throw new Error("No JSON object found in model output.");
  }
  return JSON.parse(raw.slice(start, end + 1));
}

function collectText(content: Anthropic.Messages.ContentBlock[]): string {
  return content
    .filter((b): b is Anthropic.Messages.TextBlock => b.type === "text")
    .map((b) => b.text)
    .join("");
}

function toUsage(usage: Anthropic.Messages.Usage): TokenUsage {
  return {
    inputTokens: usage.input_tokens,
    outputTokens: usage.output_tokens,
    cacheReadInputTokens: usage.cache_read_input_tokens ?? undefined,
    cacheCreationInputTokens: usage.cache_creation_input_tokens ?? undefined,
  };
}

type Effort = "low" | "medium" | "high" | "xhigh" | "max";

async function callModel(
  system: string,
  user: string,
  model: string,
  effort?: Effort,
): Promise<{ text: string; usage: TokenUsage }> {
  const client = new Anthropic(); // reads ANTHROPIC_API_KEY from env
  const stream = client.messages.stream({
    model,
    max_tokens: 32000,
    thinking: { type: "adaptive" },
    ...(effort ? { output_config: { effort } } : {}),
    system,
    messages: [{ role: "user", content: user }],
  });
  const message = await stream.finalMessage();
  return { text: collectText(message.content), usage: toUsage(message.usage) };
}

export interface GenerateOptions {
  generatedAt?: string;
  /** Model to run. Defaults to the flagship (BRIEF_MODEL); the interactive route
   *  passes a faster tier so it completes inside the serverless time limit. */
  model?: string;
  /** Effort. Left undefined for the flagship precompute (max quality); the route
   *  passes "low" so the fast-tier call stays snappy. */
  effort?: Effort;
}

/** Generate the discovery-call brief. Requires ANTHROPIC_API_KEY. Throws on a
 *  missing key or a schema-invalid response (the precompute script and the live
 *  route both surface the error rather than shipping an unvalidated brief). */
export async function generateBrief(
  meetingId: string,
  opts: GenerateOptions = {},
): Promise<GenerationResult<Brief>> {
  if (!hasApiKey()) {
    throw new Error("ANTHROPIC_API_KEY is not set — cannot generate live.");
  }
  const generatedAt = opts.generatedAt ?? new Date().toISOString();
  const model = opts.model ?? BRIEF_MODEL;
  const { contextBlock } = assembleContext();
  const { text, usage } = await callModel(
    BRIEF_SYSTEM_PROMPT,
    buildUserPrompt(contextBlock, meetingId, generatedAt),
    model,
    opts.effort,
  );
  const brief = BriefSchema.parse(extractJson(text));
  return { data: brief, usage, model };
}

/** Grade the previous brief's predictions against the intro-call transcript.
 *  A second, small pipeline function — same grounding rules as the brief. */
export async function generateScorecard(): Promise<GenerationResult<Scorecard>> {
  if (!hasApiKey()) {
    throw new Error("ANTHROPIC_API_KEY is not set — cannot generate live.");
  }
  const transcriptBlock = gong.transcript
    .map((t) => {
      const who = gong.call.parties.find((p) => p.speakerId === t.speakerId)?.name;
      return `[${t.sourceId}] ${who}: ${t.text}`;
    })
    .join("\n");
  const { text, usage } = await callModel(
    SCORECARD_SYSTEM_PROMPT,
    buildScorecardUserPrompt(transcriptBlock, PRIOR_HYPOTHESES, PRIOR_QUESTIONS),
    BRIEF_MODEL,
  );
  const scorecard = ScorecardSchema.parse(extractJson(text));
  return { data: scorecard, usage, model: BRIEF_MODEL };
}
