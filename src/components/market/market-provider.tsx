"use client"

import * as React from "react"

import type { MarketSnapshot } from "@/lib/market/types"

type MarketContextValue = {
  data: MarketSnapshot | null
  loading: boolean
  error: string | null
  refresh: () => void
}

const MarketContext = React.createContext<MarketContextValue | null>(null)

const REFRESH_INTERVAL_MS = 60_000

export function MarketProvider({ children }: { children: React.ReactNode }) {
  const [data, setData] = React.useState<MarketSnapshot | null>(null)
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)
  const [refreshToken, setRefreshToken] = React.useState(0)

  const refresh = React.useCallback(() => {
    setRefreshToken((current) => current + 1)
  }, [])

  React.useEffect(() => {
    let cancelled = false
    const controller = new AbortController()

    async function load() {
      try {
        const response = await fetch("/api/market", {
          signal: controller.signal,
          cache: "no-store",
        })
        if (!response.ok) throw new Error(`Status ${response.status}`)
        const snapshot = (await response.json()) as MarketSnapshot
        if (cancelled) return
        setData(snapshot)
        setError(null)
      } catch (loadError) {
        if (cancelled) return
        if (loadError instanceof DOMException && loadError.name === "AbortError") return
        setError("Não foi possível carregar os dados de mercado.")
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    load()
    const interval = window.setInterval(load, REFRESH_INTERVAL_MS)

    return () => {
      cancelled = true
      controller.abort()
      window.clearInterval(interval)
    }
  }, [refreshToken])

  const value = React.useMemo<MarketContextValue>(
    () => ({ data, loading, error, refresh }),
    [data, loading, error, refresh]
  )

  return <MarketContext.Provider value={value}>{children}</MarketContext.Provider>
}

export function useMarketData() {
  const context = React.useContext(MarketContext)
  if (!context) {
    throw new Error("useMarketData precisa estar dentro de MarketProvider")
  }
  return context
}
