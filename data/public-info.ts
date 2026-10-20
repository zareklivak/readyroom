// Public web mock — the kind of openly available information a rep would find
// with a few searches. Three items: the defect-lawsuit trade press
// that triggered the inbound, the new-GC announcement, and a local piece on the
// hospital project. All outlets, people, and details are FICTIONAL.
//
// Cross-source hook: NEWS-2 names Evelyn Brandt's prior employer (Vantage Grid
// Energy). On the Gong call (GONG-31) she mentions that at her last company
// they used a review platform. Neither source is decisive alone; together they
// say the "skeptic" has firsthand, positive platform experience.
//
// Planted gap: no budget figures and no procurement/authority detail
// anywhere — deliberately no dollar amounts, even for claimed damages.

import type { SourceRecord } from "./types";

export interface NewsItem extends SourceRecord {
  system: "news";
  outlet: string;
  headline: string;
  author: string;
  publishedDate: string;
  url: string;
  summary: string;
  body: string;
  tags: string[];
}

export const news: NewsItem[] = [
  {
    sourceId: "NEWS-1",
    system: "news",
    outlet: "The Mountain West Build Report",
    headline:
      "Multi-party defect suit over St. Aubin hospital expansion names Northslope Construction",
    author: "R. Okafor",
    publishedDate: "2026-06-09",
    url: "https://mwbuildreport.com/2026/06/st-aubin-defect-suit-northslope",
    summary:
      "The owner of the St. Aubin Regional Medical Center expansion has filed a multi-party construction-defect suit; Northslope Construction Group, the general contractor, is among the named parties.",
    body:
      "A construction-defect dispute over the recently completed expansion of St. Aubin Regional Medical Center in Fort Collins has escalated into litigation, according to filings reviewed by The Mountain West Build Report. The medical center's ownership group alleges defects in portions of the expansion and has named multiple parties, including Northslope Construction Group, the project's general contractor, along with several subcontractors and the project architect.\n\n" +
      "Construction-defect matters of this kind are notoriously document-intensive. The evidentiary record typically spans years of change orders, requests for information, inspection reports, and field correspondence among the general contractor, its subcontractors, and design professionals. Attorneys not involved in the matter note that in multi-party defect cases, responsibility often turns on precisely this paper trail — who flagged what, when, and how it was resolved.\n\n" +
      "Northslope Construction Group is a Denver-based commercial general contractor active across the Mountain West, with a portfolio spanning healthcare, higher-education, and civic projects. The company did not comment on the pending litigation. The parties are expected to enter a document-discovery phase in the coming months. Damages sought were not disclosed in the initial filing.",
    tags: [
      "northslope",
      "construction-defect",
      "st-aubin",
      "hospital",
      "litigation",
      "general-contractor",
      "why-now",
    ],
  },
  {
    sourceId: "NEWS-2",
    system: "news",
    outlet: "Rocky Mountain Legal Journal",
    headline: "Northslope Construction names Evelyn Brandt as General Counsel",
    author: "Staff",
    publishedDate: "2025-11-18",
    url: "https://rockymountainlegal.com/people/northslope-names-brandt-gc",
    summary:
      "Northslope Construction Group has appointed Evelyn Brandt as General Counsel. Brandt joins from Vantage Grid Energy, where she was Associate General Counsel.",
    body:
      "Northslope Construction Group has appointed Evelyn Brandt as its General Counsel, the company confirmed this week. Brandt joins the Denver-based general contractor from Vantage Grid Energy, where she served as Associate General Counsel and worked on regulatory and litigation matters across the energy sector.\n\n" +
      "In her new role, Brandt will lead Northslope's in-house legal function, which supports the company's commercial construction operations throughout the Mountain West. People familiar with the appointment say Brandt was brought in in part to bring more litigation and risk oversight in-house as the company's project portfolio grows.\n\n" +
      "Brandt succeeds Northslope's prior general counsel, who retired earlier in the year. She holds a J.D. and has spent much of her career in in-house legal roles at mid- and large-cap companies in regulated industries.",
    tags: ["northslope", "general-counsel", "evelyn-brandt", "vantage-grid-energy", "people-move"],
  },
  {
    sourceId: "NEWS-3",
    system: "news",
    outlet: "Front Range Business Journal",
    headline:
      "St. Aubin Regional Medical Center completes expansion, its largest project in a decade",
    author: "L. Nakamura",
    publishedDate: "2026-05-21",
    url: "https://frontrangebiz.com/2026/05/st-aubin-medical-expansion-complete",
    summary:
      "St. Aubin Regional Medical Center marked completion of a major expansion adding a new patient tower and surgical wing, delivered by general contractor Northslope Construction Group.",
    body:
      "St. Aubin Regional Medical Center in Fort Collins has completed a major expansion — the largest capital project in the hospital's recent history — adding a new patient tower, an expanded surgical wing, and upgraded emergency facilities. The project was delivered by Denver-based Northslope Construction Group as general contractor, working with a roster of regional subcontractors and a national healthcare design firm.\n\n" +
      "The multi-year build was complex even by hospital-construction standards, involving phased work around an operating medical campus, extensive mechanical and electrical systems, and strict regulatory requirements. Hospital leadership described the expansion as a milestone for care capacity in the region.\n\n" +
      "Local business observers note that large healthcare builds of this type generate an enormous administrative and documentation footprint — permitting, inspections, change orders, and coordination records across dozens of trades. While the hospital celebrated the opening, industry watchers had quietly flagged that projects of this scale and complexity can carry a long tail of post-completion issues to resolve among the parties involved.",
    tags: ["northslope", "st-aubin", "hospital", "expansion", "fort-collins", "project-context"],
  },
];

export const publicInfo = { news };
