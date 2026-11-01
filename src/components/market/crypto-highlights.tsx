"use client"

import * as React from "react"
import Image from "next/image"
import Link from "next/link"
import { ArrowRightIcon, TrendingDownIcon, TrendingUpIcon } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardAction, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { useMarketData } from "@/components/market/market-provider"
import { formatBRL, formatPercent } from "@/lib/market/format"
import { cn } from "@/lib/utils"

export function CryptoHighlights() {
  const { data, loading, error } = useMarketData()
  const coins = (data?.crypto ?? []).slice(0, 4)

  return (
    <Card className="h-full">
      <CardHeader>
        <div>
          <CardTitle>Criptomoedas</CardTitle>
          <p className="mt-1 text-xs text-muted-foreground">Destaques em reais nas últimas 24 horas.</p>
        </div>
        <CardAction>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 gap-1 text-xs"
            render={<Link href="/crypto" />}
          >
            Ver mercado
            <ArrowRightIcon className="size-3.5" />
          </Button>
        </CardAction>
      </CardHeader>
      <CardContent className="space-y-1">
        {loading && !data ? (
          <div className="space-y-2">
            {Array.from({ length: 4 }).map((_, index) => (
              <Skeleton key={index} className="h-12 w-full" />
            ))}
          </div>
        ) : error && !data ? (
          <p className="py-8 text-center text-sm text-muted-foreground">
            Cotações de cripto indisponíveis agora.
          </p>
        ) : (
          coins.map((coin) => {
            const positive = coin.change24h >= 0
            return (
              <Link
                key={coin.id}
                href="/crypto"
                className="flex items-center gap-3 rounded-lg px-1 py-2 transition-colors hover:bg-muted/60"
              >
                {coin.image ? (
                  <Image
                    src={coin.image}
                    alt={coin.name}
                    width={32}
                    height={32}
                    className="size-8 rounded-full"
                  />
                ) : (
                  <div className="flex size-8 items-center justify-center rounded-full bg-muted text-[10px] font-semibold">
                    {coin.symbol.slice(0, 3)}
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium leading-tight">{coin.name}</p>
                  <p className="text-xs text-muted-foreground">{coin.symbol}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold tabular-nums">{formatBRL(coin.price)}</p>
                  <span
                    className={cn(
                      "inline-flex items-center gap-0.5 text-xs font-medium tabular-nums",
                      positive
                        ? "text-emerald-600 dark:text-emerald-400"
                        : "text-rose-600 dark:text-rose-400"
                    )}
                  >
                    {positive ? (
                      <TrendingUpIcon className="size-3" />
                    ) : (
                      <TrendingDownIcon className="size-3" />
                    )}
                    {formatPercent(coin.change24h)}
                  </span>
                </div>
              </Link>
            )
          })
        )}

        {data && (
          <div className="flex items-center justify-between pt-2 text-[11px] text-muted-foreground">
            <span>Fonte: CoinGecko · BRL</span>
            <Badge variant="outline" className="text-[10px]">
              {data.crypto.length} moedas
            </Badge>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
