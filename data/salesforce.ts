// Salesforce mock — shaped like the REST API (`/services/data/vXX.0/...`):
// PascalCase fields, an `attributes` envelope with the object type + record URL,
// 18-char-style record Ids, and foreign keys (AccountId, WhoId) between objects.
// A pipeline adapter would map these fields 1:1; the shape is the integration
// contract, so we mimic it rather than inventing a convenience schema.
//
// Every record also carries a `sourceId` (SF-*) — our citation handle. All data
// is fictional. NOTE (planted gap): there is deliberately no
// customer budget figure and no procurement-authority/approval data anywhere.
// The Opportunity.Amount below is Quarry's own unvalidated forecast, not a
// number the customer has shared — see its Description.

import type { SourceSystem } from "./types";

interface SfAttributes {
  type: string;
  url: string;
}

interface SfBase {
  attributes: SfAttributes;
  Id: string;
  sourceId: string;
  system: Extract<SourceSystem, "salesforce">;
}

// ---------------------------------------------------------------------------
// Account
// ---------------------------------------------------------------------------

export interface SalesforceAccount extends SfBase {
  Name: string;
  Industry: string;
  Type: string;
  BillingCity: string;
  BillingState: string;
  BillingCountry: string;
  Website: string;
  NumberOfEmployees: number;
  AnnualRevenue: number; // public-style firmographic, not a legal budget
  Description: string;
  OwnerName: string;
  AccountSource: string;
  CreatedDate: string;
}

export const account: SalesforceAccount = {
  attributes: {
    type: "Account",
    url: "/services/data/v60.0/sobjects/Account/001Ho00002Nkr41IAB",
  },
  Id: "001Ho00002Nkr41IAB",
  sourceId: "SF-ACCT",
  system: "salesforce",
  Name: "Northslope Construction Group",
  Industry: "Construction",
  Type: "Prospect",
  BillingCity: "Denver",
  BillingState: "CO",
  BillingCountry: "USA",
  Website: "northslopeconstruction.com",
  NumberOfEmployees: 2100,
  AnnualRevenue: 900000000,
  Description:
    "Mid-size commercial general contractor operating across the Mountain West " +
    "(CO, UT, WY, ID, MT). Builds healthcare, higher-ed, civic, and commercial " +
    "projects. In-house legal is small and historically routes litigation to " +
    "outside counsel. Now facing a document-heavy construction-defect matter.",
  OwnerName: "Dana Whitfield",
  AccountSource: "Inbound — Web",
  CreatedDate: "2026-07-02T15:12:00.000+0000",
};

// ---------------------------------------------------------------------------
// Opportunity
// ---------------------------------------------------------------------------

export interface SalesforceOpportunity extends SfBase {
  AccountId: string;
  Name: string;
  StageName: string;
  Amount: number | null;
  Probability: number;
  CloseDate: string;
  LeadSource: string;
  Type: string;
  ForecastCategoryName: string;
  NextStep: string;
  Description: string;
  OwnerName: string;
  CreatedDate: string;
}

export const opportunity: SalesforceOpportunity = {
  attributes: {
    type: "Opportunity",
    url: "/services/data/v60.0/sobjects/Opportunity/006Ho00000TgQ9pIAF",
  },
  Id: "006Ho00000TgQ9pIAF",
  sourceId: "SF-OPP",
  system: "salesforce",
  AccountId: "001Ho00002Nkr41IAB",
  Name: "Northslope Construction — Ediscovery Platform",
  StageName: "Discovery",
  Amount: 150000,
  Probability: 20,
  CloseDate: "2026-10-30",
  LeadSource: "Inbound — Demo Request",
  Type: "New Business",
  ForecastCategoryName: "Pipeline",
  NextStep: "Discovery call 2026-07-23; qualify matter scope + in-house appetite.",
  Description:
    "Inbound demo request submitted 2026-07-02, shortly after trade-press " +
    "coverage of the St. Aubin Regional Medical Center defect dispute. Amount " +
    "is an UNVALIDATED internal estimate based on comparable mid-market annual " +
    "subscriptions — the customer has not shared any budget, and procurement " +
    "process/authority is unknown. Do not represent Amount as customer-confirmed.",
  OwnerName: "Dana Whitfield",
  CreatedDate: "2026-07-02T15:40:00.000+0000",
};

// ---------------------------------------------------------------------------
// Contacts
// ---------------------------------------------------------------------------

export interface SalesforceContact extends SfBase {
  AccountId: string;
  Name: string;
  FirstName: string;
  LastName: string;
  Title: string;
  Email: string;
  Phone: string;
  Department: string;
  Description: string; // rep-entered qualitative notes
  CreatedDate: string;
}

export const contacts: SalesforceContact[] = [
  {
    attributes: {
      type: "Contact",
      url: "/services/data/v60.0/sobjects/Contact/003Ho00002Qwe10IAB",
    },
    Id: "003Ho00002Qwe10IAB",
    sourceId: "SF-CON-GC",
    system: "salesforce",
    AccountId: "001Ho00002Nkr41IAB",
    Name: "Evelyn Brandt",
    FirstName: "Evelyn",
    LastName: "Brandt",
    Title: "General Counsel",
    Email: "ebrandt@northslopeconstruction.com",
    Phone: "+1 303-555-0142",
    Department: "Legal",
    Description:
      "Joined Northslope ~8 months ago (Nov 2025). Runs a lean in-house team. " +
      "On the intro call she was measured and a bit skeptical about operating " +
      "review tooling in-house — wants to see it, not hear about it. Likely the " +
      "economic decision-maker, though we have not confirmed how purchases are " +
      "approved here.",
    CreatedDate: "2026-07-09T22:05:00.000+0000",
  },
  {
    attributes: {
      type: "Contact",
      url: "/services/data/v60.0/sobjects/Contact/003Ho00002Qwe22IAB",
    },
    Id: "003Ho00002Qwe22IAB",
    sourceId: "SF-CON-OPS",
    system: "salesforce",
    AccountId: "001Ho00002Nkr41IAB",
    Name: "Marcus Reyes",
    FirstName: "Marcus",
    LastName: "Reyes",
    Title: "Legal Operations Manager",
    Email: "mreyes@northslopeconstruction.com",
    Phone: "+1 303-555-0188",
    Department: "Legal",
    Description:
      "Submitted the inbound demo request and drove scheduling for both calls. " +
      "Clearly the internal champion — frustrated by how much of the defect " +
      "matter is being handled (and billed) externally. Practical, ROI-minded.",
    CreatedDate: "2026-07-02T15:41:00.000+0000",
  },
  {
    attributes: {
      type: "Contact",
      url: "/services/data/v60.0/sobjects/Contact/003Ho00002Qwe37IAB",
    },
    Id: "003Ho00002Qwe37IAB",
    sourceId: "SF-CON-PARA",
    system: "salesforce",
    AccountId: "001Ho00002Nkr41IAB",
    Name: "Tina Alvarez",
    FirstName: "Tina",
    LastName: "Alvarez",
    Title: "Senior Paralegal",
    Email: "talvarez@northslopeconstruction.com",
    Phone: "+1 303-555-0176",
    Department: "Legal",
    Description:
      "Named by Marcus as the person who would do day-to-day document work if " +
      "review came in-house. Not attending the 2026-07-23 discovery call.",
    CreatedDate: "2026-07-09T22:07:00.000+0000",
  },
];

// ---------------------------------------------------------------------------
// Event — the upcoming discovery call. Attendee list lives here.
// Note the third prospect attendee is OUTSIDE COUNSEL, who was not on the
// intro call and is not a saved Contact on this account.
// ---------------------------------------------------------------------------

export interface SalesforceEventAttendee {
  Name: string;
  Title: string;
  Company: string;
  Email: string;
  Affiliation: "Prospect" | "Quarry" | "External — Outside Counsel";
  ContactId: string | null; // null = not a saved Contact on this account
}

export interface SalesforceEvent extends SfBase {
  WhatId: string; // related Opportunity
  Subject: string;
  Location: string;
  StartDateTime: string;
  EndDateTime: string;
  DurationInMinutes: number;
  OwnerName: string;
  Description: string;
  Attendees: SalesforceEventAttendee[];
}

export const discoveryEvent: SalesforceEvent = {
  attributes: {
    type: "Event",
    url: "/services/data/v60.0/sobjects/Event/00UHo00000Gkp2LMAZ",
  },
  Id: "00UHo00000Gkp2LMAZ",
  sourceId: "SF-EVT",
  system: "salesforce",
  WhatId: "006Ho00000TgQ9pIAF",
  Subject: "Quarry × Northslope — Discovery Call",
  Location: "Google Meet",
  StartDateTime: "2026-07-23T16:00:00.000+0000", // 10:00 AM America/Denver
  EndDateTime: "2026-07-23T16:45:00.000+0000",
  DurationInMinutes: 45,
  OwnerName: "Dana Whitfield",
  Description:
    "Discovery call. Marcus added a third attendee when confirming: Gregory " +
    "Hale, a partner at the firm handling Northslope's litigation. Heads-up — " +
    "outside counsel currently owns the ediscovery workflow (and the billings " +
    "that come with it), so they may not be a neutral voice on bringing it " +
    "in-house.",
  Attendees: [
    {
      Name: "Evelyn Brandt",
      Title: "General Counsel",
      Company: "Northslope Construction Group",
      Email: "ebrandt@northslopeconstruction.com",
      Affiliation: "Prospect",
      ContactId: "003Ho00002Qwe10IAB",
    },
    {
      Name: "Marcus Reyes",
      Title: "Legal Operations Manager",
      Company: "Northslope Construction Group",
      Email: "mreyes@northslopeconstruction.com",
      Affiliation: "Prospect",
      ContactId: "003Ho00002Qwe22IAB",
    },
    {
      Name: "Gregory Hale",
      Title: "Partner",
      Company: "Halloran & Hale LLP (outside counsel)",
      Email: "ghale@halloranhale.com",
      Affiliation: "External — Outside Counsel",
      ContactId: null,
    },
    {
      Name: "Dana Whitfield",
      Title: "Account Executive",
      Company: "Quarry",
      Email: "dana.whitfield@quarrylegal.com",
      Affiliation: "Quarry",
      ContactId: null,
    },
  ],
};

// ---------------------------------------------------------------------------
// Activity history — Tasks (logged call, emails) + a tracked web visit.
// ---------------------------------------------------------------------------

export interface SalesforceActivity extends SfBase {
  WhoId: string | null;
  WhatId: string;
  TaskSubtype: "Call" | "Email" | "Web";
  Subject: string;
  ActivityDate: string;
  Status: string;
  Description: string; // body / snippet
  OwnerName: string;
}

export const activities: SalesforceActivity[] = [
  {
    attributes: {
      type: "Task",
      url: "/services/data/v60.0/sobjects/Task/00THo00001Aa0f1MAB",
    },
    Id: "00THo00001Aa0f1MAB",
    sourceId: "SF-ACT-CALL",
    system: "salesforce",
    WhoId: "003Ho00002Qwe22IAB",
    WhatId: "006Ho00000TgQ9pIAF",
    TaskSubtype: "Call",
    Subject: "Intro call (20 min) — logged from Gong",
    ActivityDate: "2026-07-09",
    Status: "Completed",
    Description:
      "20-minute intro with Marcus (Legal Ops) and Evelyn (GC). Covered the " +
      "St. Aubin defect matter at a high level and current reliance on outside " +
      "counsel. GC skeptical about in-house tooling. Full transcript + trackers " +
      "in Gong (call GONG-CALL). Agreed to a deeper discovery call.",
    OwnerName: "Dana Whitfield",
  },
  {
    attributes: {
      type: "Task",
      url: "/services/data/v60.0/sobjects/Task/00THo00001Aa1g2MAB",
    },
    Id: "00THo00001Aa1g2MAB",
    sourceId: "SF-ACT-EMAIL1",
    system: "salesforce",
    WhoId: "003Ho00002Qwe22IAB",
    WhatId: "006Ho00000TgQ9pIAF",
    TaskSubtype: "Email",
    Subject: "Re: Thanks for the intro — quick recap + next step",
    ActivityDate: "2026-07-09",
    Status: "Completed",
    Description:
      "Sent same day as the intro call. Recapped the three things Marcus flagged " +
      "(defect matter, document volume from subs, wanting to see review done " +
      "in-house). Promised to send a case study from a general contractor that " +
      "faced a similar defect dispute and proposed a 45-min discovery call.",
    OwnerName: "Dana Whitfield",
  },
  {
    attributes: {
      type: "Task",
      url: "/services/data/v60.0/sobjects/Task/00THo00001Aa2h3MAB",
    },
    Id: "00THo00001Aa2h3MAB",
    sourceId: "SF-ACT-EMAIL2",
    system: "salesforce",
    WhoId: "003Ho00002Qwe22IAB",
    WhatId: "006Ho00000TgQ9pIAF",
    TaskSubtype: "Email",
    Subject: "RE: Discovery call — adding our litigation partner",
    ActivityDate: "2026-07-15",
    Status: "Completed",
    Description:
      "Marcus replied to confirm 2026-07-23 at 10:00 MT and mentioned he'd " +
      "'loop in the partner handling the case so everyone hears the same thing.' " +
      "That's how Gregory Hale (Halloran & Hale) got added to the invite.",
    OwnerName: "Dana Whitfield",
  },
  {
    attributes: {
      type: "Task",
      url: "/services/data/v60.0/sobjects/Task/00THo00001Aa3i4MAB",
    },
    Id: "00THo00001Aa3i4MAB",
    sourceId: "SF-ACT-VISIT",
    system: "salesforce",
    WhoId: "003Ho00002Qwe22IAB",
    WhatId: "006Ho00000TgQ9pIAF",
    TaskSubtype: "Web",
    Subject: "Website activity — pricing & AI-review pages",
    ActivityDate: "2026-07-16",
    Status: "Completed",
    Description:
      "Marketing automation logged a visit from Marcus's email domain the day " +
      "after confirming the call: viewed the AI-Assisted Review page and the " +
      "pricing page (no plan or number requested). Signal of active evaluation.",
    OwnerName: "Dana Whitfield",
  },
];

export const salesforce = {
  account,
  opportunity,
  contacts,
  discoveryEvent,
  activities,
};
