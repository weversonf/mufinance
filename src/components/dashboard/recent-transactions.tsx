"use client"

import { useState } from "react"
import Link from "next/link"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useFinanceData } from "@/components/finance/finance-provider"
import { usePrivacy } from "@/components/privacy-toggle"
import { EditTransactionDialog } from "@/components/transactions/edit-transaction-dialog"
import {
  ChevronRightIcon,
} from "lucide-react"
import { cn } from "@/lib/utils"

const categoryColors: Record<string, string> = {
  Entertainment: "bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-400",
  Technology: "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-400",
  Income: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400",
  Design: "bg-pink-100 text-pink-700 dark:bg-pink-950 dark:text-pink-400",
  "AI Tools": "bg-orange-100 text-orange-700 dark:bg-orange-950 dark:text-orange-400",
  Productivity: "bg-sky-100 text-sky-700 dark:bg-sky-950 dark:text-sky-400",
}

export function RecentTransactions() {
  const { recentTransactions, fullTransactions, snapshot, bankAccounts, refresh } = useFinanceData()
  const { privacyMode } = usePrivacy()
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const selected = fullTransactions.find((transaction) => transaction.id === selectedId)
  function formatDate(value: string) {
    const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value)
    return match ? `${match[3]}/${match[2]}/${match[1]}` : value
  }
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle className="text-base font-semibold">
          Transações recentes
        </CardTitle>
        <Button render={<Link href="/transactions" />} nativeButton={false} variant="outline" size="sm" className="h-8 gap-1 text-xs">
          Ver todas
          <ChevronRightIcon className="size-3" />
        </Button>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <div className="min-w-0 space-y-1 sm:min-w-[600px] md:min-w-[800px]">
            {/* Header */}
            <div className="grid grid-cols-[minmax(90px,1fr)_minmax(120px,1.5fr)_100px_90px] gap-3 border-b pb-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
              <span>Categoria</span>
              <span>Descrição</span>
              <span className="text-right">Valor</span>
              <span>Data</span>
            </div>

            {/* Rows */}
            {recentTransactions.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 text-center">
                <p className="text-sm font-medium text-foreground">Nenhuma transação registrada ainda</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Use o botão + para adicionar seu primeiro lançamento.
                </p>
              </div>
            ) : (
              recentTransactions.map((tx) => (
                <button
                  key={tx.id}
                  type="button"
                  onClick={() => setSelectedId(tx.id)}
                  className="grid w-full grid-cols-[minmax(90px,1fr)_minmax(120px,1.5fr)_100px_90px] items-center gap-3 rounded-lg py-2.5 text-left transition-colors hover:bg-muted/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                    <Badge
                      variant="secondary"
                      className={cn(
                        "w-fit max-w-full truncate rounded-md px-1.5 text-[10px] font-medium",
                        categoryColors[tx.category]
                      )}
                    >
                      {tx.category}
                    </Badge>
                <span className="truncate text-sm font-medium">{tx.merchant}</span>

                {/* Valor */}
                <span
                  className={cn(
                    "text-right text-sm font-semibold tabular-nums truncate",
                    tx.amount > 0
                      ? "text-emerald-600 dark:text-emerald-400"
                      : "text-foreground"
                  )}
                >
                  {privacyMode ? "R$ •••••" : new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(tx.amount)}
                </span>

                {/* Date */}
                <span className="truncate text-xs text-muted-foreground">{formatDate(tx.date)}</span>
              </button>
            )))}
          </div>
        </div>
      </CardContent>
      <EditTransactionDialog transaction={selected ? { ...selected, ...(snapshot?.transactions.find((item) => item.id === selected.id) || {}) } : null} accountId={bankAccounts[0]?.id || ""} allTransactions={snapshot?.transactions ?? []} open={selectedId !== null} onOpenChange={(open) => { if (!open) setSelectedId(null) }} onSaved={refresh} />
    </Card>
  )
}
