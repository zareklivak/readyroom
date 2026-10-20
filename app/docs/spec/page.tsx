// Print-to-PDF rendering of the technical spec (attached to the submission). Same
// content as the in-app Architecture page and the README — one source
// (lib/spec-content.ts), three renderings. Outside the app layout, so it prints
// clean (no nav/footer).

import Link from "next/link";
import { SpecBody } from "@/components/spec/SpecBody";
import { PrintButton } from "@/components/spec/PrintButton";
import { Logo } from "@/components/Logo";

export const metadata = {
  title: "ReadyRoom — Technical Spec",
};

export default function SpecDocPage() {
  return (
    <main className="print-doc">
      <div className="no-print mb-6 flex items-center justify-between">
        <Link href="/architecture" className="text-sm text-accent underline">
          ← Architecture
        </Link>
        <PrintButton />
      </div>

      <header className="mb-6 border-b border-hair pb-4">
        <h1 className="flex items-center gap-2 text-2xl font-semibold tracking-tight text-ink">
          <Logo size={26} />
          Ready<span className="text-accent">Room</span> — Technical Spec
        </h1>
        <p className="mt-1 text-sm text-ink-soft">
          A meeting-prep agent that turns ~45 minutes of discovery-call prep into a
          ~5-minute read. All data fictional.
        </p>
      </header>

      <SpecBody />

      <footer className="mt-8 border-t border-hair pt-4 text-xs text-ink-soft">
        Portfolio project — all data, people and companies are fictional.
      </footer>
    </main>
  );
}
