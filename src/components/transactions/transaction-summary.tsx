import { ArrowDownLeftIcon, ArrowUpRightIcon, WalletIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import type { FullTransaction } from "@/data/seed"
import { usePrivacy } from "@/components/privacy-toggle"

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
  const { privacyMode } = usePrivacy()
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
      label: "Despesas",
      value: fmt(totalOut),
      icon: ArrowUpRightIcon,
      color: "text-rose-500",
      bg: "bg-rose-500/10",
    },
    {
      label: "Saldo do mês",
      value: fmt(totalIn - totalOut),
      icon: WalletIcon,
      color: "text-blue-500",
      bg: "bg-blue-500/10",
    },
  ]

  return (
    <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 sm:gap-3">
      {cards.map((card) => (
        <div
          key={card.label}
          className={cn("flex min-w-0 items-center gap-2.5 rounded-2xl border border-border/60 bg-card p-3 shadow-sm sm:gap-3 sm:p-4", card.label === "Saldo do mês" && "col-span-2 bg-blue-500/[0.06] sm:col-span-1")}
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
            <p className="text-xs font-medium text-muted-foreground">{card.label}</p>
            <p className="truncate tabular-nums text-sm font-semibold tracking-tight sm:text-base">
              {privacyMode ? "••••••" : card.value}
            </p>
          </div>
        </div>
      ))}
    </div>
  )
}
