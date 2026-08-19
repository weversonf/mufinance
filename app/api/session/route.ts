import { NextResponse } from "next/server";
import { getAdminAuth } from "../../../lib/firebase/admin";
import { expiredSessionCookieOptions, SESSION_COOKIE, sessionCookieOptions } from "../../../lib/auth/session";

export async function POST(request: Request) {
  try {
    const body = await request.json() as { idToken?: string };
    if (!body.idToken) return NextResponse.json({ error: "ID token ausente." }, { status: 400 });

    const decoded = await getAdminAuth().verifyIdToken(body.idToken);
    const sessionCookie = await getAdminAuth().createSessionCookie(body.idToken, { expiresIn: sessionCookieOptions().maxAge * 1000 });
    const response = NextResponse.json({ ok: true, uid: decoded.uid });
    response.cookies.set(SESSION_COOKIE, sessionCookie, sessionCookieOptions());
    return response;
  } catch (error) {
    console.error("Falha ao criar sessão do MuFinance", error);
    return NextResponse.json({ error: "Não foi possível criar a sessão." }, { status: 401 });
  }
}

export async function DELETE() {
  const response = NextResponse.json({ ok: true });
  response.cookies.set(SESSION_COOKIE, "", expiredSessionCookieOptions());
  return response;
}
