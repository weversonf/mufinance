"use client"

import { useState } from "react"
import { usePathname } from "next/navigation"
import { PlusIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { AddTransactionDialog } from "@/components/transactions/add-transaction-dialog"
import { useFinanceData } from "@/components/finance/finance-provider"

export function GlobalAddTransaction() {
  const [open, setOpen] = useState(false)
  const { refresh } = useFinanceData()
  const pathname = usePathname()

  if (pathname !== "/dashboard" && pathname !== "/transactions") return null

  return (
    <>
      <Button 
        type="button"
        size="icon"
        onClick={() => setOpen(true)} 
        aria-label="Nova transação"
        className="fixed bottom-28 right-5 z-30 size-11 rounded-full shadow-lg md:bottom-6 md:right-6"
      >
        <PlusIcon className="size-5" />
      </Button>

      <AddTransactionDialog 
        open={open} 
        onOpenChange={setOpen} 
        onSaved={refresh} 
      />
    </>
  )
}
