// Live-generate endpoint — the on-demand side of the precompute-vs-on-demand
// tradeoff, made clickable. It runs the real pipeline, but is rate-limited so a
// demo can't run up the API bill: 10 generations/hour/IP and 25/day
// globally. Over the cap (or with no key), it returns the precomputed brief with
// a message that teaches the tradeoff.

import { NextResponse, type NextRequest } from "next/server";
import { generateBrief, hasApiKey } from "@/lib/anthropic";
import { LIVE_MODEL } from "@/lib/cost";
import { incr } from "@/lib/kv";
import precomputedBrief from "@/data/precomputed-brief.json";
import { DISCOVERY_MEETING } from "@/data";

export const runtime = "nodejs"; // the Anthropic SDK needs the Node runtime
// Raise the serverless function's time limit — one flagship call with thinking
// runs longer than the default cap. 60s is the Hobby ceiling (Vercel clamps if
// the plan is lower); on a timeout the client still degrades to the precomputed
// brief. The streamed request keeps the connection alive meanwhile.
export const maxDuration = 60;

const IP_HOURLY_LIMIT = 10;
const GLOBAL_DAILY_LIMIT = 25;
const CAP_MESSAGE =
  "Live generation is capped for this demo — you're seeing the precomputed brief, i.e. the nightly path.";

function clientIp(req: NextRequest): string {
  return req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
}

export async function POST(req: NextRequest) {
  // No key configured → serve precomputed (local dev / preview need no key).
  if (!hasApiKey()) {
    return NextResponse.json({
      source: "precomputed",
      brief: precomputedBrief,
      message:
        "No API key configured in this environment — showing the precomputed brief (the nightly path).",
    });
  }

  // Rate limit: increment both counters, reject if either exceeds its cap.
  const hour = new Date().toISOString().slice(0, 13); // YYYY-MM-DDTHH
  const day = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
  const perIp = incr(`gen:ip:${clientIp(req)}:${hour}`, 60 * 60 * 1000);
  const perDay = incr(`gen:global:${day}`, 24 * 60 * 60 * 1000);

  if (perIp > IP_HOURLY_LIMIT || perDay > GLOBAL_DAILY_LIMIT) {
    return NextResponse.json({
      source: "precomputed",
      brief: precomputedBrief,
      message: CAP_MESSAGE,
    });
  }

  try {
    const started = Date.now();
    // Interactive path: a faster tier at low effort, so it completes well inside
    // the serverless time limit. The nightly precompute uses the flagship model.
    const result = await generateBrief(DISCOVERY_MEETING.id, {
      model: LIVE_MODEL,
      effort: "low",
    });
    return NextResponse.json({
      source: "live",
      brief: result.data,
      usage: result.usage,
      model: result.model,
      elapsedMs: Date.now() - started,
    });
  } catch (err) {
    // Any live-path failure degrades gracefully to the precomputed brief.
    console.error("Live generation failed:", err);
    return NextResponse.json({
      source: "precomputed",
      brief: precomputedBrief,
      message:
        "Live generation hit an error — showing the precomputed brief instead.",
    });
  }
}
