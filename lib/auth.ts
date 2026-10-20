// Demo access gate — a signed, HttpOnly session cookie.
//
// There is no per-user identity in this demo, so the cookie carries no
// payload of its own: it stores an HMAC-SHA256 of a fixed string keyed by the
// shared access code. Possession of a valid signature = authenticated. The
// signing uses Web Crypto (crypto.subtle) so the SAME helper runs unchanged in
// both the Edge middleware and the Node route handler.
//
// Production note (see spec / "Path to production"): this stands in for Okta
// SSO. A shared-password gate is deliberate demo scope, not a scaling design.

export const SESSION_COOKIE = "readyroom_session";

// Fixed message that gets signed. The secret (access code) is what actually
// gates entry; the message just needs to be stable across sign/verify.
const SESSION_PAYLOAD = "readyroom-authenticated";

async function hmacHex(payload: string, secret: string): Promise<string> {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    enc.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const sig = await crypto.subtle.sign("HMAC", key, enc.encode(payload));
  return Array.from(new Uint8Array(sig))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

/** Mint the cookie value to set after a correct access code. */
export function createSessionToken(secret: string): Promise<string> {
  return hmacHex(SESSION_PAYLOAD, secret);
}

/** Verify a cookie value against the configured access code (constant-time). */
export async function verifySessionToken(
  token: string,
  secret: string,
): Promise<boolean> {
  const expected = await hmacHex(SESSION_PAYLOAD, secret);
  return timingSafeEqualHex(token, expected);
}

// Constant-time comparison so a mismatch's timing can't leak the signature.
function timingSafeEqualHex(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) {
    diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return diff === 0;
}
