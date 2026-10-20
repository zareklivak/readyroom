// Knowledge base — case studies + product one-pagers the pipeline retrieves
// from. Four case studies are included ON PURPOSE at varying relevance so the
// retrieval/ranking step has real work to do and its judgement is visible:
//
//   KB-CS-DEFECT   general contractor, construction-defect  → PERFECT match
//   KB-CS-INFRA    infrastructure firm, regulatory probe     → adjacent
//   KB-CS-INSURER  insurer, coverage litigation              → off-topic
//   KB-CS-ROI      retailer, generic cost-reduction story    → generic
//
// All customer names, quotes, and figures are FICTIONAL. Product descriptions
// are written only at the level of Quarry's public website — no internal
// pricing, roadmap, or confidential metrics. Results use percentages / time,
// never dollar figures.

import type { SourceRecord } from "./types";

export interface KbCaseStudy extends SourceRecord {
  system: "kb";
  kind: "case-study";
  title: string;
  customer: string; // fictional
  customerProfile: string;
  industry: string;
  matterType: string;
  tags: string[];
  challenge: string;
  solution: string;
  results: string[];
  quote: { text: string; attribution: string };
  body: string;
}

export interface KbProductDoc extends SourceRecord {
  system: "kb";
  kind: "product-doc";
  title: string;
  product: string;
  summary: string;
  tags: string[];
  capabilities: string[];
  body: string;
}

export type KbDoc = KbCaseStudy | KbProductDoc;

export const caseStudies: KbCaseStudy[] = [
  {
    sourceId: "KB-CS-DEFECT",
    system: "kb",
    kind: "case-study",
    title: "How a regional general contractor took a construction-defect review in-house",
    customer: "Cascade Ridge Constructors",
    customerProfile:
      "Regional commercial general contractor (~1,400 employees) in the Pacific Northwest with a small in-house legal team.",
    industry: "Construction",
    matterType: "Construction-defect litigation (multi-party)",
    tags: [
      "construction",
      "general-contractor",
      "construction-defect",
      "multi-party",
      "in-house",
      "early-case-assessment",
      "ai-assisted-review",
      "subcontractor-records",
      "change-orders",
    ],
    challenge:
      "Cascade Ridge was pulled into a multi-party defect dispute over a mixed-use development. The record spanned years of change orders, RFIs, inspection reports, and field email across a dozen subcontractors. Everything had historically been handed to outside counsel, and the four-person legal team had no visibility into their own documents or the growing review cost.",
    solution:
      "Cascade Ridge stood up Quarry for the matter with their counsel kept in the loop. They loaded the project record, used early case assessment to map custodians and see where the change-order and RFI activity clustered, then used AI-assisted review so a single senior paralegal — with attorney oversight — could handle first-pass review instead of an outside vendor team.",
    results: [
      "First-pass review completed roughly 55% faster than the prior vendor-run process on a comparable matter.",
      "Time-to-first-insight dropped from weeks to days using early case assessment.",
      "The four-person team ran the review with one paralegal as the day-to-day operator.",
      "Outside counsel stayed focused on strategy and depositions rather than document logistics.",
    ],
    quote: {
      text: "We stopped being blind to our own case. The first time we could actually see the change-order timeline ourselves, the whole conversation with our counsel changed.",
      attribution: "Deputy General Counsel, Cascade Ridge Constructors",
    },
    body:
      "When Cascade Ridge Constructors was named in a multi-party construction-defect suit, the legal team faced a problem familiar to lean in-house departments: the entire story of the project lived in documents they had never centrally organized. Change orders, requests for information, daily field reports, inspection findings, and years of email between superintendents and subcontractors were scattered across systems and, increasingly, sitting inside an outside vendor's review platform that the in-house team could not see.\n\n" +
      "The team's first goal was not to replace their trusted litigation counsel — it was visibility. They wanted to understand the shape of their own matter before the review bill grew any larger. Using Quarry's early case assessment, Cascade Ridge ingested the project record and immediately began to see structure: which custodians were most active, when communication volume spiked around specific milestones, and where the change-order disputes concentrated. That map became the backbone of their case narrative.\n\n" +
      "For review itself, the concern was bandwidth. A four-person team could not staff a linear, document-by-document review. Quarry's AI-assisted review let a single senior paralegal, with attorney oversight, prioritize the documents most likely to matter, cluster near-duplicate threads, and rely on model-assisted summaries of long email chains. Rather than reading everything, the team spent its limited hours on the documents that moved the case.\n\n" +
      "The outcome reframed the relationship with outside counsel. Instead of acting as a black box, the firm partnered with an in-house team that now understood its own record — and counsel could spend its premium hours on strategy and depositions instead of document logistics. For a small department under board scrutiny about litigation cost, the shift from opacity to ownership was the real win.",
  },
  {
    sourceId: "KB-CS-INFRA",
    system: "kb",
    kind: "case-study",
    title: "An infrastructure developer accelerates a regulatory investigation response",
    customer: "Meridian Infrastructure Partners",
    customerProfile:
      "Energy and infrastructure developer (~3,500 employees) operating across multiple U.S. regions.",
    industry: "Infrastructure / Energy",
    matterType: "Regulatory investigation",
    tags: [
      "infrastructure",
      "energy",
      "regulatory-investigation",
      "second-request",
      "large-data",
      "early-case-assessment",
    ],
    challenge:
      "Facing a broad regulatory investigation with a tight response deadline, Meridian had to process and review a very large, multi-source data set — operational records, engineering communications, and financial documents — far faster than a manual review could manage.",
    solution:
      "Meridian used Quarry to ingest and cull the data quickly, applied search and clustering to isolate responsive material, and used AI-assisted review to meet the regulator's deadline while keeping a defensible process.",
    results: [
      "Met a compressed regulatory deadline that manual review could not have hit.",
      "Culled a large collection down to a reviewable set before substantive review began.",
      "Maintained a defensible, well-documented review workflow for the regulator.",
    ],
    quote: {
      text: "The deadline was non-negotiable. Being able to cull and prioritize early was the only reason we made it.",
      attribution: "Associate General Counsel, Meridian Infrastructure Partners",
    },
    body:
      "Regulatory investigations run on deadlines that do not move. When Meridian Infrastructure Partners received a broad information request, the legal team had to collect, process, and review a large and heterogeneous data set in a fraction of the time a traditional linear review would require.\n\n" +
      "Meridian used Quarry's early case assessment to ingest the collection quickly and understand its composition before committing review hours. Aggressive search, filtering, and clustering culled the volume to a defensible, reviewable subset. AI-assisted review then let the team prioritize the documents most likely to be responsive, so reviewer time concentrated where it mattered.\n\n" +
      "While this matter was an investigation rather than construction litigation, it illustrates the same underlying pattern: when the data is large and the clock is short, seeing the shape of the collection early — and letting the tooling narrow it — is what makes the deadline achievable. Meridian met its response deadline with a documented, defensible process the regulator could follow.",
  },
  {
    sourceId: "KB-CS-INSURER",
    system: "kb",
    kind: "case-study",
    title: "A mid-size insurer standardizes review across a coverage-litigation portfolio",
    customer: "Harbor Mutual Insurance",
    customerProfile:
      "Mid-size property & casualty insurer (~2,800 employees) managing a recurring portfolio of coverage disputes.",
    industry: "Insurance",
    matterType: "Coverage litigation (portfolio)",
    tags: [
      "insurance",
      "coverage-litigation",
      "portfolio",
      "repeatable-workflow",
      "ai-assisted-review",
    ],
    challenge:
      "Harbor Mutual handled many similar coverage disputes at once, each spun up and staffed differently, producing inconsistent workflows, uneven cost, and no shared learning between matters.",
    solution:
      "Harbor Mutual standardized on Quarry to run a repeatable review workflow across its portfolio, reusing search logic and review protocols so each new matter started from a proven template rather than from scratch.",
    results: [
      "Established one consistent, repeatable review workflow across the portfolio.",
      "Reduced setup time for each new matter by reusing protocols and searches.",
      "Improved cost predictability across a high-volume docket.",
    ],
    quote: {
      text: "Every matter used to start from zero. Now they start from a template we trust.",
      attribution: "Director of Litigation, Harbor Mutual Insurance",
    },
    body:
      "For an insurer, litigation is not a one-off event — it is a steady stream of similar matters. Harbor Mutual Insurance managed a large, recurring portfolio of coverage disputes, but each matter was stood up in isolation. Workflows varied by team, cost was hard to predict, and lessons learned on one matter rarely carried to the next.\n\n" +
      "Harbor Mutual used Quarry to build a standardized, repeatable approach: shared search logic, consistent review protocols, and reusable templates so each new coverage matter began from an established baseline. AI-assisted review helped reviewers move quickly through familiar document types, and the consistency itself made cost far more predictable across the docket.\n\n" +
      "This is a portfolio-standardization story rather than a single-matter, document-heavy dispute — a different problem shape from a one-time construction-defect case, but a useful example of Quarry supporting recurring, high-volume litigation programs.",
  },
  {
    sourceId: "KB-CS-ROI",
    system: "kb",
    kind: "case-study",
    title: "Cutting document-review costs by 60% with a modern platform",
    customer: "Bellwether Retail Group",
    customerProfile:
      "National retailer (~40,000 employees) with a mix of employment and commercial disputes.",
    industry: "Retail",
    matterType: "General commercial & employment litigation",
    tags: ["retail", "cost-reduction", "review-efficiency", "roi", "ai-assisted-review"],
    challenge:
      "Bellwether's review costs were climbing across a broad mix of routine disputes, and leadership wanted a measurable reduction without sacrificing defensibility.",
    solution:
      "Bellwether consolidated review onto Quarry and leaned on AI-assisted review and near-duplicate handling to cut the volume that reached human reviewers.",
    results: [
      "Reduced document-review costs by roughly 60% across the reviewed matters.",
      "Cut reviewer hours substantially by suppressing near-duplicates and prioritizing relevance.",
      "Kept a defensible workflow while lowering cost per matter.",
    ],
    quote: {
      text: "We reduced review cost by about 60% and never gave up defensibility to get there.",
      attribution: "VP, Legal Operations, Bellwether Retail Group",
    },
    body:
      "Bellwether Retail Group faced a cost problem more than a single-case problem: a steady volume of routine employment and commercial disputes, each requiring document review, with a total review spend that leadership wanted to bring down measurably.\n\n" +
      "By consolidating review onto Quarry, Bellwether used AI-assisted review to prioritize likely-relevant documents and aggressive near-duplicate and email-thread handling to keep redundant material away from human reviewers. Across the reviewed matters, the company reduced document-review cost by roughly 60% while maintaining a defensible process.\n\n" +
      "This is a generic efficiency-and-ROI story rather than an industry- or matter-specific one — a useful proof point for cost-reduction conversations, but not a close analog to any particular litigation profile.",
  },
];

export const productDocs: KbProductDoc[] = [
  {
    sourceId: "KB-DOC-ECA",
    system: "kb",
    kind: "product-doc",
    title: "Early Case Assessment on Quarry",
    product: "Early Case Assessment",
    summary:
      "Understand a matter early: ingest data fast, see its shape, and cull to what matters before committing to review.",
    tags: ["early-case-assessment", "data-visualization", "culling", "search", "scoping"],
    capabilities: [
      "Fast ingestion of large, multi-source data sets",
      "Visual overview of custodians, communication patterns, and volume over time",
      "Powerful search, filtering, and clustering to cull non-relevant data",
      "Early view of scope to inform strategy and staffing decisions",
    ],
    body:
      "Early case assessment is about answering a simple question before spending review hours: what do we actually have? Quarry lets teams ingest large, varied data sets quickly and immediately begin to see structure — who the key custodians are, how communication volume changes over time, and where activity concentrates around key events. Search, filtering, and clustering then cull the collection to the material that matters. For document-heavy disputes, seeing the shape of the record early is often what turns an overwhelming matter into a manageable one, and it lets legal teams make informed decisions about strategy, staffing, and scope from the outset.",
  },
  {
    sourceId: "KB-DOC-REVIEW",
    system: "kb",
    kind: "product-doc",
    title: "AI-Assisted Review on Quarry",
    product: "AI-Assisted Review",
    summary:
      "Review less, find more: prioritize relevant documents, suppress duplicates, and use AI to summarize and accelerate.",
    tags: ["ai-assisted-review", "predictive-coding", "clustering", "generative-ai", "review"],
    capabilities: [
      "Predictive prioritization that surfaces likely-relevant documents first",
      "Clustering and near-duplicate detection to reduce redundant review",
      "Generative-AI assistance to summarize long threads and documents",
      "A review assistant that learns from reviewer decisions to speed the process",
    ],
    body:
      "AI-assisted review changes the economics of document review by helping teams spend their time on the documents most likely to matter. Quarry prioritizes likely-relevant material, clusters similar documents, and detects near-duplicates so reviewers are not reading the same content repeatedly. Generative-AI features can summarize long email threads and lengthy documents, and the review assistant learns from the decisions reviewers make so the process gets faster over time. For a small team facing a large matter, this is the difference between a review they can staff and one they cannot — a single skilled reviewer, with attorney oversight, can accomplish what previously required a large outside team.",
  },
];

export const knowledgeBase = { caseStudies, productDocs };
