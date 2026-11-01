"use client"

import * as React from "react"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Cell,
  CartesianGrid,
  ReferenceLine,
} from "recharts"
import { RefreshCwIcon, TrendingDownIcon, TrendingUpIcon } from "lucide-react"
import { motion, AnimatePresence } from "motion/react"

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardAction,
} from "@/components/ui/card"
import {
  ChartContainer,
  ChartTooltip,
  type ChartConfig,
} from "@/components/ui/chart"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"
import type { CryptoCoin } from "@/data/seed"
import type { MarketCandle } from "@/lib/market/types"
import type { CryptoPrices } from "./crypto-page-client"

interface CandlestickData {
  date: string
  openClose: [number, number]
  high: number
  low: number
}

interface CandlestickProps {
  x: number
  y: number
  width: number
  height: number
  low: number
  high: number
  openClose: [number, number]
}

function CandlestickShape(props: CandlestickProps) {
  const { x, y, width, height, low, high, openClose: [open, close] } = props
  const isGrowing = open < close
  const body = Math.abs(open - close)
  const ratio = body > 0 ? Math.abs(height / body) : 0

  return (
    <g>
      <path
        className={isGrowing ? "fill-emerald-500" : "fill-rose-500"}
        d={`M ${x},${y} L ${x},${y + height} L ${x + width},${y + height} L ${x + width},${y} Z`}
      />
      <g className={isGrowing ? "stroke-emerald-500" : "stroke-rose-500"} strokeWidth="1">
        {isGrowing ? (
          <>
            <path d={`M ${x + width / 2},${y + height} v ${(open - low) * ratio}`} />
            <path d={`M ${x + width / 2},${y} v ${(close - high) * ratio}`} />
          </>
        ) : (
          <>
            <path d={`M ${x + width / 2},${y} v ${(close - low) * ratio}`} />
            <path d={`M ${x + width / 2},${y + height} v ${(open - high) * ratio}`} />
          </>
        )}
      </g>
    </g>
  )
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function renderCandlestick(props: any) {
  const { x, y, width, height, payload } = props as {
    x: number; y: number; width: number; height: number
    payload?: CandlestickData
  }
  if (payload?.openClose) {
    return (
      <CandlestickShape
        x={x} y={y} width={width} height={height}
        low={payload.low} high={payload.high} openClose={payload.openClose}
      />
    )
  }
  return <CandlestickShape x={0} y={0} width={0} height={0} low={0} high={0} openClose={[0, 0]} />
}

function CandlestickTooltip({
  active,
  payload,
  intraday,
}: {
  active?: boolean
  payload?: Array<{ payload?: CandlestickData }>
  intraday?: boolean
}) {
  if (!active || !payload?.length) return null
  const d = payload[0]?.payload
  if (!d) return null
  const [open, close] = d.openClose
  const isGrowing = close > open
  const date = new Date(d.date)

  return (
    <div className="rounded-lg border bg-popover px-3 py-2 text-xs text-popover-foreground shadow-md">
      <p className="mb-1 font-medium">
        {date.toLocaleDateString("pt-BR", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
          ...(intraday ? { hour: "2-digit", minute: "2-digit" } : {}),
        })}
      </p>
      <div className="grid grid-cols-2 gap-x-4 gap-y-0.5 text-muted-foreground">
        <span>Abertura</span><span className="text-right font-medium text-foreground tabular-nums">{open.toLocaleString("pt-BR")}</span>
        <span>Máxima</span><span className="text-right font-medium text-foreground tabular-nums">{d.high.toLocaleString("pt-BR")}</span>
        <span>Mínima</span><span className="text-right font-medium text-foreground tabular-nums">{d.low.toLocaleString("pt-BR")}</span>
        <span>Fechamento</span>
        <span className={cn("text-right font-medium tabular-nums", isGrowing ? "text-emerald-500" : "text-rose-500")}>
          {close.toLocaleString("pt-BR")}
        </span>
      </div>
    </div>
  )
}

const chartConfig = {
  openClose: { label: "Preço", color: "var(--chart-1)" },
} satisfies ChartConfig

const PERIODS = [
  { label: "1D", days: 1 },
  { label: "1S", days: 7 },
  { label: "1M", days: 30 },
  { label: "3M", days: 90 },
  { label: "1A", days: 365 },
] as const

interface CoinInsightProps {
  coins: CryptoCoin[]
  prices: CryptoPrices
  selectedCoin: string
}

export function CoinInsight({ coins, prices, selectedCoin }: CoinInsightProps) {
  const [period, setPeriod] = React.useState<(typeof PERIODS)[number]["label"]>("3M")
  const [candles, setCandles] = React.useState<MarketCandle[]>([])
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)
  const [retryToken, setRetryToken] = React.useState(0)

  const coin = coins.find((c) => c.id === selectedCoin)
  const livePrice = prices[selectedCoin] ?? coin?.price ?? 0
  const days = PERIODS.find((item) => item.label === period)?.days ?? 90
  const intraday = days <= 1

  React.useEffect(() => {
    if (!selectedCoin) return
    const controller = new AbortController()
    setLoading(true)
    setError(null)

    fetch(`/api/market/crypto/${selectedCoin}/ohlc?days=${days}`, {
      signal: controller.signal,
      cache: "no-store",
    })
      .then((response) => {
        if (!response.ok) throw new Error(`Status ${response.status}`)
        return response.json() as Promise<{ candles: MarketCandle[] }>
      })
      .then((payload) => {
        setCandles(Array.isArray(payload.candles) ? payload.candles : [])
      })
      .catch((loadError) => {
        if (loadError instanceof DOMException && loadError.name === "AbortError") return
        setError("Não foi possível carregar o histórico desta moeda.")
        setCandles([])
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false)
      })

    return () => controller.abort()
  }, [selectedCoin, days, retryToken])

  const data = React.useMemo<CandlestickData[]>(
    () =>
      candles.map((candle) => ({
        date: new Date(candle.t).toISOString(),
        openClose: [candle.o, candle.c] as [number, number],
        high: candle.h,
        low: candle.l,
      })),
    [candles]
  )

  const minVal = data.length > 0 ? data.reduce((min, item) => Math.min(min, item.low, ...item.openClose), Infinity) : 0
  const maxVal = data.length > 0 ? data.reduce((max, item) => Math.max(max, item.high, ...item.openClose), -Infinity) : 0
  const pad = (maxVal - minVal) * 0.1 || maxVal * 0.02

  const lastCandle = data[data.length - 1]
  const lastClose = lastCandle?.openClose[1]
  const lastIsGrowing = lastCandle ? lastCandle.openClose[1] > lastCandle.openClose[0] : true

  const formatTick = (value: string, index: number) => {
    const date = new Date(value)
    if (intraday) {
      return date.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })
    }
    if (days <= 7) {
      return date.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" })
    }
    if (index === 0) return date.toLocaleDateString("pt-BR", { month: "short", year: "2-digit" })
    const previous = data[index - 1]
    if (previous && new Date(previous.date).getMonth() !== date.getMonth()) {
      return date.toLocaleDateString("pt-BR", { month: "short", year: "2-digit" })
    }
    return ""
  }

  return (
    <Card className="lg:col-span-12">
      <CardHeader>
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          <CardTitle>{coin?.name ?? "Criptomoeda"}</CardTitle>
          <span className={cn(
            "rounded px-2 py-0.5 text-sm font-bold tabular-nums",
            lastIsGrowing ? "text-emerald-500" : "text-rose-500"
          )}>
            {livePrice.toLocaleString("pt-BR", {
              style: "currency",
              currency: "BRL",
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </span>
          {coin && (
            <span
              className={cn(
                "inline-flex items-center gap-0.5 rounded-md px-1.5 py-0.5 text-xs font-medium tabular-nums",
                coin.change24h >= 0
                  ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                  : "bg-rose-500/10 text-rose-600 dark:text-rose-400"
              )}
            >
              {coin.change24h >= 0 ? (
                <TrendingUpIcon className="size-3" />
              ) : (
                <TrendingDownIcon className="size-3" />
              )}
              {coin.change24h >= 0 ? "+" : ""}
              {coin.change24h.toFixed(2)}% · 24h
            </span>
          )}
        </div>
        <CardAction>
          <Button
            variant="ghost"
            size="sm"
            className="gap-1 text-xs text-muted-foreground"
            onClick={() => setRetryToken((token) => token + 1)}
            disabled={loading}
          >
            <RefreshCwIcon className={cn("size-3", loading && "animate-spin")} />
            Atualizar
          </Button>
        </CardAction>
      </CardHeader>
      <CardContent className="min-w-0 space-y-4">
        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <span className="inline-block size-2.5 rounded-sm bg-emerald-500" /> Alta
          </span>
          <span className="flex items-center gap-1.5">
            <span className="inline-block size-2.5 rounded-sm bg-rose-500" /> Baixa
          </span>
          <span className="ml-auto hidden sm:inline">Candles reais · BRL</span>
        </div>

        {loading ? (
          <Skeleton className="h-[340px] w-full" />
        ) : error ? (
          <div className="flex h-[340px] flex-col items-center justify-center gap-3 text-center">
            <p className="text-sm text-muted-foreground">{error}</p>
            <Button variant="outline" size="sm" onClick={() => setRetryToken((token) => token + 1)}>
              Tentar novamente
            </Button>
          </div>
        ) : data.length === 0 ? (
          <div className="flex h-[340px] items-center justify-center text-sm text-muted-foreground">
            Sem histórico disponível para este período.
          </div>
        ) : (
          <AnimatePresence mode="wait">
            <motion.div
              key={`${selectedCoin}-${period}`}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25 }}
            >
              <ChartContainer
                config={chartConfig}
                className="aspect-auto h-[340px] w-full [&_.recharts-rectangle.recharts-tooltip-cursor]:fill-zinc-950/5 dark:[&_.recharts-rectangle.recharts-tooltip-cursor]:fill-zinc-950/25 [&_.recharts-cartesian-grid_line[stroke='#ccc']]:stroke-border/64 [&_.recharts-cartesian-axis-line]:stroke-border/64 [&_.recharts-cartesian-axis-tick_text]:fill-muted-foreground/72 dark:[&_.recharts-cartesian-axis-tick_text]:fill-muted-foreground/64"
              >
                <BarChart data={data} maxBarSize={20} margin={{ left: 20, right: -5 }}>
                  <CartesianGrid vertical={false} strokeWidth={1} />
                  <XAxis
                    dataKey="date"
                    tickLine={false}
                    tickFormatter={formatTick}
                    interval={0}
                    minTickGap={5}
                    tickMargin={12}
                  />
                  <YAxis
                    domain={[minVal - pad, maxVal + pad]}
                    tickCount={7}
                    tickLine={false}
                    orientation="right"
                    tickFormatter={(value: number) =>
                      value >= 1000 ? `${(value / 1000).toFixed(1)}k` : value >= 1 ? value.toFixed(2) : value.toFixed(4)
                    }
                  />
                  {lastClose != null && (
                    <ReferenceLine
                      y={lastClose}
                      stroke="var(--muted-foreground)"
                      opacity={0.5}
                      strokeWidth={1}
                      strokeDasharray="2 2"
                      label={({ viewBox }: { viewBox: { x: number; y: number; width: number } }) => (
                        <g transform={`translate(${viewBox.x + viewBox.width + 5},${viewBox.y})`}>
                          <rect x={-2} y={-10} width={50} height={20}
                            fill={lastIsGrowing ? "var(--color-emerald-500)" : "var(--color-rose-500)"}
                            rx={4}
                          />
                          <text x={2} y={4} fill="#fff" fontSize={10} fontWeight="500" textAnchor="start" className="tabular-nums">
                            {lastClose >= 1000 ? `${(lastClose / 1000).toFixed(1)}k` : lastClose.toFixed(2)}
                          </text>
                        </g>
                      )}
                    />
                  )}
                  <ChartTooltip content={<CandlestickTooltip intraday={intraday} />} />
                  <Bar dataKey="openClose" shape={renderCandlestick}>
                    {data.map((item) => (
                      <Cell key={item.date} />
                    ))}
                  </Bar>
                </BarChart>
              </ChartContainer>
            </motion.div>
          </AnimatePresence>
        )}

        <div className="flex flex-wrap items-center gap-1">
          {PERIODS.map((item) => (
            <button
              key={item.label}
              onClick={() => setPeriod(item.label)}
              className={cn(
                "rounded-md px-3 py-1 text-xs font-medium tabular-nums transition-colors",
                item.label === period
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              {item.label}
            </button>
          ))}
          <span className="ml-auto text-[11px] text-muted-foreground">Fonte: CoinGecko</span>
        </div>
      </CardContent>
    </Card>
  )
}
