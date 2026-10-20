"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Logo } from "@/components/Logo";

export default function LoginPage() {
  const router = useRouter();
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setPending(true);
    setError(null);
    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
      });
      if (res.ok) {
        router.replace("/");
        router.refresh();
        return;
      }
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      setError(data.error ?? "Something went wrong. Please try again.");
    } catch {
      setError("Couldn't reach the server. Please try again.");
    } finally {
      setPending(false);
    }
  }

  return (
    <main className="flex min-h-dvh items-center justify-center px-6">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <div className="flex items-center justify-center gap-2 text-lg font-semibold tracking-tight text-ink">
            <Logo size={24} />
            Ready<span className="text-accent">Room</span>
          </div>
          <p className="mt-2 text-sm text-ink-soft">
            Access-controlled portfolio demo of a GTM meeting-prep agent.
          </p>
        </div>

        <form onSubmit={onSubmit} className="rounded-xl border border-hair bg-surface p-6 shadow-sm">
          <label htmlFor="code" className="block text-sm font-medium text-ink">
            Access code
          </label>
          <input
            id="code"
            type="password"
            autoFocus
            autoComplete="off"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            className="mt-2 w-full rounded-lg border border-hair bg-canvas px-3 py-2 text-ink outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/20"
            placeholder="Enter access code"
          />

          {error && (
            <p role="alert" className="mt-3 text-sm text-red-700">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={pending || code.length === 0}
            className="mt-5 w-full rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white transition hover:bg-accent-strong disabled:cursor-not-allowed disabled:opacity-50"
          >
            {pending ? "Checking…" : "Enter"}
          </button>
        </form>

        <p className="mt-6 text-center text-xs text-ink-soft">
          Portfolio project — all data
          fictional.
        </p>
      </div>
    </main>
  );
}
