import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE, createSessionToken } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const secret = process.env.READYROOM_ACCESS_CODE;
  if (!secret) {
    return NextResponse.json(
      { error: "Access gate is not configured on the server." },
      { status: 500 },
    );
  }

  let code = "";
  try {
    const body = (await req.json()) as { code?: unknown };
    code = typeof body.code === "string" ? body.code : "";
  } catch {
    return NextResponse.json({ error: "Malformed request." }, { status: 400 });
  }

  if (code !== secret) {
    return NextResponse.json(
      { error: "That access code didn't match. Please try again." },
      { status: 401 },
    );
  }

  const res = NextResponse.json({ ok: true });
  res.cookies.set(SESSION_COOKIE, await createSessionToken(secret), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 7, // 7 days
  });
  return res;
}
