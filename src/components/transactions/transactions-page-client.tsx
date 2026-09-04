"use client"

import { useMemo, useState } from "react"

import { useFinanceData } from "@/components/finance/finance-provider"
import { EditTransactionDialog } from "@/components/transactions/edit-transaction-dialog"
import { AddTransactionDialog } from "@/components/transactions/add-transaction-dialog"
import type { FullTransaction } from "@/data/seed"
import { TransactionSummary } from "@/components/transactions/transaction-summary"
import { TransactionFilters } from "@/components/transactions/transaction-filters"
import { TransactionTable } from "@/components/transactions/transaction-table"
import { TransactionActions } from "@/components/transactions/transaction-actions"
import { Button } from "@/components/ui/button"

export function TransactionsPageClient() {
  const { fullTransactions, snapshot, bankAccounts, refresh } = useFinanceData()
  const [search, setSearch] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")
  const [typeFilter, setTypeFilter] = useState("all")
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [selectedTransaction, setSelectedTransaction] = useState<FullTransaction | null>(null)

  const categories = useMemo(() => {
    const categoryNames = new Set(fullTransactions.map((transaction) => transaction.category))
    return Array.from(categoryNames).sort()
  }, [fullTransactions])

  const filteredData = useMemo(() => {
    let data: FullTransaction[] = fullTransactions

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
  }, [categoryFilter, fullTransactions, search, statusFilter, typeFilter])

  const [addDialogOpen, setAddDialogOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  function handleExport() {
    const selected = fullTransactions.filter((transaction) => selectedIds.has(transaction.id))
    const header = "Merchant,ID da transação,Valor,Date,Status,Type"
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
      await Promise.all(promises)
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

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
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
        <Button onClick={() => setAddDialogOpen(true)} className="shrink-0 gap-2">
          Nova Transação
        </Button>
      </div>

      <TransactionTable
        transactions={filteredData}
        selectedIds={selectedIds}
        setSelectedIds={setSelectedIds}
        onEdit={setSelectedTransaction}
      />

      <AddTransactionDialog 
        open={addDialogOpen} 
        onOpenChange={setAddDialogOpen} 
        onSaved={refresh} 
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
