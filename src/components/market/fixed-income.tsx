"use client"

import * as React from "react"
import { LandmarkIcon, PercentIcon, ShieldCheckIcon, TrendingUpIcon } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Card, CardAction, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
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
import { formatReferenceDate } from "@/lib/market/format"
import { cn } from "@/lib/utils"

const RATE_ICONS = {
  selic: LandmarkIcon,
  cdi: PercentIcon,
  ipca: TrendingUpIcon,
} as const

export function FixedIncome() {
  const { data, loading, error } = useMarketData()

  return (
    <Card className="h-full">
      <CardHeader>
        <div>
          <CardTitle>Renda fixa</CardTitle>
          <p className="mt-1 text-xs text-muted-foreground">
            Indicadores e referências para comparar produtos.
          </p>
        </div>
        <CardAction>
          <Badge variant="outline" className="gap-1 text-[11px]">
            <ShieldCheckIcon className="size-3" />
            Banco Central
          </Badge>
        </CardAction>
      </CardHeader>
      <CardContent className="space-y-4">
        {loading && !data ? (
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
            {Array.from({ length: 3 }).map((_, index) => (
              <Skeleton key={index} className="h-20 w-full" />
            ))}
          </div>
        ) : error && !data ? (
          <p className="py-8 text-center text-sm text-muted-foreground">
            Indicadores indisponíveis agora.
          </p>
        ) : (
          <>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
              {(data?.rates ?? []).map((rate) => {
                const Icon = RATE_ICONS[rate.id as keyof typeof RATE_ICONS] ?? PercentIcon
                return (
                  <div key={rate.id} className="rounded-xl border bg-muted/30 p-3">
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <Icon className="size-3.5" />
                      {rate.name}
                    </div>
                    <p className="mt-1 text-xl font-bold tabular-nums">
                      {rate.value.toLocaleString("pt-BR", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                      <span className="ml-1 text-xs font-medium text-muted-foreground">{rate.unit}</span>
                    </p>
                    <p className="mt-0.5 text-[11px] text-muted-foreground">
                      Ref. {formatReferenceDate(rate.referenceDate)}
                    </p>
                  </div>
                )
              })}
            </div>

            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="pl-0">Produto</TableHead>
                    <TableHead className="text-right">Rentabilidade estimada</TableHead>
                    <TableHead className="hidden text-right sm:table-cell">Liquidez</TableHead>
                    <TableHead className="hidden pr-0 text-right md:table-cell">Risco</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(data?.fixedIncome ?? []).map((product) => (
                    <TableRow key={product.id}>
                      <TableCell className="pl-0">
                        <p className="text-sm font-medium">{product.name}</p>
                        <p className="text-[11px] text-muted-foreground">{product.indexer}</p>
                      </TableCell>
                      <TableCell className="text-right font-semibold tabular-nums">
                        {product.rate.toLocaleString("pt-BR", {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                        <span className="ml-1 text-[11px] font-normal text-muted-foreground">% a.a.</span>
                      </TableCell>
                      <TableCell className="hidden text-right text-xs text-muted-foreground sm:table-cell">
                        {product.liquidity}
                      </TableCell>
                      <TableCell className="hidden pr-0 text-right md:table-cell">
                        <Badge
                          variant="outline"
                          className={cn(
                            "text-[10px]",
                            product.risk === "Baixo" && "border-emerald-500/30 text-emerald-600 dark:text-emerald-400"
                          )}
                        >
                          {product.risk}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            <div className="rounded-lg bg-muted/40 px-3 py-2 text-[11px] text-muted-foreground">
              Rentabilidade bruta estimada a partir dos indexadores do Banco Central. Pode variar conforme a
              instituição, a tributação e o prazo. Não é oferta nem recomendação.
            </div>

            {data && data.rates.length > 0 && (
              <p className="text-[11px] text-muted-foreground">
                Fontes: {data.rates[0]?.source} (SGS 432, 4389 e 433).
              </p>
            )}
          </>
        )}
      </CardContent>
    </Card>
  )
}
