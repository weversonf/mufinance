import { NextResponse } from "next/server"

import { getMarketSnapshot } from "@/lib/market/service"

export const dynamic = "force-dynamic"

export async function GET() {
  try {
    const snapshot = await getMarketSnapshot()
    return NextResponse.json(snapshot, {
      headers: {
        "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
      },
    })
  } catch (error) {
    console.error("Falha ao carregar dados de mercado", error)
    return NextResponse.json(
      { error: "Não foi possível carregar os dados de mercado." },
      { status: 502 }
    )
  }
}
