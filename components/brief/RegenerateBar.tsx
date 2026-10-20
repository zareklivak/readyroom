"use client";

// The precompute-vs-on-demand tradeoff, kept as a static affordance. The demo
// serves the precomputed nightly brief (instant, free); the on-demand
// regeneration path is real (see /api/generate + Architecture) but not run from
// the UI — a live model call doesn't belong in the middle of a demo click.
// Keeps the cosmetic 👍/👎 to signal the feedback loop.

import { useState } from "react";
import Link from "next/link";

export function RegenerateBar({ meetingId }: { meetingId: string }) {
  const [vote, setVote] = useState<"up" | "down" | null>(null);

  async function sendVote(v: "up" | "down") {
    setVote(v);
    try {
      await fetch("/api/vote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ vote: v, meetingId }),
      });
    } catch {
      /* cosmetic — ignore */
    }
  }

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-hair bg-surface p-4">
      <p className="max-w-md text-xs leading-relaxed text-ink-soft">
        You&apos;re viewing the <span className="font-medium text-ink">precomputed</span> brief —
        the nightly-batch path (instant, free). The on-demand regeneration path is covered under{" "}
        <Link href="/architecture" className="text-accent underline">
          Architecture
        </Link>
        .
      </p>

      <div className="flex items-center gap-1.5">
        <span className="mr-1 text-xs text-ink-soft">Useful?</span>
        <button
          type="button"
          onClick={() => sendVote("up")}
          disabled={vote !== null}
          className={`rounded px-2 py-1 text-sm transition ${vote === "up" ? "bg-confirmed/15" : "hover:bg-canvas"} disabled:opacity-70`}
          aria-label="Thumbs up"
        >
          👍
        </button>
        <button
          type="button"
          onClick={() => sendVote("down")}
          disabled={vote !== null}
          className={`rounded px-2 py-1 text-sm transition ${vote === "down" ? "bg-red-100" : "hover:bg-canvas"} disabled:opacity-70`}
          aria-label="Thumbs down"
        >
          👎
        </button>
      </div>
    </div>
  );
}
