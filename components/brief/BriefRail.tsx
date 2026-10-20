"use client";

// Sticky slim left rail: section TOC + a "5:00" cumulative time
// meter that fills as you scroll — the 5-minute promise embedded in the chrome.
// Shown on wide screens only; a thin top progress bar (in BriefView) covers the
// rest. No competing sidebars.

import { SECTIONS, TOTAL_READ_SECONDS, formatSeconds } from "@/lib/brief-meta";

export function BriefRail({ progress, activeId }: { progress: number; activeId: string }) {
  const elapsed = formatSeconds(progress * TOTAL_READ_SECONDS);

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <aside
      className="fixed top-28 hidden w-[170px] xl:block"
      style={{ left: "max(1.5rem, calc((100vw - 720px) / 2 - 190px))" }}
      aria-label="Brief contents"
    >
      {/* Time meter */}
      <div className="mb-5 flex items-center gap-3">
        <div className="relative h-24 w-1 overflow-hidden rounded-full bg-hair">
          <div
            className="absolute bottom-0 left-0 w-full rounded-full bg-accent transition-[height] duration-150"
            style={{ height: `${progress * 100}%` }}
          />
        </div>
        <div className="font-mono text-xs text-ink-soft">
          <div className="text-ink">{elapsed}</div>
          <div>/ 5:00</div>
        </div>
      </div>

      {/* TOC */}
      <nav className="space-y-0.5 text-sm">
        {SECTIONS.map((s) => {
          const active = s.id === activeId;
          return (
            <button
              key={s.id}
              type="button"
              onClick={() => scrollTo(s.id)}
              className={`block w-full truncate rounded px-2 py-1 text-left transition ${
                active
                  ? "bg-accent-weak font-medium text-accent"
                  : "text-ink-soft hover:text-ink"
              }`}
            >
              {s.label}
            </button>
          );
        })}
      </nav>
    </aside>
  );
}
