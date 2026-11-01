"use client"

import { useMemo, useState } from "react"

import { useFinanceData } from "@/components/finance/finance-provider"
import type { TransferRecord } from "@/data/seed"
import { cn } from "@/lib/utils"
import { TransferStats } from "@/components/transfers/transfer-stats"
import { TransferList } from "@/components/transfers/transfer-list"
import { QuickSend } from "@/components/transfers/quick-send"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { PlusIcon } from "lucide-react"

type TabKey = "all" | "sent" | "received" | "scheduled"

const tabs: { key: TabKey; label: string }[] = [
  { key: "all", label: "Todas" },
  { key: "sent", label: "Enviadas" },
  { key: "received", label: "Recebidas" },
  { key: "scheduled", label: "Agendadas" },
]

export function TransfersPageClient() {
  const { transferRecords } = useFinanceData()
  const [activeTab, setActiveTab] = useState<TabKey>("all")
  const [sendOpen, setSendOpen] = useState(false)
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

      <div className="flex items-center gap-1 overflow-x-auto rounded-lg bg-muted p-1" role="tablist" aria-label="Filtrar transferências">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setActiveTab(tab.key)}
            role="tab"
            aria-selected={activeTab === tab.key}
            className={cn(
              "shrink-0 rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
              activeTab === tab.key
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="relative min-h-[360px] overflow-hidden rounded-xl ring-1 ring-foreground/10 sm:min-h-[440px]">
        <TransferList transfers={filtered} hasAny={transfers.length > 0} onCancel={handleCancel} />
        <Button type="button" size="icon" className="absolute bottom-3 right-3 size-11 rounded-full shadow-lg" aria-label="Nova transferência" onClick={() => setSendOpen(true)}><PlusIcon className="size-5" /></Button>
      </div>
      <Dialog open={sendOpen} onOpenChange={setSendOpen}>
        <DialogContent className="max-h-[90dvh] overflow-y-auto sm:max-w-xl">
          <DialogHeader><DialogTitle>Nova transferência</DialogTitle><DialogDescription>Envie para outro usuário MuFinance.</DialogDescription></DialogHeader>
          <QuickSend onSend={(record) => setLocalTransfers((prev) => [record, ...prev])} />
        </DialogContent>
      </Dialog>
    </div>
  )
}
