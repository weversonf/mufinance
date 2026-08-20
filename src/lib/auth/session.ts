import "server-only";

import { cookies } from "next/headers";
import { getAdminAuth } from "../firebase/admin";

export const SESSION_COOKIE = "mufinance_session";
const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 5;

export async function readSessionCookie() {
  const cookieStore = await cookies();
  return cookieStore.get(SESSION_COOKIE)?.value ?? null;
}

export async function getSessionUser() {
  const sessionCookie = await readSessionCookie();
  if (!sessionCookie) return null;

  try {
    return await getAdminAuth().verifySessionCookie(sessionCookie, true);
  } catch {
    return null;
  }
}

export async function requireSessionUser() {
  const user = await getSessionUser();
  if (!user) throw new Error("Não autenticado.");
  return user;
}

export function sessionCookieOptions() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge: SESSION_MAX_AGE_SECONDS,
  };
}

export function expiredSessionCookieOptions() {
  return { ...sessionCookieOptions(), maxAge: 0 };
}
