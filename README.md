# ReadyRoom — a meeting-prep agent

**ReadyRoom turns ~45 minutes of manual discovery-call prep into a ~5-minute read:
a grounded, source-cited brief a rep opens right before the call.**

> **All data in this project is fictional.** The scenario: a field rep at
> *Quarry*, an invented e-discovery vendor, preparing for a discovery call with
> *Northslope*, an invented prospect. The people, the Gong call transcript, the
> news items, and every knowledge-base case study are made up. No confidential,
> proprietary, or customer data from anywhere is used.

This document is the technical spec. Every section opens with a plain-English
**In short** line; the technical detail follows. The same spec is viewable in the
app under **Architecture**, and as a print-to-PDF page at **/docs/spec**; the
measurement plan is at **/docs/one-pager**.

---

## Run it locally

```bash
npm install
cp .env.example .env.local          # set READYROOM_ACCESS_CODE; ANTHROPIC_API_KEY optional
npm run dev                         # http://localhost:3000  (gate → Today → brief)
npm run evals                       # 5/5 deterministic checks over the precomputed brief
npm run precompute                  # (needs ANTHROPIC_API_KEY) regenerate brief + scorecard live
```

No API key is needed to run the app or the evals — everything works off the
committed precomputed brief. A key only powers the live **Regenerate** button and
`npm run precompute`.

---

## 1 · What this is

**In short:** field reps spend ~45 minutes assembling context before each
discovery call. ReadyRoom does that assembly automatically and hands the rep one
brief that ends in *what to ask* and *what to avoid* — not a wall of facts.

Reps read the CRM, re-listen to the last call, search for company news, and hunt
the knowledge base for a relevant case study. ReadyRoom pulls all of that into a
single brief. Every claim traces to a source (Salesforce, Gong, public web, or
the knowledge base) via a **citation chip**; anything the sources don't establish
is flagged as unknown rather than guessed. The prototype prepares one fictional
discovery call end-to-end and *designs* all five sources — two (Salesforce, Gong)
plus the knowledge base are mocked deeply.

## 2 · Assumptions

**In short:** all data is fictional; a production version assumes read access to
the rep's real systems of record and a calendar of upcoming meetings.

The prospect, people, transcript, news, and case studies are invented. Assumed
inputs for production: read access to Salesforce, Gong, a company-news source,
and the knowledge base; a calendar to know which meetings are coming (this is what
makes precompute possible); and an LLM API.

## 3 · The rep experience (where the 45 minutes goes)

**In short:** each brief section maps to a manual step it replaces; the reading
time badges sum to ~5 minutes, the replaced steps to ~45.

The brief is built for the rep's five minutes, not the model's: a TL;DR hero
card, a sticky rail with a **5:00** reading meter, per-section time badges, and a
bold-first-sentence pattern so it skims in one pass. Each section carries a
"replaces" note — *Last conversation* replaces re-listening to the intro call
(~12 min); *Why now* replaces searching the web (~5 min) — and the header totals
it: ~45 minutes of prep, designed to read in ~5.

## 4 · Architecture

**In short:** four source adapters feed a deterministic assembly step, which
feeds one Claude call, which produces a schema-validated brief. A nightly job
precomputes the default; an on-demand endpoint regenerates on request (rate-limited).

```
SOURCES (adapters)      CONTEXT ASSEMBLY          REASONING             OUTPUT
 Salesforce  ┐          (deterministic TS)        one Claude call        Brief JSON
 Gong        ┤   ─────▶  load → select →    ─────▶  • assert only    ───▶  (schema-
 Public web  ┤          rank (KB) → tag             source-ID'd facts       validated)
 Knowledge   ┘          w/ [SOURCE-ID] →           • every claim cites   →  citation
 base                   one context block          • gaps → unknowns        chips + UI
                                                                              │
   nightly precompute  ◀── serve precomputed default ──────────────◀─────────┘
   (batch, cached)         + on-demand regenerate endpoint (rate-limited)

 EVAL THREAD:  dev harness (npm run evals)  ─▶  CI gate  ─▶  Post-Call Scorecard
               the same rules (R1–R6) enforced at three moments
```

The pipeline is four plain steps — load the sources, select the relevant slice,
rank the knowledge base, tag every fact with a source ID — then a single model
call under a grounding contract, then a schema-validated JSON brief the UI
renders. No agent loop, no vector store.

## 5 · Source adapters (mock ↔ real)

**In short:** each mock mimics the shape of the real API it stands in for, so
swapping in the live integration is a field mapping, not a redesign.

| Source | Mock (built) | Real API | Notes |
|---|---|---|---|
| Salesforce (CRM) | REST-ish objects — `attributes` / `Id` / PascalCase, FK relationships | Salesforce REST + Bulk (Account, Opportunity, Contact, Event, Task) | Small slice; always fits. Fields map 1:1. |
| Gong (call intel) | Call object — `metaData`, `parties`, `content.trackers`, full transcript | Gong `/v2/calls/extensive` + `/v2/calls/transcript` | Largest input; cheap-tier compression at scale. |
| Public web | News items — outlet, headline, body, tags | Web search API + fetch, or a data provider | Freshness matters; cache per company. |
| Knowledge base | Case studies + product one-pagers with tags | Quarry content store / docs CMS | Ranked by tag overlap; retrieval past the flip threshold. |

## 6 · The reasoning layer

**In short:** one model call, structured JSON out, under a strict grounding
contract — assert only cited facts, flag everything else as unknown.

The model receives one context block where every fact is tagged with a
`[SOURCE-ID]`. Its contract:

- **R1 Grounding** — assert only facts tagged with a source ID; no outside knowledge.
- **R2 Citations** — every claim cites at least one source.
- **R3 No invention** — never fabricate numbers, quotes, names, or dates.
- **R4 Honest unknowns** — anything the sources don't establish goes to *What we don't know*.
- **R5 Confidence** — tag each claim confirmed / inferred / speculative.
- **R6 Schema** — output one JSON object matching the schema.

Output is structured, not prose, because structure is load-bearing — citation
chips, confidence tags, and the mechanical evals all derive from the same schema.
**You can't lint a markdown blob.** Generation uses the flagship model with
adaptive thinking and no temperature knob; determinism comes from the contract,
not sampling.

## 7 · Tradeoffs

**In short:** the interesting decisions and the road not taken — with the
condition under which we'd revisit each.

| Decision | Chosen | Rejected | Why | Revisit when |
|---|---|---|---|---|
| Pipeline shape | Deterministic TS pipeline | Agentic tool-calling loop | A known meeting with four known sources doesn't need the model to decide what to fetch — a loop adds latency, cost, and nondeterminism for no benefit. Choosing boring is the senior call. | Sources become dynamic/unknown and the agent must decide what to pull. |
| Retrieval | Stuff the full context | Vector store / RAG | At one-meeting scope everything fits in one context window; a vector DB earns nothing. | KB > ~50 docs, or Gong history spans years → retrieve on KB + Gong only. |
| Serving | Nightly precompute + on-demand regenerate | Always on-demand | Meetings are known in advance, so briefs can be built ahead — instant to open, cheap to batch, no cold-call latency in front of a prospect. | Meetings routinely appear < 60 min out. |
| Output format | Structured JSON (one schema) | Markdown / free text | Structure is load-bearing: chips, confidence tags, and evals all fall out of the schema. | Never — the structure is the product. |
| Model choice (per stage) | Flagship (`claude-opus-4-8`) for the nightly precompute; a faster tier (`claude-sonnet-5`) for the interactive regen; cheap tier for transcript compression | One mid-tier everywhere | Match the model to the stage: the nightly brief has no latency budget (flagship); the interactive "Regenerate" has a hard serverless time limit (faster tier) — same pipeline, same grounding contract. | Cost pressure → push more stages down a tier; latency pressure → fast mode on the flagship. |
| Access control (demo) | Shared-password gate | Real SSO in the prototype | Auth isn't what's being evaluated; a shared code lets reviewers in with one credential. | Production → Okta SSO + CRM-inherited permissions. |

## 8 · The evaluation thread

**In short:** one continuous thread — the same grounding rules are checked at dev
time, in CI, and in production after the call.

The system-prompt contract and the eval harness enforce the **same** numbered
rules — *prompt contract = eval contract*. `npm run evals` runs five deterministic
checks over the brief, each mapped to a contract rule:

| Rule | Check | What it proves |
|---|---|---|
| R6 | Schema validity | the output is one object matching the schema |
| R2 | Citation coverage | every claim cites ≥ 1 source |
| R1 | Citation resolution | every cited ID is a real record |
| R3 | Numeric grounding | every number appears verbatim in a cited source |
| R4 | Honest unknowns | budget + authority flagged as unknown, unasserted elsewhere |

CI runs these on any change to `prompts/`, the schema, the checks, or the
precomputed brief — **prompt changes are code changes**. The same idea closes the
loop in production: a brief is a set of falsifiable predictions, and Gong records
the ground truth. The **Post-Call Scorecard** grades each predicted pain against
the transcript (confirmed / refuted / never surfaced) and checks which suggested
questions were actually asked. Dev harness → CI gate → post-call scorecard: the
same rules, three moments. A named-but-unbuilt next step is an LLM-judge
faithfulness check, run on samples in production.

## 9 · Path to production

**In short:** at ~250 GTM users this is a **cost-and-trust problem, not a traffic
problem**. What you need is SSO, CRM-inherited permissions, caching, and
evals-in-CI; what you don't need is Kubernetes, load balancers, or a vector DB.

250 users generating a few briefs a day is trivial serverless load — the
interesting scaling is keeping briefs cheap and trustworthy, not keeping servers
up.

**Need**

- Okta SSO in place of the demo password gate.
- Permissions that inherit Salesforce visibility — a rep sees briefs only for accounts they can see in CRM.
- Prompt caching on the stable prefix + the nightly precompute batch, for cost control.
- Rate limiting (built) plus spend-budget alerts.
- Secrets management — model keys server-side only (already the case).
- Error tracking / observability on the pipeline and the live endpoint.
- Evals in CI gating prompt changes (built), and the post-call scorecard as the live eval loop.

**Don't need (at this scale)**

- Kubernetes or container orchestration — serverless functions are plenty.
- Load balancers or autoscaling fleets — the traffic is trivial.
- Multi-region — a single region is fine for an internal tool.
- A vector database — context fits until the KB/Gong flip threshold.
- A fine-tuned model — grounded prompting is enough, and avoids a training-data liability.

## 10 · Cost

**In short:** a brief costs roughly **~$0.15** to generate; briefing every
discovery call for 250 reps runs on the order of **~$1.6K/month** before caching.

The input is dominated by the full Gong transcript. Token counts are heuristic
estimates (chars ÷ 4) from the built context; `npm run precompute` records live
actuals to `data/precomputed-cost.json`.

| | Estimate |
|---|---|
| Model | `claude-opus-4-8` ($5 / 1M in, $25 / 1M out) |
| Input tokens / brief | ~6,700 (system + assembled context; transcript dominates) |
| Output tokens / brief | ~4,800 (brief JSON ~2.3K + adaptive thinking ~2.5K) |
| **Cost / brief** | **~$0.15** |
| Volume | 250 reps × ~2 briefs/day × ~21 workdays ≈ 10,500 briefs/mo |
| **Cost / month** | **~$1,600** (before caching / compression) |

Prompt caching on the stable system+context prefix (cache reads ≈ 0.1× input) and
cheap-tier (`claude-haiku-4-5`) transcript compression cut the input cost
materially at batch scale.

## 11 · Security & privacy

**In short:** demo access is a shared password (production would be SSO); model
keys stay server-side; no customer data trains any model.

The prototype gates access with a shared password over a signed HttpOnly cookie —
demo-only, replaced in production by Okta SSO and permissions that inherit
Salesforce visibility. The model key is server-side only, never shipped to the
browser, and the live endpoint is rate-limited (10/hour/IP, 25/day global) with a
spend cap. For a legal buyer: no customer data trains any model, and every claim
is traceable to the customer's own systems of record. All data here is fictional.

## 12 · What we'd build next

**In short:** ship the nightly scheduler, wire the two easiest real integrations
first, and turn the scorecard's signals into a calibration dashboard.

First the nightly precompute scheduler (below) so briefs are ready before reps
wake up; then the two highest-signal integrations, Salesforce and Gong, behind the
adapter boundary already designed; then turn the auto-instrumented scorecard
metrics into a calibration view so the confidence tags become measurable over
time.

```python
# Nightly precompute scheduler (unbuilt — the prototype precomputes one brief by hand).
# Runs ~T-12h before the day's meetings; briefs are ready when reps wake up.

for meeting in calendar.meetings_between(now, now + 24h):
    if meeting.type != "discovery_call":
        continue
    if cache.fresh(meeting.id):              # sources unchanged since last run
        continue

    ctx = assemble_context(meeting)          # load 4 sources → select → rank → tag
    # prompt caching: the system prompt + stable context prefix are cached,
    # so only the per-meeting tail is billed at full input rate.
    brief = claude.generate(ctx, schema=BriefSchema, cached_prefix=ctx.stable)

    if not evals.pass(brief):                # the SAME 5 checks CI runs
        alerts.notify("brief failed grounding evals", meeting)
        continue                             # never ship an ungrounded brief

    cache.put(meeting.id, brief)             # rep opens it instantly at T-0

# T-60m top-up for meetings created late (the on-demand path also covers this live).
```

---

*Portfolio project — all data, people and companies are fictional.*
