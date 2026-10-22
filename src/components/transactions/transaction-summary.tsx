import { ArrowDownLeftIcon, ArrowUpRightIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import type { FullTransaction } from "@/data/seed"

interface TransactionSummaryProps {
  transactions: FullTransaction[]
}

const fmt = (n: number) =>
  new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 2,
  }).format(n)

export function TransactionSummary({ transactions }: TransactionSummaryProps) {
  const totalIn = transactions
    .filter((t) => t.type === "income")
    .reduce((s, t) => s + t.amount, 0)

  const totalOut = transactions
    .filter((t) => t.type === "expense")
    .reduce((s, t) => s + Math.abs(t.amount), 0)

  const cards = [
    {
      label: "Entradas",
      value: fmt(totalIn),
      icon: ArrowDownLeftIcon,
      color: "text-emerald-500",
      bg: "bg-emerald-500/10",
    },
    {
      label: "Saídas",
      value: fmt(totalOut),
      icon: ArrowUpRightIcon,
      color: "text-rose-500",
      bg: "bg-rose-500/10",
    },
  ]

  return (
    <div className="grid grid-cols-2 gap-3">
      {cards.map((card) => (
        <div
          key={card.label}
          className="flex items-center gap-3 rounded-xl bg-card p-3 ring-1 ring-foreground/10"
        >
          <div
            className={cn(
              "flex size-9 shrink-0 items-center justify-center rounded-full",
              card.bg
            )}
          >
            <card.icon className={cn("size-4", card.color)} />
          </div>
          <div className="min-w-0">
            <p className="text-xs text-muted-foreground">{card.label}</p>
            <p className="truncate tabular-nums text-base font-semibold tracking-tight">
              {card.value}
            </p>
          </div>
        </div>
      ))}
    </div>
  )
}
