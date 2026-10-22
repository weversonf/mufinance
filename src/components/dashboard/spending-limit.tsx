"use client"

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { useFinanceData } from "@/components/finance/finance-provider"
import { usePrivacy } from "@/components/privacy-toggle"
import { ShieldCheckIcon, SparklesIcon } from "lucide-react"

const brl = (n: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", minimumFractionDigits: 2 }).format(n)

export function SpendingLimit() {
  const { spendingLimit } = useFinanceData()
  const { privacyMode } = usePrivacy()
  const percentUsed = spendingLimit.budget > 0 ? Math.round((spendingLimit.spent / spendingLimit.budget) * 100) : 0

  const now = new Date()
  const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate()
  const daysRemaining = Math.max(1, daysInMonth - now.getDate() + 1)
  const dailySafeToSpend = Math.max(0, spendingLimit.remaining / daysRemaining)

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-base font-semibold">
          Limite Mensal de Gastos
        </CardTitle>
        <div className="flex size-8 items-center justify-center rounded-lg bg-muted">
          <ShieldCheckIcon className="size-4 text-muted-foreground" />
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <p className="text-xs text-muted-foreground">Orçamento</p>
          <p className="text-2xl font-bold tabular-nums tracking-tight">
            {privacyMode ? "R$ •••••" : brl(spendingLimit.budget)}
          </p>
        </div>

        <Progress value={percentUsed} className="h-2" aria-label="Percentual do orçamento mensal utilizado" />

        <div className="flex items-center justify-between text-sm">
          <div>
            <p className="text-xs text-muted-foreground">Gasto</p>
            <p className="font-semibold tabular-nums">
              {privacyMode ? "R$ •••••" : brl(spendingLimit.spent)}
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs text-muted-foreground">Disponível</p>
            <p className="font-semibold tabular-nums text-emerald-600 dark:text-emerald-400">
              {privacyMode ? "R$ •••••" : brl(spendingLimit.remaining)}
            </p>
          </div>
        </div>

        {/* Insight inteligente: Livre para gastar por dia */}
        <div className="flex items-center justify-between rounded-lg border border-primary/20 bg-primary/5 p-2.5">
          <div className="flex items-center gap-2">
            <div className="flex size-6 items-center justify-center rounded-full bg-primary/10 text-primary">
              <SparklesIcon className="size-3.5" />
            </div>
            <div>
              <p className="text-[11px] font-medium text-muted-foreground">Livre para gastar hoje</p>
              <p className="text-sm font-bold text-foreground">
                {privacyMode ? "R$ •••••" : brl(dailySafeToSpend)}
                <span className="text-[10px] font-normal text-muted-foreground"> / dia ({daysRemaining} dias restantes)</span>
              </p>
            </div>
          </div>
        </div>

        <p className="text-xs text-muted-foreground">
          Período: {spendingLimit.periodStart || "Mês atual"} - {spendingLimit.periodEnd || "Fechamento"}
        </p>
      </CardContent>
    </Card>
  )
}
