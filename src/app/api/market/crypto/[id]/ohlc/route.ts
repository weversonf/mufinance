import { NextResponse } from "next/server"

import { getCryptoOhlc } from "@/lib/market/service"

export const dynamic = "force-dynamic"

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const daysParam = new URL(request.url).searchParams.get("days") ?? "90"
  const days = Number(daysParam)

  try {
    const candles = await getCryptoOhlc(id, days)
    return NextResponse.json({ candles }, {
      headers: {
        "Cache-Control": "public, s-maxage=300, stale-while-revalidate=900",
      },
    })
  } catch (error) {
    console.error(`Falha ao carregar histórico de ${id}`, error)
    return NextResponse.json(
      { error: "Não foi possível carregar o histórico da moeda." },
      { status: 502 }
    )
  }
}
