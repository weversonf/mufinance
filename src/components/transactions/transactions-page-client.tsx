"use client"

import { useEffect, useMemo, useState } from "react"
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react"

import { useFinanceData } from "@/components/finance/finance-provider"
import { EditTransactionDialog } from "@/components/transactions/edit-transaction-dialog"
import type { FullTransaction } from "@/data/seed"
import { TransactionSummary } from "@/components/transactions/transaction-summary"
import { TransactionFilters } from "@/components/transactions/transaction-filters"
import { TransactionTable } from "@/components/transactions/transaction-table"
import { TransactionActions } from "@/components/transactions/transaction-actions"
import { Button } from "@/components/ui/button"

function monthKey(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`
}

function transactionMonthKey(dateValue: string) {
  const isoMatch = /^(\d{4})-(\d{2})/.exec(dateValue)
  if (isoMatch) return `${isoMatch[1]}-${isoMatch[2]}`

  const brMatch = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(dateValue)
  if (brMatch) return `${brMatch[3]}-${brMatch[2]}`

  const parsed = new Date(dateValue)
  return Number.isNaN(parsed.valueOf()) ? null : monthKey(parsed)
}

function shiftMonth(month: string, amount: number) {
  const [year, monthNumber] = month.split("-").map(Number)
  return monthKey(new Date(year, monthNumber - 1 + amount, 1))
}

function formatMonth(month: string) {
  const [year, monthNumber] = month.split("-").map(Number)
  const label = new Intl.DateTimeFormat("pt-BR", { month: "long", year: "numeric" }).format(new Date(year, monthNumber - 1, 1))
  return `${label.charAt(0).toUpperCase()}${label.slice(1)}`
}

export function TransactionsPageClient() {
  const { fullTransactions, snapshot, bankAccounts, refresh } = useFinanceData()
  const [search, setSearch] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")
  const [typeFilter, setTypeFilter] = useState("all")
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [selectedTransaction, setSelectedTransaction] = useState<FullTransaction | null>(null)
  const currentMonth = monthKey(new Date())
  const [selectedMonth, setSelectedMonth] = useState(currentMonth)
  const selectedMonthLabel = formatMonth(selectedMonth)

  useEffect(() => {
    setSelectedIds(new Set())
  }, [selectedMonth])

  const monthlyTransactions = useMemo(
    () => fullTransactions.filter((transaction) => transactionMonthKey(transaction.date) === selectedMonth),
    [fullTransactions, selectedMonth],
  )

  const categories = useMemo(() => {
    const categoryNames = new Set(monthlyTransactions.map((transaction) => transaction.category))
    return Array.from(categoryNames).sort()
  }, [monthlyTransactions])

  const filteredData = useMemo(() => {
    let data: FullTransaction[] = monthlyTransactions

    if (search) {
      const query = search.toLowerCase()
      data = data.filter(
        (transaction) =>
          transaction.merchant.toLowerCase().includes(query) ||
          transaction.transactionId.toLowerCase().includes(query) ||
          transaction.category.toLowerCase().includes(query),
      )
    }

    if (categoryFilter !== "all") {
      data = data.filter((transaction) => transaction.category === categoryFilter)
    }

    if (statusFilter !== "all") {
      data = data.filter((transaction) => transaction.status === statusFilter)
    }

    if (typeFilter !== "all") {
      data = data.filter((transaction) => transaction.type === typeFilter)
    }

    return data
  }, [categoryFilter, monthlyTransactions, search, statusFilter, typeFilter])

  const hasActiveFilters = Boolean(search) || categoryFilter !== "all" || statusFilter !== "all" || typeFilter !== "all"
  const emptyTitle = hasActiveFilters
    ? "Nenhuma transação encontrada"
    : `Nenhuma transação em ${selectedMonthLabel}`
  const emptyDescription = hasActiveFilters
    ? "Ajuste a pesquisa ou os filtros para ver os lançamentos deste mês."
    : "Use as setas para consultar outro mês ou adicione um novo lançamento."

  const [isDeleting, setIsDeleting] = useState(false)

  function handleExport() {
    const selected = fullTransactions.filter((transaction) => selectedIds.has(transaction.id))
    const header = "Descrição,ID da transação,Valor,Data,Status,Tipo"
    const rows = selected.map(
      (transaction) =>
        `"${transaction.merchant}","${transaction.transactionId}",${transaction.amount},"${transaction.date}","${transaction.status}","${transaction.type}"`,
    )
    const csv = [header, ...rows].join("\n")
    const blob = new Blob([csv], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    const anchor = document.createElement("a")
    anchor.href = url
    anchor.download = "transactions.csv"
    anchor.click()
    URL.revokeObjectURL(url)
  }

  async function handleDeleteSelected() {
    if (!window.confirm(`Tem certeza que deseja excluir ${selectedIds.size} transações selecionadas?\nOs saldos das contas também serão revertidos.`)) return
    
    setIsDeleting(true)
    try {
      const promises = Array.from(selectedIds).map((id) =>
        fetch(`/api/finance/transactions/${id}`, { method: "DELETE" })
      )
      const responses = await Promise.all(promises)
      if (responses.some((response) => !response.ok)) {
        throw new Error("Uma ou mais transações não puderam ser excluídas.")
      }
      setSelectedIds(new Set())
      await refresh()
    } catch (err) {
      alert("Erro ao excluir transações. Verifique o console.")
      console.error(err)
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <TransactionSummary transactions={filteredData} />

      <div className="flex flex-col gap-3">
        <nav
          aria-label="Navegação por mês das transações"
          className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-card px-3 py-2.5 ring-1 ring-foreground/10"
        >
          <div>
            <p className="text-xs text-muted-foreground">Transações de</p>
            <p className="text-sm font-semibold">{selectedMonthLabel}</p>
          </div>

          <div className="flex items-center gap-1">
            <Button
              type="button"
              variant="outline"
              size="icon-sm"
              onClick={() => setSelectedMonth((month) => shiftMonth(month, -1))}
              aria-label="Ver mês anterior"
            >
              <ChevronLeftIcon />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setSelectedMonth(currentMonth)}
              disabled={selectedMonth === currentMonth}
            >
              Mês atual
            </Button>
            <Button
              type="button"
              variant="outline"
              size="icon-sm"
              onClick={() => setSelectedMonth((month) => shiftMonth(month, 1))}
              aria-label="Ver próximo mês"
            >
              <ChevronRightIcon />
            </Button>
          </div>
        </nav>

        <TransactionFilters
          search={search}
          setSearch={setSearch}
          categoryFilter={categoryFilter}
          setCategoryFilter={setCategoryFilter}
          statusFilter={statusFilter}
          setStatusFilter={setStatusFilter}
          typeFilter={typeFilter}
          setTypeFilter={setTypeFilter}
          categories={categories}
        />
      </div>

      <TransactionTable
        transactions={filteredData}
        selectedIds={selectedIds}
        setSelectedIds={setSelectedIds}
        onEdit={setSelectedTransaction}
        emptyTitle={emptyTitle}
        emptyDescription={emptyDescription}
      />

      <EditTransactionDialog
        transaction={selectedTransaction ? { ...selectedTransaction, ...(snapshot?.transactions.find((item) => item.id === selectedTransaction.id) || {}) } : null}
        accountId={bankAccounts[0]?.id || "legacy-account"}
        open={selectedTransaction !== null}
        onOpenChange={(open) => { if (!open) setSelectedTransaction(null) }}
        onSaved={refresh}
      />

      <TransactionActions
        selectedCount={selectedIds.size}
        onExport={handleExport}
        onDelete={handleDeleteSelected}
        isDeleting={isDeleting}
        onClear={() => setSelectedIds(new Set())}
      />
    </div>
  )
}
