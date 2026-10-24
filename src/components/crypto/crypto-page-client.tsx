"use client"

import * as React from "react"
import { MyBalance } from "@/components/crypto/my-balance"
import { TopCoins } from "@/components/crypto/top-coins"
import { MyPortfolio } from "@/components/crypto/my-portfolio"
import { CoinInsight } from "@/components/crypto/coin-insight"
import { TradeForm } from "@/components/crypto/trade-form"
import { MarketOverview } from "@/components/crypto/market-overview"
import { useFinanceData } from "@/components/finance/finance-provider"

export type CryptoPrices = Record<string, number>

export function CryptoPageClient() {
  const { cryptoCoins } = useFinanceData()
  const [selectedCoin, setSelectedCoin] = React.useState("btc")

  // Build initial prices from seed data
  const [prices, setPrices] = React.useState<CryptoPrices>(() => {
    const initial: CryptoPrices = {}
    for (const coin of cryptoCoins) {
      initial[coin.id] = coin.price
    }
    return initial
  })

  React.useEffect(() => {
    setPrices((prev) => {
      if (cryptoCoins.length === 0) return {}
      const next: CryptoPrices = {}
      for (const coin of cryptoCoins) next[coin.id] = prev[coin.id] ?? coin.price
      return next
    })
  }, [cryptoCoins])

  // Store original prices for 24h change calculation
  const originalPrices = React.useMemo(() => {
    const orig: CryptoPrices = {}
    for (const coin of cryptoCoins) {
      orig[coin.id] = coin.price
    }
    return orig
  }, [cryptoCoins])

  // Simulate live price drift every 3 seconds
  React.useEffect(() => {
    if (Object.keys(prices).length === 0) return
    const interval = setInterval(() => {
      setPrices((prev) => {
        const next = { ...prev }
        for (const id of Object.keys(next)) {
          // Drift +/- 0.3%
          const drift = 1 + (Math.random() - 0.5) * 0.006
          next[id] = Math.round(next[id] * drift * 100) / 100
        }
        return next
      })
    }, 3000)
    return () => clearInterval(interval)
  }, [prices])

  if (cryptoCoins.length === 0) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center p-8 text-center">
        <div className="max-w-md space-y-3 rounded-2xl border bg-card p-8 shadow-sm">
          <h2 className="text-lg font-semibold">Criptomoedas</h2>
          <p className="text-sm text-muted-foreground">
            Nenhuma carteira de criptomoedas vinculada no momento.
          </p>
          <p className="text-xs text-muted-foreground">
            Quando você vincular uma conta do tipo Cripto em Contas, seus saldos e negociações aparecerão aqui.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="grid gap-4 px-4 pb-6 lg:grid-cols-12">
      {/* Row 1 */}
      <MyBalance prices={prices} />
      <TopCoins
        prices={prices}
        originalPrices={originalPrices}
        selectedCoin={selectedCoin}
        onSelectCoin={setSelectedCoin}
      />

      {/* Row 2 */}
      <MyPortfolio
        prices={prices}
        originalPrices={originalPrices}
        selectedCoin={selectedCoin}
        onSelectCoin={setSelectedCoin}
      />
      <CoinInsight
        prices={prices}
        selectedCoin={selectedCoin}
      />

      {/* Row 3 */}
      <TradeForm prices={prices} />
      <MarketOverview
        prices={prices}
        originalPrices={originalPrices}
        selectedCoin={selectedCoin}
        onSelectCoin={setSelectedCoin}
      />
    </div>
  )
}
