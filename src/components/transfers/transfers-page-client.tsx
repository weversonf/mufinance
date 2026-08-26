"use client"

import { useMemo, useState } from "react"

import { useFinanceData } from "@/components/finance/finance-provider"
import type { TransferRecord } from "@/data/seed"
import { cn } from "@/lib/utils"
import { TransferStats } from "@/components/transfers/transfer-stats"
import { TransferList } from "@/components/transfers/transfer-list"
import { QuickSend } from "@/components/transfers/quick-send"

type TabKey = "all" | "sent" | "received" | "scheduled"

const tabs: { key: TabKey; label: string }[] = [
  { key: "all", label: "All" },
  { key: "sent", label: "Sent" },
  { key: "received", label: "Received" },
  { key: "scheduled", label: "Scheduled" },
]

export function TransfersPageClient() {
  const { transferRecords } = useFinanceData()
  const [activeTab, setActiveTab] = useState<TabKey>("all")
  const [localTransfers, setLocalTransfers] = useState<TransferRecord[]>([])
  const transfers = useMemo(() => [...localTransfers, ...transferRecords], [localTransfers, transferRecords])

  const filtered = useMemo(() => {
    if (activeTab === "all") return transfers
    return transfers.filter((transfer) => transfer.type === activeTab)
  }, [activeTab, transfers])

  function handleCancel(id: string) {
    setLocalTransfers((prev) => prev.filter((transfer) => transfer.id !== id))
  }

  return (
    <div className="flex flex-col gap-4">
      <TransferStats transfers={transfers} />

      <div className="flex items-center gap-1 rounded-lg bg-muted p-1">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setActiveTab(tab.key)}
            className={cn(
              "rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
              activeTab === tab.key
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <TransferList transfers={filtered} onCancel={handleCancel} />

      <QuickSend
        onSend={(record) => setLocalTransfers((prev) => [record, ...prev])}
      />
    </div>
  )
}
