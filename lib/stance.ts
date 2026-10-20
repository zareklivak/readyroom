// Stance metadata — shared by the brief's "who's in the room"
// and the Today card's attendee dots so the two never disagree. Plain module (no
// "use client") so both server and client components can import it.

export interface StanceMeta {
  label: string;
  /** Tailwind bg-* class for the dot. */
  dot: string;
}

export const STANCE: Record<string, StanceMeta> = {
  champion: { label: "Champion", dot: "bg-confirmed" },
  supportive: { label: "Supportive", dot: "bg-confirmed" },
  "economic-buyer": { label: "Economic buyer", dot: "bg-accent" },
  skeptic: { label: "Skeptic", dot: "bg-inferred" },
  blocker: { label: "Blocker", dot: "bg-red-500" },
  neutral: { label: "Neutral", dot: "bg-speculative" },
};

export function stanceMeta(stance: string): StanceMeta {
  return STANCE[stance] ?? STANCE.neutral;
}
