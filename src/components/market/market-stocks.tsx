"use client"

import * as React from "react"
import { Line, LineChart } from "recharts"
import { RefreshCwIcon, SearchIcon, TrendingDownIcon, TrendingUpIcon } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardAction, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { useMarketData } from "@/components/market/market-provider"
import { formatBRL, formatCompact, formatMarketTime, formatPercent } from "@/lib/market/format"
import { cn } from "@/lib/utils"

function Sparkline({ values, positive }: { values: number[]; positive: boolean }) {
  const data = values.length > 1 ? values : values.length === 1 ? [values[0], values[0]] : []
  if (data.length === 0) return <span className="text-xs text-muted-foreground">—</span>

  return (
    <LineChart width={88} height={28} data={data.map((value, index) => ({ index, value }))}>
      <Line
        type="monotone"
        dataKey="value"
        stroke={positive ? "var(--color-emerald-500)" : "var(--color-rose-500)"}
        strokeWidth={1.5}
        dot={false}
        isAnimationActive={false}
      />
    </LineChart>
  )
}

export function MarketStocks() {
  const { data, loading, error, refresh } = useMarketData()
  const [search, setSearch] = React.useState("")
  const [refreshing, setRefreshing] = React.useState(false)

  const stocks = React.useMemo(() => {
    const list = data?.stocks ?? []
    const term = search.trim().toLowerCase()
    if (!term) return list
    return list.filter(
      (stock) =>
        stock.symbol.toLowerCase().includes(term) ||
        stock.name.toLowerCase().includes(term)
    )
  }, [data?.stocks, search])

  function handleRefresh() {
    setRefreshing(true)
    refresh()
    window.setTimeout(() => setRefreshing(false), 900)
  }

  return (
    <Card>
      <CardHeader>
        <div>
          <CardTitle>Ações — B3</CardTitle>
          <p className="mt-1 text-xs text-muted-foreground">
            Cotações do mercado à vista, em reais.
          </p>
        </div>
        <CardAction className="flex items-center gap-2">
          <div className="relative hidden sm:block">
            <SearchIcon className="absolute left-2 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Buscar ativo..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              className="h-8 w-40 pl-7 text-xs"
            />
          </div>
          <Button
            variant="outline"
            size="sm"
            className="h-8 gap-1.5 text-xs"
            onClick={handleRefresh}
            disabled={refreshing}
          >
            <RefreshCwIcon className={cn("size-3.5", refreshing && "animate-spin")} />
            <span className="hidden sm:inline">Atualizar</span>
          </Button>
        </CardAction>
      </CardHeader>
      <CardContent className="px-0">
        {loading && !data ? (
          <div className="space-y-2 px-4">
            {Array.from({ length: 6 }).map((_, index) => (
              <Skeleton key={index} className="h-10 w-full" />
            ))}
          </div>
        ) : error && !data ? (
          <div className="flex flex-col items-center gap-3 px-4 py-10 text-center">
            <p className="text-sm font-medium">Mercado indisponível</p>
            <p className="text-xs text-muted-foreground">{error}</p>
            <Button variant="outline" size="sm" onClick={handleRefresh}>
              Tentar novamente
            </Button>
          </div>
        ) : (
          <>
            <div className="px-4 pb-3 sm:hidden">
              <div className="relative">
                <SearchIcon className="absolute left-2 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Buscar ativo..."
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  className="h-9 pl-7 text-xs"
                />
              </div>
            </div>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="pl-4">Ativo</TableHead>
                    <TableHead className="text-right">Preço</TableHead>
                    <TableHead className="text-right">Variação</TableHead>
                    <TableHead className="hidden text-right md:table-cell">Faixa do dia</TableHead>
                    <TableHead className="hidden text-right lg:table-cell">Volume</TableHead>
                    <TableHead className="hidden pr-4 text-right sm:table-cell">5 dias</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {stocks.map((stock) => {
                    const positive = stock.changePercent >= 0
                    return (
                      <TableRow key={stock.symbol}>
                        <TableCell className="pl-4">
                          <div className="flex items-center gap-2.5">
                            <Badge
                              variant="secondary"
                              className="w-16 justify-center font-mono text-[11px]"
                            >
                              {stock.symbol}
                            </Badge>
                            <span className="max-w-[160px] truncate text-sm text-muted-foreground">
                              {stock.name}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="text-right font-medium tabular-nums">
                          {formatBRL(stock.price)}
                        </TableCell>
                        <TableCell className="text-right">
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
                            {formatPercent(stock.changePercent)}
                          </span>
                        </TableCell>
                        <TableCell className="hidden text-right text-xs text-muted-foreground tabular-nums md:table-cell">
                          {formatBRL(stock.dayLow)} – {formatBRL(stock.dayHigh)}
                        </TableCell>
                        <TableCell className="hidden text-right text-xs text-muted-foreground tabular-nums lg:table-cell">
                          {formatCompact(stock.volume)}
                        </TableCell>
                        <TableCell className="hidden pr-4 text-right sm:table-cell">
                          <div className="flex justify-end">
                            <Sparkline values={stock.sparkline} positive={positive} />
                          </div>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                  {stocks.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={6} className="h-24 text-center text-sm text-muted-foreground">
                        Nenhum ativo encontrado para a busca.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </>
        )}

        <div className="flex flex-wrap items-center justify-between gap-2 px-4 pt-3 text-[11px] text-muted-foreground">
          <span>
            Fonte: brapi.dev / Yahoo Finance
            {data ? ` · atualizado às ${formatMarketTime(data.updatedAt)}` : ""}
          </span>
          <span>Não é recomendação de investimento.</span>
        </div>

        {data && data.warnings.length > 0 && (
          <div className="mx-4 mt-3 space-y-1 rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-[11px] text-amber-700 dark:text-amber-400">
            {data.warnings.map((warning) => (
              <p key={warning}>{warning}</p>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
