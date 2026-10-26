import { NextResponse } from "next/server";
import { getAdminAuth, isFirebaseAdminConfigured } from "@/lib/firebase/admin";
import { expiredSessionCookieOptions, SESSION_COOKIE, sessionCookieOptions } from "@/lib/auth/session";

export async function POST(request: Request) {
  try {
    const body = await request.json() as { idToken?: string };
    if (!body.idToken) return NextResponse.json({ error: "ID token ausente." }, { status: 400 });

    if (!isFirebaseAdminConfigured()) {
      return NextResponse.json({ ok: false, message: "Firebase Admin não configurado em ambiente local." }, { status: 200 });
    }

    const decoded = await getAdminAuth().verifyIdToken(body.idToken);
    const sessionCookie = await getAdminAuth().createSessionCookie(body.idToken, { expiresIn: sessionCookieOptions().maxAge * 1000 });
    const response = NextResponse.json({ ok: true, uid: decoded.uid });
    response.cookies.set(SESSION_COOKIE, sessionCookie, sessionCookieOptions());
    return response;
  } catch (error) {
    console.error("Falha ao criar sessão do MuFinance", error);
    return NextResponse.json(
      { error: "Não foi possível validar a sessão do Firebase. Verifique a configuração Firebase Admin da Vercel." },
      { status: 401 },
    );
  }
}

export async function DELETE() {
  const response = NextResponse.json({ ok: true });
  response.cookies.set(SESSION_COOKIE, "", expiredSessionCookieOptions());
  return response;
}
