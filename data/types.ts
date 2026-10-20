// Shared primitives across the four mock sources.
//
// Every fact the agent is allowed to assert must be traceable to a record that
// carries a stable `sourceId`. The prefix names the system of origin so a
// citation chip in the brief ([SF-OPP], [GONG-41], [NEWS-1], [KB-CS-DEFECT])
// tells the reader where the claim came from before they even click it.

export type SourceSystem = "salesforce" | "gong" | "news" | "kb";

/** Anything the brief can cite resolves to one of these. */
export interface SourceRecord {
  sourceId: string;
  system: SourceSystem;
}

export const SYSTEM_LABEL: Record<SourceSystem, string> = {
  salesforce: "Salesforce",
  gong: "Gong",
  news: "Public web",
  kb: "Knowledge base",
};
