// In-app spec: Architecture & Tradeoffs. Same content as the printable spec
// (/docs/spec) and the README, rendered from lib/spec-content.ts with the live
// eval-results table. This is the fourth app surface.

import Link from "next/link";
import { SpecBody } from "@/components/spec/SpecBody";

export const metadata = {
  title: "Architecture & Tradeoffs — ReadyRoom",
};

export default function ArchitecturePage() {
  return (
    <div>
      <header className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight text-ink">
          Architecture &amp; Tradeoffs
        </h1>
        <p className="mt-2 text-sm text-ink-soft">
          How ReadyRoom is built and why — the design decisions, the road not taken, the
          evaluation thread, and what a production version needs. Every section opens with a
          plain-English summary.
        </p>
        <p className="mt-2 text-xs text-ink-soft">
          Printable version:{" "}
          <Link href="/docs/spec" className="text-accent underline">
            /docs/spec
          </Link>{" "}
          · Measurement plan:{" "}
          <Link href="/docs/one-pager" className="text-accent underline">
            /docs/one-pager
          </Link>
        </p>
      </header>

      <SpecBody />
    </div>
  );
}
