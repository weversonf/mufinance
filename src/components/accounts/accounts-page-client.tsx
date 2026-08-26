"use client"

import { useMemo, useState } from "react"

import { useFinanceData } from "@/components/finance/finance-provider"
import { EditAccountDialog } from "@/components/accounts/edit-account-dialog"
import { cn } from "@/lib/utils"
import type { BankAccount } from "@/data/seed"
import { AccountSummary } from "@/components/accounts/account-summary"
import { AccountCard } from "@/components/accounts/account-grid"
import { AddAccount } from "@/components/accounts/add-account"
import { EmptyState } from "@/components/empty-state"

const filterTabs = [
  { value: "all", label: "All" },
  { value: "checking", label: "Checking" },
  { value: "savings", label: "Savings" },
  { value: "crypto", label: "Crypto" },
  { value: "investment", label: "Investment" },
] as const

type AccountType = (typeof filterTabs)[number]["value"]

export function AccountsPageClient() {
  const { bankAccounts, refresh } = useFinanceData()
  const [selectedType, setSelectedType] = useState<AccountType>("all")
  const [localAccounts, setLocalAccounts] = useState<BankAccount[]>([])
  const [selectedAccount, setSelectedAccount] = useState<BankAccount | null>(null)
  const accounts = useMemo(() => [...bankAccounts, ...localAccounts], [bankAccounts, localAccounts])

  const filtered = useMemo(
    () =>
      selectedType === "all"
        ? accounts
        : accounts.filter((account) => account.type === selectedType),
    [accounts, selectedType],
  )

  function handleAddAccount(account: BankAccount) {
    setLocalAccounts((prev) => [...prev, account])
  }

  return (
    <div className="flex flex-col gap-4">
      <AccountSummary accounts={accounts} />

      <div className="flex flex-wrap gap-1.5">
        {filterTabs.map((tab) => (
          <button
            key={tab.value}
            type="button"
            onClick={() => setSelectedType(tab.value)}
            className={cn(
              "rounded-lg px-3 py-1.5 text-sm font-medium transition-colors",
              selectedType === tab.value
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground",
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {filtered.length === 0 && (
        <EmptyState
          variant={accounts.length === 0 ? "accounts" : "filter"}
          title={accounts.length === 0 ? "No accounts linked" : "No accounts in this category"}
          description={
            accounts.length === 0
              ? "Connect your first account below to see balances and track spending."
              : "Try a different filter or link a new account below."
          }
          className="py-8"
        />
      )}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filtered.map((account, index) => (
          <AccountCard key={account.id} account={account} index={index} onSelect={setSelectedAccount} />
        ))}
        <AddAccount onAdd={handleAddAccount} />
      </div>

      <EditAccountDialog account={selectedAccount} open={selectedAccount !== null} onOpenChange={(open) => { if (!open) setSelectedAccount(null) }} onSaved={refresh} />
    </div>
  )
}
