// Barrel for the Northslope mock corpus + the anchor for the meeting the whole
// demo is built around: today's 10:00 AM discovery call. All data is fictional.

export * from "./types";
export * from "./salesforce";
export * from "./gong";
export * from "./kb";
export * from "./public-info";
export * from "./sources";

import { salesforce } from "./salesforce";
import { gong } from "./gong";

/** "Today" for the demo — the discovery call is today at 10:00 AM MT. */
export const TODAY = "2026-07-23";

/**
 * The single meeting the prototype prepares for. Later phases assemble context
 * for this meeting id and generate/serve its brief.
 */
export const DISCOVERY_MEETING = {
  id: "northslope-discovery-2026-07-23",
  eventSourceId: salesforce.discoveryEvent.sourceId,
  startDateTime: salesforce.discoveryEvent.StartDateTime,
  durationMinutes: salesforce.discoveryEvent.DurationInMinutes,
  type: "Discovery call",
  accountSourceId: salesforce.account.sourceId,
  opportunitySourceId: salesforce.opportunity.sourceId,
  priorCallSourceId: gong.call.sourceId,
  attendees: salesforce.discoveryEvent.Attendees,
} as const;
