"use client"

import { useMemo, useState } from "react"
import { PlusIcon } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Slider } from "@/components/ui/slider"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import type { CardData } from "@/data/seed"
import { PayBillDialog } from "@/components/cards/pay-bill-dialog"
import { useFinanceData } from "@/components/finance/finance-provider"

interface CardControlsProps {
  card: CardData
  frozen: boolean
  onToggleFreeze: () => void
  dailyLimit: number
  onDailyLimitChange: (val: number) => void
  onAddCard: () => void
}

function AddCardButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label="Adicionar cartão"
      className="group flex h-8 items-center overflow-hidden rounded-full bg-muted pl-2 pr-2 text-sm font-medium transition-all hover:bg-accent hover:pl-2.5 hover:pr-3 focus-visible:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      <PlusIcon className="size-4 shrink-0 transition-transform duration-300 group-hover:rotate-90 group-focus-visible:rotate-90" />
      <span className="max-w-0 overflow-hidden whitespace-nowrap opacity-0 transition-all duration-300 group-hover:ml-1.5 group-hover:max-w-32 group-hover:opacity-100 group-focus-visible:ml-1.5 group-focus-visible:max-w-32 group-focus-visible:opacity-100">
        Adicionar cartão
      </span>
    </button>
  )
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value)
}

export function CardControls({
  card,
  frozen,
  onToggleFreeze,
  dailyLimit,
  onDailyLimitChange,
  onAddCard,
}: CardControlsProps) {
  const { snapshot } = useFinanceData()
  const [payBillOpen, setPayBillOpen] = useState(false)

  const now = new Date()
  const currentMonthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`
  const [selectedInvoiceMonth, setSelectedInvoiceMonth] = useState(currentMonthKey)

  const invoiceOptions = useMemo(() => {
    const list = []
    for (let i = -3; i <= 4; i++) {
      const d = new Date(now.getFullYear(), now.getMonth() + i, 1)
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`
      const rawMonth = new Intl.DateTimeFormat("pt-BR", { month: "short" }).format(d)
      const cap = rawMonth.charAt(0).toUpperCase() + rawMonth.slice(1).replace(".", "")
      const label = i === 0 ? `${cap}/${d.getFullYear()} (Atual)` : `${cap}/${d.getFullYear()}`
      list.push({ key, label, monthName: `${cap}/${d.getFullYear()}` })
    }
    return list
  }, [now])

  const selectedOption = invoiceOptions.find((o) => o.key === selectedInvoiceMonth)

  const currentSpend = useMemo(() => {
    const txs = snapshot?.transactions ?? []
    const matching = txs.filter(
      (t) =>
        t.accountId === card.id &&
        t.type === "expense" &&
        String(t.date ?? "").startsWith(selectedInvoiceMonth)
    )

    if (matching.length === 0 && selectedInvoiceMonth === currentMonthKey) {
      return card.monthlySpend
    }

    return matching.reduce((sum, t) => {
      const val =
        typeof t.amount === "number"
          ? Math.abs(t.amount)
          : parseFloat(String(t.amount || 0).replace(",", ".")) || 0
      return sum + val
    }, 0)
  }, [snapshot?.transactions, card.id, card.monthlySpend, selectedInvoiceMonth, currentMonthKey])

  const spendPercent =
    card.monthlyLimit > 0
      ? Math.round((currentSpend / card.monthlyLimit) * 100)
      : 0

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0">
        <CardTitle>Controles do Cartão</CardTitle>
        <AddCardButton onClick={onAddCard} />
      </CardHeader>
      <CardContent className="space-y-6">
        {/* ❄️ Freeze Toggle ❄️ */}
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <p className="text-sm font-medium">Status do Cartão</p>
            <p
              className={cn(
                "text-xs",
                frozen ? "text-destructive font-medium" : "text-muted-foreground"
              )}
            >
              {frozen ? "Bloqueado" : "Ativo"}
            </p>
          </div>
          <Switch
            checked={frozen}
            onCheckedChange={(checked) => {
              if (checked !== frozen) onToggleFreeze()
            }}
          />
        </div>

        {/* 💸 Daily Limit 💸 */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium">Limite Diário</p>
            <span className="text-sm font-medium tabular-nums">
              {formatCurrency(dailyLimit)}
            </span>
          </div>
          <Slider
            value={[dailyLimit]}
            min={0}
            max={10000}
            step={100}
            onValueChange={(value) => {
              const v = Array.isArray(value) ? value[0] : value
              onDailyLimitChange(v)
            }}
          />
          <div className="flex justify-between text-xs text-muted-foreground tabular-nums">
            <span>R$ 0</span>
            <span>R$ 10.000</span>
          </div>
        </div>

        {/* 📊 Monthly Usage & Invoice Selector 📊 */}
        <div className="space-y-3">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <p className="text-sm font-medium">Fatura</p>
              <select
                value={selectedInvoiceMonth}
                onChange={(e) => setSelectedInvoiceMonth(e.target.value)}
                className="h-7 rounded-md border border-border/70 bg-background px-2 text-xs font-medium text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              >
                {invoiceOptions.map((opt) => (
                  <option key={opt.key} value={opt.key}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
            <span className="text-xs text-muted-foreground tabular-nums">
              {spendPercent}% do limite
            </span>
          </div>

          <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
            <div
              className={cn(
                "h-full rounded-full transition-all",
                spendPercent >= 90
                  ? "bg-destructive"
                  : spendPercent >= 70
                  ? "bg-amber-500"
                  : "bg-primary"
              )}
              style={{ width: `${Math.min(spendPercent, 100)}%` }}
            />
          </div>

          <div className="flex justify-between text-xs text-muted-foreground tabular-nums">
            <span className="font-medium text-foreground">{formatCurrency(currentSpend)}</span>
            <span>Limite: {formatCurrency(card.monthlyLimit)}</span>
          </div>

          <Button
            className="mt-2 w-full"
            variant="secondary"
            disabled={currentSpend <= 0}
            onClick={() => setPayBillOpen(true)}
          >
            Pagar Fatura {selectedOption ? `(${selectedOption.monthName})` : ""}
          </Button>
        </div>

        {/* 🏷️ Card Info 🏷️ */}
        <div className="space-y-2">
          <p className="text-sm font-medium">Informações do Cartão</p>
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant={card.type === "virtual" ? "secondary" : "outline"}>
              {card.type === "virtual" ? "Virtual" : "Físico"}
            </Badge>
            <Badge variant="outline" className="uppercase">
              {card.network}
            </Badge>
            <span className="text-xs text-muted-foreground tabular-nums">
              **** {card.last4}
            </span>
          </div>
        </div>
      </CardContent>

      <PayBillDialog
        open={payBillOpen}
        onOpenChange={setPayBillOpen}
        card={card}
        amountOverride={currentSpend}
        invoiceLabel={selectedOption?.monthName}
      />
    </Card>
  )
}
