// Tiny in-memory KV — rate-limit counters (Phase 3) + 👍/👎 votes (Phase 4).
//
// Per-process and non-durable: a serverless cold start or a second instance
// starts empty. That's acceptable for this demo's scale and is called out in
// the spec — production swaps this for Vercel KV / Redis behind the same tiny
// interface. Entries expire lazily on read; no background sweeper needed.

type Entry = { value: number; expiresAt: number | null };

const store = new Map<string, Entry>();

function live(key: string): Entry | undefined {
  const entry = store.get(key);
  if (!entry) return undefined;
  if (entry.expiresAt !== null && entry.expiresAt <= Date.now()) {
    store.delete(key);
    return undefined;
  }
  return entry;
}

/** Increment a counter, returning the new value. First write sets the TTL. */
export function incr(key: string, ttlMs?: number): number {
  const existing = live(key);
  if (existing) {
    existing.value += 1;
    return existing.value;
  }
  const expiresAt = ttlMs ? Date.now() + ttlMs : null;
  store.set(key, { value: 1, expiresAt });
  return 1;
}

/** Read a counter's current value (0 if unset or expired). */
export function get(key: string): number {
  return live(key)?.value ?? 0;
}

/** Set a counter to an explicit value (used for vote tallies). */
export function set(key: string, value: number, ttlMs?: number): void {
  store.set(key, { value, expiresAt: ttlMs ? Date.now() + ttlMs : null });
}
