"use client"

import * as React from "react"

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { EmptyState } from "@/components/empty-state"
import { formatMonthKey, useAnalyticsMonth } from "@/components/analytics/analytics-month"
import { useAnalyticsData } from "@/components/analytics/use-analytics-data"
import { useFinanceData } from "@/components/finance/finance-provider"
import { EditTransactionDialog } from "@/components/transactions/edit-transaction-dialog"
import { cn } from "@/lib/utils"

const WEEKDAYS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"]

const currency = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" })

function formatBRL(value: number) {
  return currency.format(value)
}

function longDate(date: string) {
  return new Date(`${date}T12:00:00`).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  })
}

function statusLabel(status: unknown) {
  if (status === "completed") return "Efetivado"
  if (status === "pending") return "Pendente"
  if (status === "planned") return "Planejado"
  return ""
}

function editableStatus(status: unknown): "completed" | "pending" | "planned" {
  if (status === "completed") return "completed"
  if (status === "planned") return "planned"
  return "pending"
}

export function SpendingHeatmap() {
  const { month } = useAnalyticsMonth()
  const { dailyTotals, monthTransactions } = useAnalyticsData()
  const { snapshot, bankAccounts, refresh } = useFinanceData()
  const [selectedDate, setSelectedDate] = React.useState<string | null>(null)
  const [selectedTransactionId, setSelectedTransactionId] = React.useState<string | null>(null)

  const calendar = React.useMemo(() => {
    const [year, monthNumber] = month.split("-").map(Number)
    const firstDay = new Date(year, (monthNumber ?? 1) - 1, 1)
    const daysInMonth = new Date(year, monthNumber ?? 1, 0).getDate()
    const startWeekday = firstDay.getDay()
    const lookup = new Map(dailyTotals.map((day) => [day.date, day]))

    const now = new Date()
    const todayKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`

    const cells: Array<{
      day: number
      date: string
      income: number
      expense: number
      balance: number
      hasValues: boolean
      isToday: boolean
    } | null> = []
    for (let index = 0; index < startWeekday; index++) cells.push(null)
    for (let day = 1; day <= daysInMonth; day++) {
      const date = `${month}-${String(day).padStart(2, "0")}`
      const totals = lookup.get(date)
      const income = totals?.income ?? 0
      const expense = totals?.expense ?? 0
      cells.push({
        day,
        date,
        income,
        expense,
        balance: income - expense,
        hasValues: income > 0 || expense > 0,
        isToday: date === todayKey,
      })
    }

    const totalIncome = dailyTotals.reduce((sum, day) => sum + day.income, 0)
    const totalExpense = dailyTotals.reduce((sum, day) => sum + day.expense, 0)

    return { cells, totalIncome, totalExpense, totalBalance: totalIncome - totalExpense }
  }, [month, dailyTotals])

  const selectedTransactions = React.useMemo(() => {
    if (!selectedDate) return []
    return monthTransactions.filter(
      (transaction) => String(transaction.date ?? "").slice(0, 10) === selectedDate
    )
  }, [monthTransactions, selectedDate])

  const selectedTotals = React.useMemo(
    () => dailyTotals.find((day) => day.date === selectedDate) ?? null,
    [dailyTotals, selectedDate]
  )

  const editingTransaction = React.useMemo(() => {
    if (!selectedTransactionId) return null
    const raw = (snapshot?.transactions ?? []).find((transaction) => transaction.id === selectedTransactionId)
    if (!raw) return null
    return {
      ...raw,
      id: raw.id,
      merchant: String(raw.payee ?? raw.category ?? "Sem descrição"),
      transactionId: raw.id,
      amount: Math.abs(Number(raw.amount) || 0),
      date: String(raw.date ?? "").slice(0, 10),
      logo: "/icon.svg",
      category: String(raw.category ?? "Sem categoria"),
      status: editableStatus(raw.status),
      type: raw.type === "income" ? ("income" as const) : ("expense" as const),
      notes: raw.notes ? String(raw.notes) : undefined,
    }
  }, [selectedTransactionId, snapshot])

  return (
    <Card className="border-border/60 bg-muted/20 shadow-none">
      <CardHeader className="px-4 py-3">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle className="text-sm font-medium text-muted-foreground">Calendário de gastos</CardTitle>
            <CardDescription className="text-[11px]">
              Receitas, despesas e saldo de cada dia em {formatMonthKey(month).toLowerCase()}.
            </CardDescription>
          </div>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] tabular-nums">
            <span className="text-emerald-600 dark:text-emerald-400">+ {formatBRL(calendar.totalIncome)}</span>
            <span className="text-rose-600 dark:text-rose-400">− {formatBRL(calendar.totalExpense)}</span>
            <span className="font-medium text-foreground/80">= {formatBRL(calendar.totalBalance)}</span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="px-4 pb-4 pt-0">
        {dailyTotals.length === 0 ? (
          <EmptyState
            variant="analytics"
            title="Sem movimentação neste mês"
            description="As receitas, despesas e o saldo de cada dia aparecerão aqui após registrar transações."
            className="py-6"
          />
        ) : (
          <div className="overflow-x-auto">
            <div className="min-w-[620px]">
              <div className="grid grid-cols-7 gap-1 pb-1 text-center text-[10px] text-muted-foreground/60">
                {WEEKDAYS.map((weekday) => (
                  <span key={weekday}>{weekday}</span>
                ))}
              </div>
              <TooltipProvider delay={0}>
                <div className="grid grid-cols-7 gap-1">
                  {calendar.cells.map((cell, index) => {
                    if (!cell) return <div key={`empty-${index}`} className="min-h-[74px] rounded-md" />
                    return (
                      <Tooltip key={cell.date}>
                        <TooltipTrigger
                          render={
                            <button
                              type="button"
                              aria-haspopup={cell.hasValues ? "dialog" : undefined}
                              aria-label={
                                cell.hasValues
                                  ? `${longDate(cell.date)}: receitas ${formatBRL(cell.income)}, despesas ${formatBRL(cell.expense)}, saldo ${formatBRL(cell.balance)}. Abrir extrato do dia.`
                                  : `${longDate(cell.date)}: sem movimentação`
                              }
                              onClick={() => {
                                if (cell.hasValues) setSelectedDate(cell.date)
                              }}
                              className={cn(
                                "flex min-h-[74px] flex-col rounded-md border border-border/40 p-1.5 text-left transition-colors",
                                cell.hasValues
                                  ? "cursor-pointer bg-background/40 hover:border-border hover:bg-background/70"
                                  : "cursor-default bg-transparent",
                                cell.isToday && "ring-1 ring-primary/40"
                              )}
                            />
                          }
                        >
                          <span
                            className={cn(
                              "self-end text-[10px] tabular-nums",
                              cell.isToday ? "font-semibold text-primary" : "text-muted-foreground/60"
                            )}
                          >
                            {cell.day}
                          </span>
                          {cell.hasValues && (
                            <span className="mt-auto block space-y-0.5">
                              {cell.income > 0 && (
                                <span className="block truncate text-[9px] font-medium leading-tight text-emerald-600 dark:text-emerald-400">
                                  + {formatBRL(cell.income)}
                                </span>
                              )}
                              {cell.expense > 0 && (
                                <span className="block truncate text-[9px] font-medium leading-tight text-rose-600 dark:text-rose-400">
                                  − {formatBRL(cell.expense)}
                                </span>
                              )}
                              <span className="block truncate text-[9px] font-medium leading-tight text-foreground/70">
                                = {formatBRL(cell.balance)}
                              </span>
                            </span>
                          )}
                        </TooltipTrigger>
                        <TooltipContent>
                          <div className="space-y-0.5 tabular-nums">
                            <p className="font-medium">{longDate(cell.date)}</p>
                            {cell.hasValues ? (
                              <>
                                {cell.income > 0 && (
                                  <p className="text-emerald-600 dark:text-emerald-400">+ {formatBRL(cell.income)}</p>
                                )}
                                {cell.expense > 0 && (
                                  <p className="text-rose-600 dark:text-rose-400">− {formatBRL(cell.expense)}</p>
                                )}
                                <p>= {formatBRL(cell.balance)}</p>
                              </>
                            ) : (
                              <p className="text-muted-foreground">Sem movimentação</p>
                            )}
                          </div>
                        </TooltipContent>
                      </Tooltip>
                    )
                  })}
                </div>
              </TooltipProvider>
            </div>
          </div>
        )}
      </CardContent>

      {selectedTransactionId === null && (
        <Dialog
          open={selectedDate !== null}
          onOpenChange={(open) => {
            if (!open) setSelectedDate(null)
          }}
        >
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {selectedDate ? `Extrato de ${longDate(selectedDate)}` : "Extrato do dia"}
            </DialogTitle>
            <DialogDescription>
              {selectedTransactions.length === 1
                ? "1 lançamento neste dia"
                : `${selectedTransactions.length} lançamentos neste dia`}
              {" · "}clique em um lançamento para editar
            </DialogDescription>
          </DialogHeader>

          {selectedTotals && (
            <div className="grid grid-cols-3 gap-2">
              <div className="rounded-lg border bg-muted/30 px-3 py-2">
                <p className="text-[10px] uppercase tracking-wide text-muted-foreground">Receitas</p>
                <p className="mt-0.5 truncate text-sm font-semibold tabular-nums text-emerald-600 dark:text-emerald-400">
                  {formatBRL(selectedTotals.income)}
                </p>
              </div>
              <div className="rounded-lg border bg-muted/30 px-3 py-2">
                <p className="text-[10px] uppercase tracking-wide text-muted-foreground">Despesas</p>
                <p className="mt-0.5 truncate text-sm font-semibold tabular-nums text-rose-600 dark:text-rose-400">
                  {formatBRL(selectedTotals.expense)}
                </p>
              </div>
              <div className="rounded-lg border bg-muted/30 px-3 py-2">
                <p className="text-[10px] uppercase tracking-wide text-muted-foreground">Saldo</p>
                <p className="mt-0.5 truncate text-sm font-semibold tabular-nums text-foreground">
                  {formatBRL(selectedTotals.balance)}
                </p>
              </div>
            </div>
          )}

          <ul className="-mx-1 max-h-72 divide-y divide-border/60 overflow-y-auto pr-1">
            {selectedTransactions.map((transaction) => {
              const income = transaction.type === "income"
              const status = statusLabel(transaction.status)
              return (
                <li key={transaction.id}>
                  <button
                    type="button"
                    onClick={() => setSelectedTransactionId(transaction.id)}
                    className="flex w-full items-center justify-between gap-3 px-1 py-2.5 text-left transition-colors hover:bg-muted/50"
                  >
                    <span className="min-w-0">
                      <span className="block truncate text-sm font-medium">
                        {String(transaction.payee || transaction.category || "Sem descrição")}
                      </span>
                      <span className="block truncate text-[11px] text-muted-foreground">
                        {String(transaction.category ?? "Sem categoria")}
                        {status ? ` · ${status}` : ""}
                      </span>
                    </span>
                    <span
                      className={cn(
                        "shrink-0 text-sm font-semibold tabular-nums",
                        income ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"
                      )}
                    >
                      {income ? "+" : "−"} {formatBRL(Math.abs(Number(transaction.amount) || 0))}
                    </span>
                  </button>
                </li>
              )
            })}
          </ul>
          </DialogContent>
        </Dialog>
      )}

      <EditTransactionDialog
        transaction={editingTransaction}
        accountId={String(
          snapshot?.transactions.find((transaction) => transaction.id === selectedTransactionId)?.accountId ??
            bankAccounts[0]?.id ??
            ""
        )}
        allTransactions={snapshot?.transactions ?? []}
        open={editingTransaction !== null}
        onOpenChange={(open) => {
          if (!open) setSelectedTransactionId(null)
        }}
        onSaved={refresh}
      />
    </Card>
  )
}
