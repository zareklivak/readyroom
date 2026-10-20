import Link from "next/link";
import { Logo } from "@/components/Logo";

// Shell for every gated page: slim top nav + footer, wrapped around a single
// ~720px reading spine. The login page lives OUTSIDE this group so
// it renders on the bare root layout with no nav.
export default function AppLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex min-h-dvh flex-col">
      <header className="border-b border-hair">
        <nav className="mx-auto flex h-14 max-w-[720px] items-center justify-between px-6">
          <Link
            href="/"
            className="flex items-center gap-2 text-base font-semibold tracking-tight text-ink"
          >
            <Logo size={22} />
            Ready<span className="text-accent">Room</span>
          </Link>
          <div className="flex items-center gap-6 text-sm">
            <Link href="/" className="text-ink-soft transition hover:text-ink">
              Today
            </Link>
            <Link
              href="/architecture"
              className="text-ink-soft transition hover:text-ink"
            >
              Architecture
            </Link>
          </div>
        </nav>
      </header>

      <main className="mx-auto w-full max-w-[720px] flex-1 px-6 py-10">
        {children}
      </main>

      <footer className="border-t border-hair">
        <div className="mx-auto max-w-[720px] px-6 py-6 text-xs text-ink-soft">
          Portfolio project — all data
          fictional.
        </div>
      </footer>
    </div>
  );
}
