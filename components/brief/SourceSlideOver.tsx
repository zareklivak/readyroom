"use client";

// Citation slide-over: click a
// chip → the exact source snippet slides in from the right, with the words that
// support the claim highlighted, labeled by its system of origin.

import { useEffect } from "react";
import type { SourceSystem } from "@/data/types";
import { highlightSegments } from "@/lib/highlight";

export interface ActiveSource {
  sourceId: string;
  system: SourceSystem;
  systemLabel: string;
  title: string;
  text: string;
  claimText: string;
}

// A small colored square per system — a label, not decoration.
const SYSTEM_DOT: Record<SourceSystem, string> = {
  salesforce: "bg-[#1798c1]",
  gong: "bg-[#7c3aed]",
  news: "bg-speculative",
  kb: "bg-accent",
};

export function SourceSlideOver({
  source,
  onClose,
}: {
  source: ActiveSource | null;
  onClose: () => void;
}) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    if (source) window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [source, onClose]);

  return (
    <>
      {/* Overlay */}
      <div
        className={`fixed inset-0 z-40 bg-black/20 transition-opacity ${
          source ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
        onClick={onClose}
        aria-hidden
      />

      {/* Panel */}
      <div
        role="dialog"
        aria-label="Source"
        className={`fixed right-0 top-0 z-50 flex h-dvh w-full max-w-[400px] flex-col border-l border-hair bg-surface shadow-xl transition-transform duration-200 ${
          source ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {source && (
          <>
            <div className="flex items-start justify-between gap-3 border-b border-hair px-6 py-4">
              <div>
                <div className="mb-1 flex items-center gap-2">
                  <span className={`h-2.5 w-2.5 rounded-sm ${SYSTEM_DOT[source.system]}`} aria-hidden />
                  <span className="text-xs font-medium uppercase tracking-wide text-ink-soft">
                    {source.systemLabel}
                  </span>
                  <span className="rounded bg-accent-weak px-1.5 py-0.5 font-mono text-[11px] text-accent">
                    {source.sourceId}
                  </span>
                </div>
                <div className="text-sm font-semibold text-ink">{source.title}</div>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="-mr-2 rounded px-2 py-1 text-ink-soft transition hover:text-ink"
                aria-label="Close"
              >
                ✕
              </button>
            </div>

            <div className="overflow-y-auto px-6 py-5">
              <p className="text-[15px] leading-relaxed text-ink">
                {highlightSegments(source.text, source.claimText).map((seg, i) =>
                  seg.hit ? (
                    <mark key={i} className="rounded-sm bg-inferred/25 px-0.5 text-ink">
                      {seg.text}
                    </mark>
                  ) : (
                    <span key={i}>{seg.text}</span>
                  ),
                )}
              </p>
              <p className="mt-4 text-xs text-ink-soft">
                Highlighted text supports the cited claim. Every claim in the brief traces
                back to a source like this.
              </p>
            </div>
          </>
        )}
      </div>
    </>
  );
}
