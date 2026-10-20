// Cosmetic 👍/👎 feedback — signals the feedback loop without building
// a real one. Tallies go to the in-memory KV; in production this is the raw
// signal behind the one-pager's edit-rate / trust metrics.

import { NextResponse, type NextRequest } from "next/server";
import { incr } from "@/lib/kv";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  let vote = "";
  let meetingId = "";
  try {
    const body = (await req.json()) as { vote?: unknown; meetingId?: unknown };
    vote = typeof body.vote === "string" ? body.vote : "";
    meetingId = typeof body.meetingId === "string" ? body.meetingId : "unknown";
  } catch {
    return NextResponse.json({ error: "Malformed request." }, { status: 400 });
  }
  if (vote !== "up" && vote !== "down") {
    return NextResponse.json({ error: "Invalid vote." }, { status: 400 });
  }
  const count = incr(`vote:${meetingId}:${vote}`);
  return NextResponse.json({ ok: true, count });
}
