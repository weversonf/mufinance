import { NextResponse } from "next/server";
export async function GET() { return NextResponse.json({ ok: true, version: "86a4ef9", deploy: new Date().toISOString() }); }
