"use client"

import * as React from "react"
import { RefreshCwIcon } from "lucide-react"

import { TopCoins } from "@/components/crypto/top-coins"
import { CoinInsight } from "@/components/crypto/coin-insight"
import { MarketOverview } from "@/components/crypto/market-overview"
import { CryptoWalletCard } from "@/components/crypto/crypto-wallet-card"
import { useMarketData } from "@/components/market/market-provider"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import type { CryptoCoin } from "@/data/seed"

export type CryptoPrices = Record<string, number>

export function CryptoPageClient() {
  const { data, loading, error, refresh } = useMarketData()
  const [selectedCoin, setSelectedCoin] = React.useState<string | null>(null)

  const coins = React.useMemo<CryptoCoin[]>(
    () =>
      (data?.crypto ?? []).map((coin) => ({
        id: coin.id,
        symbol: coin.symbol,
        name: coin.name,
        logo: coin.image,
        price: coin.price,
        change24h: coin.change24h,
        change7d: coin.change7d,
        marketCap: coin.marketCap,
        volume24h: coin.volume24h,
        holdings: 0,
        sparklineData: coin.sparkline,
      })),
    [data?.crypto]
  )

  const prices = React.useMemo<CryptoPrices>(
    () => Object.fromEntries(coins.map((coin) => [coin.id, coin.price])),
    [coins]
  )

  const activeCoin =
    selectedCoin && coins.some((coin) => coin.id === selectedCoin)
      ? selectedCoin
      : coins[0]?.id ?? ""

  if (loading && !data) {
    return (
      <div className="grid gap-4 px-4 pb-6 lg:grid-cols-12">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 lg:col-span-8">
          {Array.from({ length: 3 }).map((_, index) => (
            <Skeleton key={index} className="h-32 w-full" />
          ))}
        </div>
        <Skeleton className="h-32 w-full lg:col-span-4" />
        <Skeleton className="h-96 w-full lg:col-span-12" />
        <Skeleton className="h-80 w-full lg:col-span-12" />
      </div>
    )
  }

  if (error && !data) {
    return (
      <div className="flex flex-1 items-center justify-center p-8">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Mercado indisponível</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Não foi possível carregar as cotações de criptomoedas agora.
            </p>
            <Button variant="outline" className="gap-1.5" onClick={refresh}>
              <RefreshCwIcon className="size-3.5" />
              Tentar novamente
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="grid gap-4 px-4 pb-6 lg:grid-cols-12">
      <TopCoins
        coins={coins}
        prices={prices}
        selectedCoin={activeCoin}
        onSelectCoin={setSelectedCoin}
      />

      <CryptoWalletCard />

      <CoinInsight coins={coins} prices={prices} selectedCoin={activeCoin} />

      <MarketOverview
        coins={coins}
        prices={prices}
        selectedCoin={activeCoin}
        onSelectCoin={setSelectedCoin}
      />
    </div>
  )
}
