import { TransactionsPageClient } from "@/components/transactions/transactions-page-client"

export default function Page() {
  return (
    <div className="flex min-w-0 flex-1 flex-col gap-3 p-3 pt-0 sm:gap-4 sm:p-4 sm:pt-0">
      <TransactionsPageClient />
    </div>
  )
}
