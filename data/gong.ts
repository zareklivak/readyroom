// Gong mock — shaped like the Gong API (`/v2/calls/extensive` +
// `/v2/calls/transcript`): a `metaData` envelope, a `parties` array with
// speakerIds, a `content` block of auto-generated trackers/topics/keyPoints,
// an `interaction` talk-ratio summary, and the transcript itself.
//
// The call object carries sourceId "GONG-CALL" (cite call-level facts:
// trackers, sentiment, duration). Each transcript turn carries "GONG-<n>" so a
// brief can quote a specific line and link straight to it.
//
// This is the ONE prior touch: a 20-minute intro call on 2026-07-09. All data
// is fictional. The transcript deliberately contains a lot of ordinary talk so
// the pipeline's selection work is real — the signal (an objection, a
// commitment, a buried piece of alpha) has to be *found*, not handed over.
//
// Planted gap: "budget" is discussed as board pressure only — there
// is no dollar figure and no statement of who approves spend, anywhere.

import type { SourceRecord } from "./types";

export interface GongParty {
  speakerId: string;
  name: string;
  title: string;
  emailAddress: string;
  affiliation: "Internal" | "External";
}

export interface GongTracker {
  name: string;
  count: number;
}

export interface GongTopic {
  name: string;
  durationSec: number;
}

export interface GongSpeakerStats {
  speakerId: string;
  talkTimeSec: number;
}

export interface GongTurn extends SourceRecord {
  system: "gong";
  speakerId: string;
  startSec: number;
  topic: string;
  text: string;
}

export interface GongCall extends SourceRecord {
  system: "gong";
  metaData: {
    id: string;
    url: string;
    title: string;
    scheduled: string;
    started: string;
    durationSec: number;
    direction: string;
    system: string;
    scope: string;
    media: string;
    language: string;
  };
  parties: GongParty[];
  content: {
    trackers: GongTracker[];
    topics: GongTopic[];
    brief: string;
    keyPoints: string[];
    pointsOfInterest: { type: string; snippet: string; turnSourceId: string }[];
  };
  interaction: {
    speakers: GongSpeakerStats[];
    repTalkRatio: number; // 0–1
  };
  sentiment: {
    overall: string;
    byParticipant: { speakerId: string; label: string; note: string }[];
  };
  transcript: GongTurn[];
}

const SPK_DANA = "spk_dana"; // Quarry AE (internal)
const SPK_EVELYN = "spk_evelyn"; // General Counsel (external)
const SPK_MARCUS = "spk_marcus"; // Legal Ops Manager (external)

// Turn helper keeps the transcript readable and auto-numbers GONG-<n>.
type RawTurn = { speakerId: string; startSec: number; topic: string; text: string };

const rawTranscript: RawTurn[] = [
  { speakerId: SPK_DANA, startSec: 4, topic: "Rapport", text: "Hey Marcus, good morning — can you hear me okay?" },
  { speakerId: SPK_MARCUS, startSec: 8, topic: "Rapport", text: "Morning, Dana. Yeah, loud and clear. Give me one sec, I think Evelyn's just joining." },
  { speakerId: SPK_DANA, startSec: 14, topic: "Rapport", text: "No rush at all. How's the week treating you? I saw Denver got some real weather over the weekend." },
  { speakerId: SPK_MARCUS, startSec: 22, topic: "Rapport", text: "Ha, yeah, wild — went from snow to seventy degrees in about two days. Standard Colorado. Okay, here she is." },
  { speakerId: SPK_EVELYN, startSec: 31, topic: "Rapport", text: "Hi, sorry, back-to-back this morning. Evelyn Brandt, I'm the GC here. Nice to meet you, Dana." },
  { speakerId: SPK_DANA, startSec: 40, topic: "Agenda", text: "Great to meet you, Evelyn, thanks for making the time. I know mornings are brutal. I'll keep us tight — I was thinking we'd spend maybe fifteen, twenty minutes today just so I understand what's going on and whether there's even a fit, and then if it makes sense we grab more time. That work?" },
  { speakerId: SPK_MARCUS, startSec: 58, topic: "Agenda", text: "That's perfect. We don't need a hard pitch, we just want to understand what's possible." },
  { speakerId: SPK_EVELYN, startSec: 66, topic: "Agenda", text: "Agreed. And I'll be honest up front, I'm the skeptic in the room, so don't take my questions the wrong way." },
  { speakerId: SPK_DANA, startSec: 75, topic: "Discovery", text: "Honestly, I prefer it that way — you'll keep me useful. So maybe start me at the beginning. Marcus, when you filled out the form, what was the thing that made you go, okay, let me actually go look at this?" },
  { speakerId: SPK_MARCUS, startSec: 92, topic: "Matter background", text: "Sure. So — and Evelyn can jump in — we've got a construction-defect matter on a hospital project we did, the St. Aubin expansion up in Fort Collins. It's gone multi-party. Owner's pointing at us, we're pointing at some of the subs, the architect's involved. And the thing is just... it's a document monster. Every change order, every RFI, months of email between the field teams and the subs." },
  { speakerId: SPK_DANA, startSec: 120, topic: "Matter background", text: "Yeah, defect cases are brutal that way — the whole story is buried in the project record." },
  { speakerId: SPK_MARCUS, startSec: 128, topic: "Matter background", text: "Exactly. And right now all of that just gets shipped off and we kind of lose visibility into it." },
  { speakerId: SPK_EVELYN, startSec: 140, topic: "Current process", text: "Which is really where my discomfort is. I came into this role about eight months ago, and I inherited a setup where basically anything litigation-related goes straight to outside counsel, and they run it however they run it. For a matter this size that starts to feel like a lot of money leaving the building with not a lot of transparency." },
  { speakerId: SPK_DANA, startSec: 168, topic: "Current process", text: "That's a really common place to be, especially for a lean in-house team. Can I ask — when you say it all goes out, does that include the document review itself? Like, is a vendor doing the hosting and first-pass review?" },
  { speakerId: SPK_MARCUS, startSec: 186, topic: "Current process", text: "Yeah. Outside counsel brings their own ediscovery vendor, and we get billed through them for it. We honestly don't even see the platform. We just get invoices and, eventually, a narrative." },
  { speakerId: SPK_EVELYN, startSec: 205, topic: "Current process", text: "And to be clear, I don't think anyone's doing anything wrong. It's just — the litigation budget on this one matter is going to be significant, and the board has started asking me pointed questions about how we're managing it. I don't love that my honest answer right now is 'I'm not entirely sure.'" },
  { speakerId: SPK_DANA, startSec: 228, topic: "Current process", text: "That pressure from the board — that's exactly the kind of thing that tends to push teams to at least look at bringing more of this in-house. Not necessarily everything, but the parts where you're paying a premium for something you could see yourself." },
  { speakerId: SPK_MARCUS, startSec: 246, topic: "Goals", text: "Right, and that's the phrase I keep coming back to — visibility. Even if we kept counsel involved, I'd love for us to actually be able to look at our own documents." },
  { speakerId: SPK_EVELYN, startSec: 262, topic: "Objection", text: "Here's my hesitation, though, and this is the skeptic talking. We are not an ediscovery shop. I've got myself, two attorneys who are already underwater, Marcus, and one paralegal. I'm genuinely not sure we can bring this in-house without it becoming a second job for people who don't have time for a first one." },
  { speakerId: SPK_DANA, startSec: 288, topic: "Objection", text: "That's a completely fair concern, and honestly if you told me you wanted to run a massive review with a team of four and no tooling, I'd tell you not to. The question I'd want to answer for you is whether the tool does enough of the heavy lifting that your paralegal plus counsel can actually manage it, instead of it managing them." },
  { speakerId: SPK_EVELYN, startSec: 312, topic: "Objection", text: "That's the thing I'd need to believe." },
  { speakerId: SPK_MARCUS, startSec: 318, topic: "Product", text: "Can I ask the naive question — when you say the tool does the heavy lifting, what does that actually mean on a matter like ours?" },
  { speakerId: SPK_DANA, startSec: 330, topic: "Product", text: "Yeah, so at the front end, before anyone's reviewing anything document by document, there's early case assessment — you load the material and you can see the shape of it. Who's talking to who, when the volume spikes, where the change orders cluster. On a defect case that's often where the real timeline lives." },
  { speakerId: SPK_EVELYN, startSec: 356, topic: "Product", text: "Mm." },
  { speakerId: SPK_DANA, startSec: 360, topic: "Product", text: "And then on review itself, this is where the AI piece matters. Instead of a person reading all of it, the system helps you surface what's relevant, it can draft summaries of long threads, and it learns from the calls your team makes so the obvious stuff stops eating your paralegal's day." },
  { speakerId: SPK_MARCUS, startSec: 384, topic: "Product", text: "See, that's the part I want Tina to see. Tina's our senior paralegal — she'd be the one living in this." },
  { speakerId: SPK_DANA, startSec: 396, topic: "Product", text: "Totally, and I'd want her in the room for a real look. Is she someone who's used review platforms before, or would this be new?" },
  { speakerId: SPK_MARCUS, startSec: 408, topic: "Product", text: "New-ish. She's sharp, she'll pick it up. It's more Evelyn I need to get comfortable." },
  { speakerId: SPK_EVELYN, startSec: 418, topic: "Objection", text: "It's true. Look — I'm not anti-technology. I just don't want to buy a thing that sits on a shelf because we didn't have the time to stand it up." },
  { speakerId: SPK_DANA, startSec: 432, topic: "Discovery", text: "That's the right worry to have. Can I ask what your experience has been — have you stood something like this up before, in a previous role?" },
  { speakerId: SPK_EVELYN, startSec: 447, topic: "Buried alpha", text: "I mean — a little. At my last company, before Northslope, we did have a platform we used for a big investigation. I wasn't the admin or anything, I was on the legal side, but I saw what it looked like when it worked. So I know the value's real when it's set up right. That's actually part of why I'm even entertaining this. I just also saw how much effort the setup was." },
  { speakerId: SPK_DANA, startSec: 476, topic: "Buried alpha", text: "That's really helpful context, actually — so you've seen the upside firsthand." },
  { speakerId: SPK_EVELYN, startSec: 486, topic: "Buried alpha", text: "I've seen the upside and the pain, yeah." },
  { speakerId: SPK_DANA, startSec: 494, topic: "Objection handling", text: "So let me play that back — the appetite is there, the worry is bandwidth and standing it up. What if I told you the setup for a single matter like this is a lot lighter than the big-investigation version you're remembering?" },
  { speakerId: SPK_EVELYN, startSec: 514, topic: "Objection handling", text: "I'd want to see it, not hear it." },
  { speakerId: SPK_DANA, startSec: 520, topic: "Next steps", text: "Fair. That's what I'd want the next conversation to be — an actual look, with Tina, on something shaped like your matter." },
  { speakerId: SPK_MARCUS, startSec: 532, topic: "Next steps", text: "I think that's the right next step. Evelyn, that's what I was hoping for." },
  { speakerId: SPK_EVELYN, startSec: 540, topic: "Next steps", text: "I'm open to it. I'll reserve judgment." },
  { speakerId: SPK_DANA, startSec: 548, topic: "Scoping", text: "That's all I'd ask. Marcus, on the matter itself — roughly how much material are we talking? Even a gut number. Gigabytes, custodians, anything." },
  { speakerId: SPK_MARCUS, startSec: 566, topic: "Scoping", text: "I don't have an exact number. It's years of a big project, dozens of people in the field, plus all the sub correspondence. It's not small. I can try to get you a real figure before the next call." },
  { speakerId: SPK_DANA, startSec: 586, topic: "Scoping", text: "That'd help me tailor the walkthrough. No need to be precise." },
  { speakerId: SPK_EVELYN, startSec: 596, topic: "Scoping", text: "Marcus, loop in whoever has the data map from the firm." },
  { speakerId: SPK_MARCUS, startSec: 604, topic: "Scoping", text: "Yeah, I'll ask outside counsel for the current collection scope." },
  { speakerId: SPK_DANA, startSec: 614, topic: "Stakeholders", text: "That actually raises something I want to be thoughtful about. Since outside counsel is running the show today, how do you two want to handle bringing them into this conversation? I don't want to make anyone defensive." },
  { speakerId: SPK_EVELYN, startSec: 634, topic: "Stakeholders", text: "That's a good question, and honestly a real one. The firm's been good to us. I'm not looking to blow up the relationship. But I also don't think it's their call whether we get visibility into our own documents." },
  { speakerId: SPK_MARCUS, startSec: 656, topic: "Stakeholders", text: "I actually already flagged that I'd bring the partner on the case into the next call. I figured better everyone hears the same thing than me trying to relay it." },
  { speakerId: SPK_DANA, startSec: 672, topic: "Stakeholders", text: "That's... good to know, I appreciate the heads up. I'd just want us to be clear-eyed that a firm billing for the current setup might not be the most neutral voice on changing it. Doesn't mean we hide anything — just that we frame it as making them faster, not replacing them." },
  { speakerId: SPK_EVELYN, startSec: 696, topic: "Stakeholders", text: "That's a smart way to put it, and it's more or less where my head is too. I'm not trying to fire anybody. I'm trying to stop feeling blind." },
  { speakerId: SPK_DANA, startSec: 714, topic: "Stakeholders", text: "Then that's exactly how I'll come at it. Making the people you already trust faster and more transparent, not ripping anything out." },
  { speakerId: SPK_MARCUS, startSec: 730, topic: "Stakeholders", text: "Good. That'll land a lot better with the partner than 'we're bringing it all in-house.'" },
  { speakerId: SPK_EVELYN, startSec: 742, topic: "Pricing", text: "Can I ask the blunt question? If we did some version of this, what does it cost? I don't need a quote today, I just don't want to fall in love with something we then can't square with the budget conversation I'm going to have to have." },
  { speakerId: SPK_DANA, startSec: 764, topic: "Pricing", text: "Totally reasonable, and I'd rather scope it right than throw a number that's wrong. That's actually a great reason to do the working session next — once I understand the matter, I can put real options in front of you instead of a made-up range. Would it be alright if I don't guess today?" },
  { speakerId: SPK_EVELYN, startSec: 786, topic: "Pricing", text: "Yes. I'd honestly trust that more than a fast number." },
  { speakerId: SPK_MARCUS, startSec: 794, topic: "Pricing", text: "Same." },
  { speakerId: SPK_DANA, startSec: 800, topic: "Recap", text: "Perfect. Okay — so from my earlier note, Marcus, you mentioned the defect matter, the document volume from the subs, and wanting to actually see review happen in-house. Did I capture the priorities right?" },
  { speakerId: SPK_MARCUS, startSec: 818, topic: "Recap", text: "Yeah, that's the three. Visibility, the volume problem, and not being dependent for every little thing." },
  { speakerId: SPK_EVELYN, startSec: 830, topic: "Recap", text: "I'd add: proof it won't become a burden on my team. That's the whole ballgame for me." },
  { speakerId: SPK_DANA, startSec: 842, topic: "Commitment", text: "Noted, and that'll be the center of the next conversation. Let me make sure I follow through on something — on our last email I said I'd send you a case study from a general contractor that went through a defect dispute a lot like St. Aubin. Did that come through, or did it get lost?" },
  { speakerId: SPK_MARCUS, startSec: 864, topic: "Commitment", text: "You know, I'm not sure I saw it. Might've missed it." },
  { speakerId: SPK_DANA, startSec: 872, topic: "Commitment", text: "No worries, that's on me to resend. I'll get you the defect-dispute case study today, right after this — it's the closest thing we have to your situation, same shape of matter, similar size team. That'll give Evelyn something concrete to react to." },
  { speakerId: SPK_EVELYN, startSec: 892, topic: "Commitment", text: "That would help. I respond to specifics." },
  { speakerId: SPK_DANA, startSec: 900, topic: "Next steps", text: "Then specifics you'll get. And for the working session — Marcus, you'll try to get me a rough sense of the data scope, and pull Tina in?" },
  { speakerId: SPK_MARCUS, startSec: 914, topic: "Next steps", text: "Yep. I'll get Tina on it and ask the firm for the collection scope." },
  { speakerId: SPK_DANA, startSec: 924, topic: "Next steps", text: "Amazing. Evelyn, anything you need from me to walk in willing to be convinced?" },
  { speakerId: SPK_EVELYN, startSec: 934, topic: "Next steps", text: "Just — don't oversell it. Show me the boring parts. Show me what my paralegal's Tuesday actually looks like using this." },
  { speakerId: SPK_DANA, startSec: 950, topic: "Next steps", text: "That's my favorite kind of demo, honestly. The unglamorous, real one. I'll build it around Tina's Tuesday." },
  { speakerId: SPK_EVELYN, startSec: 964, topic: "Close", text: "Then I'll keep an open mind." },
  { speakerId: SPK_MARCUS, startSec: 972, topic: "Close", text: "This was good. Thanks for keeping it low-key, Dana, that helps." },
  { speakerId: SPK_DANA, startSec: 980, topic: "Close", text: "Of course. I'll send the recap and the case study today, and Marcus, you and I can nail down timing over email. Evelyn, genuinely, thank you for the honest pushback. It makes my job easier." },
  { speakerId: SPK_EVELYN, startSec: 996, topic: "Close", text: "We'll talk soon." },
];

export const transcript: GongTurn[] = rawTranscript.map((t, i) => ({
  sourceId: `GONG-${i + 1}`,
  system: "gong",
  speakerId: t.speakerId,
  startSec: t.startSec,
  topic: t.topic,
  text: t.text,
}));

export const call: GongCall = {
  sourceId: "GONG-CALL",
  system: "gong",
  metaData: {
    id: "8004455512780031744",
    url: "https://us-12345.app.gong.io/call?id=8004455512780031744",
    title: "Quarry × Northslope — Intro Call",
    scheduled: "2026-07-09T20:00:00.000Z",
    started: "2026-07-09T20:00:12.000Z",
    durationSec: 1002,
    direction: "Conference",
    system: "Google Meet",
    scope: "External",
    media: "Video",
    language: "eng",
  },
  parties: [
    {
      speakerId: SPK_DANA,
      name: "Dana Whitfield",
      title: "Account Executive",
      emailAddress: "dana.whitfield@quarrylegal.com",
      affiliation: "Internal",
    },
    {
      speakerId: SPK_EVELYN,
      name: "Evelyn Brandt",
      title: "General Counsel",
      emailAddress: "ebrandt@northslopeconstruction.com",
      affiliation: "External",
    },
    {
      speakerId: SPK_MARCUS,
      name: "Marcus Reyes",
      title: "Legal Operations Manager",
      emailAddress: "mreyes@northslopeconstruction.com",
      affiliation: "External",
    },
  ],
  content: {
    // Counts are the real number of phrase occurrences in the transcript above.
    trackers: [
      { name: "Budget", count: 2 },
      { name: "Outside Counsel", count: 4 },
      { name: "Competition", count: 0 },
      { name: "Pricing Question", count: 1 },
      { name: "Next Steps", count: 3 },
    ],
    topics: [
      { name: "Matter background", durationSec: 96 },
      { name: "Current process", durationSec: 132 },
      { name: "Objection / bandwidth", durationSec: 150 },
      { name: "Product overview", durationSec: 120 },
      { name: "Stakeholders", durationSec: 132 },
      { name: "Pricing", durationSec: 60 },
      { name: "Next steps", durationSec: 108 },
    ],
    brief:
      "Intro call for a construction-defect matter (St. Aubin hospital " +
      "expansion). Legal Ops (Marcus) is the champion and wants document " +
      "visibility; GC (Evelyn) is supportive of the goal but skeptical about " +
      "in-house bandwidth. Board pressure on litigation cost is the driver. " +
      "Agreed to a working-session discovery call with the paralegal present.",
    keyPoints: [
      "Document-heavy defect matter; everything currently routed to outside counsel + their vendor.",
      "GC's core objection is team bandwidth, not value.",
      "GC has prior positive experience with a review platform at a former employer.",
      "Rep committed to resend the general-contractor defect case study.",
      "Next step: working session with the paralegal (Tina) on a matter-shaped example.",
    ],
    pointsOfInterest: [
      {
        type: "Objection",
        snippet: "not sure we can bring this in-house without it becoming a second job",
        turnSourceId: "GONG-19",
      },
      {
        type: "Buried signal",
        snippet: "At my last company... we did have a platform we used for a big investigation.",
        turnSourceId: "GONG-31",
      },
      {
        type: "Commitment",
        snippet: "I'll get you the defect-dispute case study today.",
        turnSourceId: "GONG-60",
      },
      {
        type: "Stakeholder risk",
        snippet: "I'd bring the partner on the case into the next call.",
        turnSourceId: "GONG-46",
      },
    ],
  },
  interaction: {
    speakers: [
      { speakerId: SPK_DANA, talkTimeSec: 470 },
      { speakerId: SPK_EVELYN, talkTimeSec: 330 },
      { speakerId: SPK_MARCUS, talkTimeSec: 202 },
    ],
    repTalkRatio: 0.47,
  },
  sentiment: {
    overall: "Neutral-to-positive",
    byParticipant: [
      {
        speakerId: SPK_EVELYN,
        label: "Guarded / skeptical",
        note: "Warmed over the call; ended willing to keep an open mind. Values proof over pitch.",
      },
      {
        speakerId: SPK_MARCUS,
        label: "Positive / engaged",
        note: "Clear internal champion; pushing the evaluation forward.",
      },
    ],
  },
  transcript,
};

export const gong = { call, transcript };
