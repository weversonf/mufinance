"use client"

import { useMemo, useState } from "react"

import { useFinanceData } from "@/components/finance/finance-provider"
import { EditTransactionDialog } from "@/components/transactions/edit-transaction-dialog"
import type { FullTransaction } from "@/data/seed"
import { TransactionSummary } from "@/components/transactions/transaction-summary"
import { TransactionFilters } from "@/components/transactions/transaction-filters"
import { TransactionTable } from "@/components/transactions/transaction-table"
import { TransactionActions } from "@/components/transactions/transaction-actions"
import { Button } from "@/components/ui/button"
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react"
import { usePrivacy } from "@/components/privacy-toggle"

const PAGE_SIZE = 20

export function TransactionsPageClient() {
  const { fullTransactions, snapshot, bankAccounts, refresh } = useFinanceData()
  const { privacyMode } = usePrivacy()
  const [search, setSearch] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")
  const [typeFilter, setTypeFilter] = useState("all")
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [selectionMode, setSelectionMode] = useState(false)
  const [selectedTransaction, setSelectedTransaction] = useState<FullTransaction | null>(null)
  const [month, setMonth] = useState(() => {
    const now = new Date()
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`
  })
  const [page, setPage] = useState(1)

  function changeMonth(offset: number) {
    const [year, currentMonth] = month.split("-").map(Number)
    const next = new Date(year, currentMonth - 1 + offset, 1)
    setMonth(`${next.getFullYear()}-${String(next.getMonth() + 1).padStart(2, "0")}`)
    setPage(1)
    setSelectedIds(new Set())
  }

  const categories = useMemo(() => {
    const categoryNames = new Set(fullTransactions.map((transaction) => transaction.category))
    return Array.from(categoryNames).sort()
  }, [fullTransactions])

  const filteredData = useMemo(() => {
    let data: FullTransaction[] = fullTransactions.filter((transaction) => transaction.date.startsWith(month))

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

    // Ordenação estrita: cronológica por data (do início do mês para o fim); e na mesma data, receitas primeiro
    data.sort((a, b) => {
      const dateCmp = a.date.localeCompare(b.date)
      if (dateCmp !== 0) return dateCmp
      const typeA = a.type === "income" ? 0 : 1
      const typeB = b.type === "income" ? 0 : 1
      return typeA - typeB
    })

    return data
  }, [categoryFilter, fullTransactions, month, search, statusFilter, typeFilter])

  const totalPages = Math.max(1, Math.ceil(filteredData.length / PAGE_SIZE))
  const currentPage = Math.min(page, totalPages)
  const pageData = filteredData.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE)
  const [year, monthNumber] = month.split("-").map(Number)
  const monthLabel = new Intl.DateTimeFormat("pt-BR", { month: "long", year: "numeric" }).format(new Date(year, monthNumber - 1, 1))
  const realized = filteredData.filter((transaction) => transaction.status === "completed").reduce((sum, transaction) => sum + transaction.amount, 0)
  const forecast = filteredData.filter((transaction) => transaction.status === "completed" || transaction.status === "pending").reduce((sum, transaction) => sum + transaction.amount, 0)
  const formatBalance = (value: number) => privacyMode ? "••••••" : value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })

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
      <div className="flex items-center justify-between gap-3 rounded-2xl border border-border/60 bg-card px-3 py-2 shadow-sm sm:mx-auto sm:min-w-80 sm:gap-5">
        <Button type="button" variant="ghost" size="icon" className="size-11 shrink-0 rounded-xl" aria-label="Mês anterior" onClick={() => changeMonth(-1)}><ChevronLeftIcon /></Button>
        <div className="min-w-0 text-center"><p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">Movimentações</p><p className="truncate text-sm font-semibold capitalize" aria-live="polite">{monthLabel}</p></div>
        <Button type="button" variant="ghost" size="icon" className="size-11 shrink-0 rounded-xl" aria-label="Próximo mês" onClick={() => changeMonth(1)}><ChevronRightIcon /></Button>
      </div>
      <TransactionSummary transactions={filteredData} />

      <div className="flex flex-col gap-3">
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

      <div className="flex justify-end"><Button type="button" variant="outline" size="sm" aria-pressed={selectionMode} onClick={() => { setSelectionMode(!selectionMode); setSelectedIds(new Set()) }}>{selectionMode ? "Concluir seleção" : "Selecionar várias"}</Button></div>

      <TransactionTable
        transactions={pageData}
        selectedIds={selectedIds}
        setSelectedIds={setSelectedIds}
        onEdit={setSelectedTransaction}
        selectionMode={selectionMode}
        onStartSelection={(id) => { setSelectionMode(true); setSelectedIds(new Set([id])) }}
      />

      {totalPages > 1 && <div className="flex items-center justify-end gap-3 text-sm">
        <span>Página {currentPage} de {totalPages} · {filteredData.length} lançamentos</span>
        <Button type="button" variant="outline" size="sm" disabled={currentPage === 1} onClick={() => { setPage(currentPage - 1); setSelectedIds(new Set()) }}>Anterior</Button>
        <Button type="button" variant="outline" size="sm" disabled={currentPage === totalPages} onClick={() => { setPage(currentPage + 1); setSelectedIds(new Set()) }}>Próxima</Button>
      </div>}

      <section aria-label="Resumo realizado e previsto" className="rounded-xl border bg-card p-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <div><p className="text-xs font-medium text-muted-foreground">Resultado realizado no mês</p><p className="mt-1 text-lg font-semibold tabular-nums">{formatBalance(realized)}</p><p className="mt-1 text-xs text-muted-foreground">Entradas menos despesas concluídas.</p></div>
          <div><p className="text-xs font-medium text-muted-foreground">Resultado previsto no mês</p><p className="mt-1 text-lg font-semibold tabular-nums">{formatBalance(forecast)}</p><p className="mt-1 text-xs text-muted-foreground">Concluídas e planejadas, considerando os filtros.</p></div>
        </div>
        <p className="mt-3 border-t pt-3 text-xs text-muted-foreground">Resultados dos lançamentos do período; não incluem o saldo inicial das contas.</p>
      </section>

      <EditTransactionDialog
        transaction={selectedTransaction ? { ...selectedTransaction, ...(snapshot?.transactions.find((item) => item.id === selectedTransaction.id) || {}) } : null}
        accountId={bankAccounts[0]?.id || "legacy-account"}
        allTransactions={snapshot?.transactions ?? []}
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
