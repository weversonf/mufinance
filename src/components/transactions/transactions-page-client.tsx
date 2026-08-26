"use client"

import { useMemo, useState } from "react"

import { useFinanceData } from "@/components/finance/finance-provider"
import { EditTransactionDialog } from "@/components/transactions/edit-transaction-dialog"
import type { FullTransaction } from "@/data/seed"
import { TransactionSummary } from "@/components/transactions/transaction-summary"
import { TransactionFilters } from "@/components/transactions/transaction-filters"
import { TransactionTable } from "@/components/transactions/transaction-table"
import { TransactionActions } from "@/components/transactions/transaction-actions"

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

  function handleExport() {
    const selected = fullTransactions.filter((transaction) => selectedIds.has(transaction.id))
    const header = "Merchant,Transaction ID,Amount,Date,Status,Type"
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

  return (
    <div className="flex flex-col gap-4">
      <TransactionSummary transactions={filteredData} />

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

      <TransactionTable
        transactions={filteredData}
        selectedIds={selectedIds}
        setSelectedIds={setSelectedIds}
        onEdit={setSelectedTransaction}
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
        onClear={() => setSelectedIds(new Set())}
      />
    </div>
  )
}
