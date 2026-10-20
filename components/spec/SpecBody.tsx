// The spec rendered from lib/spec-content.ts — used by both the in-app
// Architecture page (screen) and /docs/spec (print). Plain server component, no
// interactivity. The eval table is fed live from data/eval-results.json (written
// by `npm run evals`), so the spec always shows the latest gate result.

import {
  SECTIONS,
  DIAGRAM,
  SOURCE_ADAPTERS,
  TRADEOFFS,
  PATH_TO_PRODUCTION,
  COST,
  SCHEDULER_PSEUDOCODE,
  type SpecSection,
} from "@/lib/spec-content";
import { formatUsd } from "@/lib/cost";
import evalResults from "@/data/eval-results.json";

function usd(n: number) {
  return formatUsd(n);
}

function InShort({ text }: { text: string }) {
  return (
    <p className="my-3 border-l-2 border-accent pl-3 text-[15px] leading-relaxed text-ink">
      <span className="font-semibold text-accent">In short: </span>
      {text}
    </p>
  );
}

function Pre({ children }: { children: string }) {
  return (
    <div className="my-4 overflow-x-auto rounded-lg border border-hair bg-canvas p-4">
      <pre className="font-mono text-[12px] leading-relaxed text-ink whitespace-pre">
        {children}
      </pre>
    </div>
  );
}

function TableShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="my-4 overflow-x-auto">
      <table className="w-full border-collapse text-left text-[13px]">{children}</table>
    </div>
  );
}

const TH = "border-b border-hair px-2 py-2 font-semibold text-ink align-bottom";
const TD = "border-b border-hair px-2 py-2 align-top text-ink-soft";

function AdaptersTable() {
  return (
    <TableShell>
      <thead>
        <tr>
          <th className={TH}>Source</th>
          <th className={TH}>Mock (built)</th>
          <th className={TH}>Real API</th>
          <th className={TH}>Notes</th>
        </tr>
      </thead>
      <tbody>
        {SOURCE_ADAPTERS.map((r) => (
          <tr key={r.source}>
            <td className={`${TD} font-medium text-ink`}>{r.source}</td>
            <td className={TD}>{r.mock}</td>
            <td className={TD}>{r.realApi}</td>
            <td className={TD}>{r.notes}</td>
          </tr>
        ))}
      </tbody>
    </TableShell>
  );
}

function TradeoffsTable() {
  return (
    <TableShell>
      <thead>
        <tr>
          <th className={TH}>Decision</th>
          <th className={TH}>Chosen</th>
          <th className={TH}>Rejected</th>
          <th className={TH}>Why</th>
          <th className={TH}>Revisit when</th>
        </tr>
      </thead>
      <tbody>
        {TRADEOFFS.map((r) => (
          <tr key={r.decision}>
            <td className={`${TD} font-medium text-ink`}>{r.decision}</td>
            <td className={`${TD} text-ink`}>{r.chosen}</td>
            <td className={TD}>{r.rejected}</td>
            <td className={TD}>{r.why}</td>
            <td className={TD}>{r.revisit}</td>
          </tr>
        ))}
      </tbody>
    </TableShell>
  );
}

function EvalTable() {
  return (
    <>
      <TableShell>
        <thead>
          <tr>
            <th className={TH}>Rule</th>
            <th className={TH}>Check</th>
            <th className={TH}>Result</th>
            <th className={TH}>Detail</th>
          </tr>
        </thead>
        <tbody>
          {evalResults.checks.map((c) => (
            <tr key={c.rule + c.name}>
              <td className={`${TD} font-mono text-ink`}>{c.rule}</td>
              <td className={`${TD} font-medium text-ink`}>{c.name}</td>
              <td className={TD}>
                <span className={c.pass ? "font-semibold text-confirmed" : "font-semibold text-red-700"}>
                  {c.pass ? "✓ PASS" : "✗ FAIL"}
                </span>
              </td>
              <td className={TD}>{c.detail}</td>
            </tr>
          ))}
        </tbody>
      </TableShell>
      <p className="text-xs text-ink-soft">
        {evalResults.passed}/{evalResults.total} passing · {evalResults.mode} mode · last run{" "}
        {new Date(evalResults.ranAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
      </p>
    </>
  );
}

function CostTable() {
  const rows: [string, string][] = [
    ["Model", `${COST.model} ($${COST.pricing.inputPerMTok} / 1M in, $${COST.pricing.outputPerMTok} / 1M out)`],
    ["Input tokens / brief", `~${COST.estInputTokens.toLocaleString()} (system + context; transcript dominates)`],
    ["Output tokens / brief", `~${COST.estOutputTokens.toLocaleString()} (brief JSON + adaptive thinking)`],
    ["Cost / brief", usd(COST.perBriefUsd)],
    ["Volume", `${COST.reps} reps × ~${COST.briefsPerRepPerDay} briefs/day ≈ ${COST.briefsPerMonth.toLocaleString()} briefs/mo`],
    ["Cost / month", `~${usd(COST.perMonthUsd)} (before caching / compression)`],
  ];
  return (
    <>
      <TableShell>
        <tbody>
          {rows.map(([k, v]) => (
            <tr key={k}>
              <td className={`${TD} w-1/3 font-medium text-ink`}>{k}</td>
              <td className={`${TD} ${k.startsWith("Cost") ? "font-semibold text-ink" : ""}`}>{v}</td>
            </tr>
          ))}
        </tbody>
      </TableShell>
      <p className="text-xs text-ink-soft">{COST.note}</p>
    </>
  );
}

function PathToProd() {
  return (
    <div className="my-4 grid gap-4 sm:grid-cols-2">
      <div className="rounded-lg border border-hair p-4">
        <div className="mb-2 text-sm font-semibold text-confirmed">Need</div>
        <ul className="space-y-1.5 text-[13px] text-ink-soft">
          {PATH_TO_PRODUCTION.need.map((n, i) => (
            <li key={i} className="flex gap-2">
              <span className="text-confirmed" aria-hidden>+</span>
              <span>{n}</span>
            </li>
          ))}
        </ul>
      </div>
      <div className="rounded-lg border border-hair p-4">
        <div className="mb-2 text-sm font-semibold text-speculative">Don&apos;t need at this scale</div>
        <ul className="space-y-1.5 text-[13px] text-ink-soft">
          {PATH_TO_PRODUCTION.dontNeed.map((n, i) => (
            <li key={i} className="flex gap-2">
              <span className="text-speculative" aria-hidden>−</span>
              <span>{n}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function SectionTable({ table }: { table: SpecSection["table"] }) {
  switch (table) {
    case "diagram":
      return <Pre>{DIAGRAM}</Pre>;
    case "adapters":
      return <AdaptersTable />;
    case "tradeoffs":
      return <TradeoffsTable />;
    case "evals":
      return <EvalTable />;
    case "cost":
      return <CostTable />;
    case "pathToProd":
      return <PathToProd />;
    case "pseudocode":
      return <Pre>{SCHEDULER_PSEUDOCODE}</Pre>;
    default:
      return null;
  }
}

export function SpecBody() {
  return (
    <div>
      {SECTIONS.map((s) => (
        <section key={s.id} id={s.id} className="spec-section mb-8">
          <h2 className="text-lg font-semibold tracking-tight text-ink">{s.title}</h2>
          <InShort text={s.inShort} />
          {s.body.map((p, i) => (
            <p key={i} className="mt-3 text-[15px] leading-relaxed text-ink-soft">
              {p}
            </p>
          ))}
          {s.table && <SectionTable table={s.table} />}
        </section>
      ))}
    </div>
  );
}
