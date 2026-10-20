"use client";

// Small print affordance for the /docs pages — hidden in the printed output.
export function PrintButton({ label = "Print to PDF" }: { label?: string }) {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="no-print rounded-lg border border-hair bg-surface px-3 py-1.5 text-sm font-medium text-ink transition hover:border-accent/50"
    >
      {label}
    </button>
  );
}
